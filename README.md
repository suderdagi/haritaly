# Haritaly

Haritaly is a social map app. You save the places you like (a café, a park, a restaurant) with notes, a rating and photos, and you see the places your friends saved around you.

The repository has two parts:

| Folder | What it is | Stack |
| --- | --- | --- |
| [`backend/`](backend) | REST API and website (privacy policy, terms, support) | Next.js 15 route handlers, TypeScript, Prisma, PostgreSQL, JWT, Zod, Vitest, OpenAI API, Vercel Blob |
| [`mobile/`](mobile) | iOS / Android app | React Native, Expo 54, Expo Router, react-native-maps, Reanimated, Gesture Handler, Bottom Sheet, EAS Build |

## Features

- Sign up and log in with email and password (bcrypt + JWT)
- Save a place where you are, where you dropped a pin, or anywhere you find with the location picker (address search or moving a pin), with category, rating, favorite food/drink, notes and photos
- Share a place with your friends or keep it private, visible only to you
- Edit or delete your own places
- Find people by name or email, send friend requests, accept or reject them, and open a friend's profile to see the places they share
- **The map:** Apple's muted map style with markers that tell your places (solid eucalyptus) from friends' (lavender edge with the friend's avatar) and show the category; a place saved by several friends becomes one marker, and its sheet shows what each of them said; markers close together merge into clusters; search, an All / Yours / Friends switch, category filters, and a floating sheet with the places around you
- **Who recommended it:** every place leads with the person behind it: their avatar, "Mert's pick", their stars, note and what to order
- See friends' places in the area shown on the map; panning loads the places saved there
- Add your own or friends' places to favorites
- **AI summary:** one tap summarizes what you and your friends saved about a place (ratings, notes, favorite food and drinks) with an LLM, after the user agrees to share the notes with OpenAI
- Places are only visible to you and your friends, and private places only to you
- **Privacy & visibility:** one screen explains location access, sets who sees new places by default, and links to blocked people, the policies and account deletion. Location is explained before iOS asks, used only while the app is open, and never shown to friends
- **Safety:** report a friend's place or note and block its author from the map sheet or the place page, or block someone from their profile (blocking ends the friendship, stops requests and hides each other from search); manage blocked users
- **Account deletion** inside the app, which removes every place, photo and friendship

## Design

The app has its own design system: a warm neutral base (ivory, stone, charcoal) with four muted accents that each carry one meaning, a type scale on SF Pro, spacing, radius, shadow and motion tokens, and shared components. Every screen is built from them. See [docs/design-system.md](docs/design-system.md).

## Architecture

```
mobile (Expo)  ──HTTP/JSON + Bearer token──▶  backend (Next.js API)  ──Prisma──▶  PostgreSQL
```

**Backend layout**

```
backend/
├── prisma/
│   ├── schema.prisma        # User, Place, Photo, Friendship, Favorite, AiSummary, Block, Report
│   └── migrations/
├── src/
│   ├── app/api/             # one folder per endpoint (route.ts)
│   ├── app/privacy, terms, support   # public pages linked from the app and the App Store listing
│   └── lib/
│       ├── http.ts          # requireAuth, ok/fail response helpers
│       ├── friends.ts       # friendship rules (send, accept, reject, remove)
│       ├── places.ts        # who can see / change a place
│       ├── geo.ts           # Haversine distance, bounding box
│       ├── llm.ts           # OpenAI client (fetch, structured JSON output, timeout)
│       ├── summaries.ts     # AI place summary: matching, prompt, validation, cache
│       ├── validators.ts    # Zod schemas for every request body
│       ├── storage.ts       # photo storage: Vercel Blob in production, local disk in development
│       ├── blocks.ts        # blocking rules
│       ├── account.ts       # account deletion
│       └── errors.ts        # typed errors mapped to HTTP status codes
├── scripts/
│   ├── vercel-build.sh      # Vercel build: prisma migrate deploy + next build
│   └── seed-demo.mjs        # demo accounts and places through the API (App Review, screenshots)
└── tests/                   # unit + integration tests
```

Route handlers stay small: they authenticate, validate the input with Zod and call a function in `src/lib`. Business rules (for example "only the receiver can accept a request") live in `src/lib` so they are easy to test and reuse.

**How nearby search works**

Calculating the distance to every place in the database would get slow as the table grows. The `/places/nearby` endpoint first narrows the rows with a bounding box query on the indexed `latitude`/`longitude` columns, then calculates the exact distance with the Haversine formula only for those candidates, filters by radius and sorts by distance.

**How the AI summary works**

Friends often save the same café separately, each with their own rating and notes. `GET /api/places/:id/summary` turns those entries into a short summary:

1. **Find the entries.** Places saved by you or your friends within 100 m whose names match (`Kronotrop` matches `Kronotrop Cihangir`; case, Turkish characters and punctuation are ignored). Strangers' entries are never included.
2. **Build the prompt.** Friends are labeled "Friend 1", "Friend 2", so no names or emails are sent to the AI provider. The system prompt tells the model to use only the given entries and to treat them as data, not instructions.
3. **Ask for structured output.** The OpenAI request uses a JSON Schema (`summary`, `highlights`, `mustTry`), and the answer is validated again with Zod. A malformed answer returns 502 and is never cached.
4. **Cache it.** The result is stored in the `AiSummary` table, keyed by a SHA-256 hash of the prompt, model and prompt version. Opening the same place again costs no API call; when a friend edits an entry, the hash changes and a fresh summary is generated.

Other details: a 15-second timeout, no API call when there is nothing to summarize, and the app only requests a summary when the user taps the button. The first time, the app explains what is sent to OpenAI and asks for permission (App Store guideline 5.1.2(i)); the choice can be changed in Profile. Without `OPENAI_API_KEY` the endpoint returns 503, `GET /api/config` reports `aiSummary: false` and the app hides the card. Tests mock the model and check permissions, matching, caching and validation.

## API

All endpoints except register, login, health and config require `Authorization: Bearer <token>`.
Responses have the shape `{ "success": true, "data": ... }` or `{ "success": false, "error": "..." }`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, returns a JWT |
| GET / PUT / DELETE | `/api/users/profile` | Current user's profile / edit / delete the account (`{ password }`) |
| GET | `/api/users/search?q=` | Find people to add |
| GET | `/api/users/:id` | Public profile |
| GET | `/api/users/:id/places` | A friend's shared places (all of them for yourself) |
| POST / DELETE | `/api/users/:id/block` | Block / unblock a user |
| GET | `/api/users/blocked` | Users I blocked |
| GET / POST | `/api/places` | My places / save a place (`isPrivate: true` keeps it to yourself) |
| GET / PUT / DELETE | `/api/places/:id` | Place details / edit / delete |
| GET | `/api/places/nearby?lat=&lng=&radius=` | Friends' places nearby |
| GET | `/api/places/search?q=` | Search my and my friends' places |
| GET / POST | `/api/places/:id/photos` | List / upload photos |
| GET | `/api/places/:id/summary` | AI summary of your and your friends' entries for this place |
| POST / DELETE | `/api/places/:id/favorite` | Add / remove favorite |
| POST | `/api/places/:id/report` | Report a friend's place (`{ reason }`) |
| GET | `/api/favorites` | My favorites |
| GET / POST / DELETE | `/api/friends` | Friends / send request / remove |
| GET | `/api/friends/requests` | Incoming requests |
| POST | `/api/friends/:id/accept` | Accept a request |
| POST | `/api/friends/:id/reject` | Reject a request |
| GET | `/api/health` | Health check (includes database) |
| GET | `/api/config` | Optional features enabled on the server |

## Running locally

**Requirements:** Node.js 20+, PostgreSQL 14+, and the Expo Go app or an iOS/Android simulator.

### Backend

```bash
cd backend
cp .env.example .env        # fill in DATABASE_URL, DIRECT_URL, JWT_SECRET (and OPENAI_API_KEY for AI summaries)
npm install
npx prisma migrate dev      # creates the tables
npm run dev                 # http://localhost:3000
```

### Mobile

```bash
cd mobile
cp .env.example .env        # point EXPO_PUBLIC_API_URL to the backend
npm install
npm start
```

On a physical phone, `localhost` means the phone itself, so use your computer's local IP address in `EXPO_PUBLIC_API_URL`. The App Store version of Expo Go only runs the newest Expo SDK, so to try this SDK 54 project on a phone use a simulator or an EAS build (TestFlight, or `eas build --profile preview` for an Android APK).

## Tests

```bash
cd backend
npm test
```

- **Unit tests** cover distance calculation, request validation, place name matching, the prompt and the LLM client (with a mocked `fetch`).
- **Integration tests** call the real route handlers against a PostgreSQL database and check the main flows: auth, place permissions, friend requests, nearby search, favorites, the AI summary (with the model mocked), account deletion, blocking and reporting. Point `DATABASE_URL` to a separate test database, because the tests clear the tables.

GitHub Actions runs type checks, tests and the production build of the backend, and for the app a type check, an Expo SDK version check and a JavaScript bundle build, on every push to `main`.

## Deployment

### Backend on Vercel

The backend is a standard Next.js app, deployed from the `backend/` folder:

1. Import the repository on Vercel and set **Root Directory** to `backend`.
2. Add `JWT_SECRET` (a long random string) and `SUPPORT_EMAIL` in **Settings → Environment Variables**. Optionally add `OPENAI_API_KEY`.
3. In **Storage**, create a **Neon** Postgres database (region Frankfurt) and a **Blob** store with **Public** access, and connect both to the project. They add `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `BLOB_STORE_ID` (the Blob SDK signs in with the deployment's OIDC token; older stores add `BLOB_READ_WRITE_TOKEN` instead).
4. Redeploy. Check `https://<project>.vercel.app/api/health`.

[`vercel.json`](backend/vercel.json) runs [`scripts/vercel-build.sh`](backend/scripts/vercel-build.sh), which applies pending migrations with `prisma migrate deploy` before `next build`, but only for production deployments, so a preview deployment of an unmerged branch never changes the real database. Functions run in `fra1` (Frankfurt), next to the database.

Photos are stored in Vercel Blob because a serverless file system is read-only and reset on every deployment. Without a connected store (local development) they go to `public/uploads`. The app resizes photos to at most 1600 px and uploads them one per request, which keeps each request below Vercel's 4.5 MB body limit.

Demo data for App Review and screenshots is created through the public API, so it needs no database access:

```bash
cd backend
DEMO_PASSWORD='choose-a-password' node scripts/seed-demo.mjs https://<project>.vercel.app/api
```

### Reviewing reports

Reports are stored in the `Report` table. In the Neon SQL editor:

```sql
SELECT r.id, r.reason, r.details, r."createdAt", p.name, p.notes, p."userId"
FROM "Report" r JOIN "Place" p ON p.id = r."placeId"
WHERE r.status = 'OPEN' ORDER BY r."createdAt";

-- Remove the content and close the report
DELETE FROM "Place" WHERE id = <placeId>;   -- its reports are removed with it
UPDATE "Report" SET status = 'RESOLVED' WHERE id = <reportId>;
```

### App on the App Store (EAS)

The app is built and submitted with [EAS](https://docs.expo.dev/build/introduction/), so no Mac is needed:

```bash
cd mobile
npx eas-cli login
npx eas-cli init                 # links the project, adds extra.eas.projectId to app.json
npm run build:ios                # production build; signing credentials are managed by EAS
npm run submit:ios               # uploads the latest build to App Store Connect / TestFlight
```

- [`eas.json`](mobile/eas.json) sets `EXPO_PUBLIC_API_URL` for builds and lets EAS increase the build number (`appVersionSource: remote`).
- [`app.json`](mobile/app.json): iPhone only (`supportsTablet: false`), no export compliance question (`usesNonExemptEncryption: false`), specific permission texts, a privacy manifest, and no microphone permission. The icon and splash sources are SVGs in [`mobile/assets/source`](mobile/assets/source).
- The map uses each platform's default provider: Apple Maps on iOS (no API key) and Google Maps on Android. An Android release build needs a Google Maps API key in `android.config.googleMaps.apiKey`.

### App Store review checklist

| Guideline | Where it is handled |
| --- | --- |
| 5.1.1(v) Account deletion | Profile → Delete account, `DELETE /api/users/profile` |
| 1.2 User-generated content | Report and block from the ••• menu and the link at the bottom of a friend's place, block from a friend's profile and when declining a request, Terms of Use with a zero-tolerance clause accepted at sign-up, contact email on `/support` |
| 5.1.1(i) Privacy policy | `/privacy` (English and Turkish), linked at sign-up and in Profile |
| 5.1.2(i) Third-party AI | Consent dialog before the first AI summary, switch in Profile |
| 5.1.1(ii) Permissions | Purpose strings in `app.json`; the photo library uses the system picker without a permission prompt |
| 5.1.1 / 5.1.5 Location | Asked only when the user taps something that needs it, explained first, "while using" only; the map and adding places work without it; it is never sent to friends |
| 4.0 Design | Built on iOS conventions: native navigation and sheets, safe areas, Dynamic Type with limits only on fixed chrome, VoiceOver labels |
| 2.1 App completeness | Demo account with friends and places (`scripts/seed-demo.mjs`) |

## Security notes

- Passwords are hashed with bcrypt and never returned by the API
- `JWT_SECRET` is required; the server refuses to sign tokens without it
- Every place endpoint checks ownership or friendship before returning data
- Request bodies are validated with Zod; unexpected server errors return a generic message instead of internal details
- Uploaded photos get random file names and are limited by type and size; deleting a place or an account deletes its photo files too
- Deleting an account asks for the password again

## Possible next steps

- Private Blob storage with short-lived signed URLs, so a photo link can't be shared outside the friends list
- Refresh tokens instead of a single 7-day token
- Rate limiting on login and registration
- Turkish translation of the app (the website pages already have one)
- Dark mode (the color tokens are in one place, so a dark palette can be added there)
- PostGIS for distance queries once the data grows
- Push notifications for friend requests
