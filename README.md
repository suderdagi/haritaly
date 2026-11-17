# Haritaly

Haritaly is a social map app. You save the places you like (a café, a park, a restaurant) with notes, a rating and photos, and you see the places your friends saved around you.

The repository has two parts:

| Folder | What it is | Stack |
| --- | --- | --- |
| [`backend/`](backend) | REST API | Next.js 15 route handlers, TypeScript, Prisma, PostgreSQL, JWT, Zod, Vitest |
| [`mobile/`](mobile) | iOS / Android app | React Native, Expo 54, Expo Router, react-native-maps |

## Features

- Sign up and log in with email and password (bcrypt + JWT)
- Save a place at your current location with category, rating, favorite food/drink, notes and photos
- Edit or delete your own places
- Find people by name or email, send friend requests, accept or reject them
- See friends' places on the map within a radius, sorted by distance
- Add your own or friends' places to favorites
- Places are private: only you and your friends can see them

## Architecture

```
mobile (Expo)  ──HTTP/JSON + Bearer token──▶  backend (Next.js API)  ──Prisma──▶  PostgreSQL
```

**Backend layout**

```
backend/
├── prisma/
│   ├── schema.prisma        # User, Place, Photo, Friendship, Favorite
│   └── migrations/
├── src/
│   ├── app/api/             # one folder per endpoint (route.ts)
│   └── lib/
│       ├── http.ts          # requireAuth, ok/fail response helpers
│       ├── friends.ts       # friendship rules (send, accept, reject, remove)
│       ├── places.ts        # who can see / change a place
│       ├── geo.ts           # Haversine distance, bounding box
│       ├── validators.ts    # Zod schemas for every request body
│       ├── storage.ts       # photo upload (local disk)
│       └── errors.ts        # typed errors mapped to HTTP status codes
└── tests/                   # unit + integration tests
```

Route handlers stay small: they authenticate, validate the input with Zod and call a function in `src/lib`. Business rules (for example "only the receiver can accept a request") live in `src/lib` so they are easy to test and reuse.

**How nearby search works**

Calculating the distance to every place in the database would get slow as the table grows. The `/places/nearby` endpoint first narrows the rows with a bounding box query on the indexed `latitude`/`longitude` columns, then calculates the exact distance with the Haversine formula only for those candidates, filters by radius and sorts by distance.

## API

All endpoints except register, login and health require `Authorization: Bearer <token>`.
Responses have the shape `{ "success": true, "data": ... }` or `{ "success": false, "error": "..." }`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, returns a JWT |
| GET / PUT | `/api/users/profile` | Current user's profile |
| GET | `/api/users/search?q=` | Find people to add |
| GET | `/api/users/:id` | Public profile |
| GET / POST | `/api/places` | My places / save a place |
| GET / PUT / DELETE | `/api/places/:id` | Place details / edit / delete |
| GET | `/api/places/nearby?lat=&lng=&radius=` | Friends' places nearby |
| GET | `/api/places/search?q=` | Search my and my friends' places |
| GET / POST | `/api/places/:id/photos` | List / upload photos |
| POST / DELETE | `/api/places/:id/favorite` | Add / remove favorite |
| GET | `/api/favorites` | My favorites |
| GET / POST / DELETE | `/api/friends` | Friends / send request / remove |
| GET | `/api/friends/requests` | Incoming requests |
| POST | `/api/friends/:id/accept` | Accept a request |
| POST | `/api/friends/:id/reject` | Reject a request |
| GET | `/api/health` | Health check (includes database) |

## Running locally

**Requirements:** Node.js 20+, PostgreSQL 14+, and the Expo Go app or an iOS/Android simulator.

### Backend

```bash
cd backend
cp .env.example .env        # fill in DATABASE_URL, DIRECT_URL and JWT_SECRET
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

On a physical phone, `localhost` means the phone itself, so use your computer's local IP address in `EXPO_PUBLIC_API_URL`.

## Tests

```bash
cd backend
npm test
```

- **Unit tests** cover distance calculation and request validation.
- **Integration tests** call the real route handlers against a PostgreSQL database and check the main flows: auth, place permissions, friend requests, nearby search and favorites. Point `DATABASE_URL` to a separate test database, because the tests clear the tables.

GitHub Actions runs type checks, tests and the production build on every push to `main`.

## Security notes

- Passwords are hashed with bcrypt and never returned by the API
- `JWT_SECRET` is required; the server refuses to sign tokens without it
- Every place endpoint checks ownership or friendship before returning data
- Request bodies are validated with Zod; unexpected server errors return a generic message instead of internal details
- Uploaded photos get random file names and are limited by type and size

## Possible next steps

- Move photo storage from local disk to S3 or Cloudinary (`src/lib/storage.ts` is the only file to change)
- Refresh tokens instead of a single 7-day token
- PostGIS for distance queries once the data grows
- Push notifications for friend requests
