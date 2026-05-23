# Haritaly Mobile App

React Native + Expo mobile application for the Haritaly social map platform.

## Project Structure

```
mobile/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Authentication screens
│   │   ├── login.tsx        # Login screen (to be created)
│   │   ├── register.tsx     # Register screen (to be created)
│   │   └── _layout.tsx      # Auth navigation layout
│   ├── (app)/               # Main app screens (requires auth)
│   │   ├── map.tsx          # Map screen (home)
│   │   ├── friends.tsx      # Friends management
│   │   ├── profile.tsx      # User profile
│   │   └── _layout.tsx      # Tab navigation layout
│   ├── index.tsx            # Splash screen / Root navigation
│   └── _layout.tsx          # Root layout with providers
├── src/
│   ├── api/                 # API client and endpoints
│   │   ├── client.ts        # Axios client with interceptors
│   │   ├── auth.ts          # Auth API endpoints (to be created)
│   │   ├── places.ts        # Places API endpoints
│   │   ├── friends.ts       # Friends API endpoints (to be created)
│   │   └── users.ts         # Users API endpoints (to be created)
│   ├── components/          # Reusable components
│   │   ├── MapPin/          # Map marker component
│   │   ├── Input/           # Input component (to be created)
│   │   └── Button/          # Button component (to be created)
│   ├── hooks/               # Custom React hooks
│   │   ├── useLocation.ts   # Location tracking hook
│   │   ├── usePlaces.ts     # Places management hook
│   │   └── useAuth.ts       # Auth hook (to be created)
│   ├── store/               # State management
│   │   └── auth.ts          # Auth context/store
│   ├── types/               # TypeScript types
│   │   └── index.ts         # All type definitions
│   └── utils/               # Utility functions
│       └── distance.ts      # Distance calculation (to be created)
├── app.json                 # Expo configuration
├── babel.config.js          # Babel configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies
├── .env.example             # Environment variables example
└── README.md                # This file
```

## Features Overview

### 1. **Map Screen** (`app/(app)/map.tsx`)
- Displays a map with pins for saved places
- Shows user's location (blue dot)
- Two types of pins:
  - **Blue pins** (Indigo): Places saved by the current user
  - **Pink pins**: Places saved by friends nearby
- Filter toggle to show all places or only friends' places
- Interactive pins with place names and ratings
- Floating action button to add new places
- Real-time location tracking
- Displays nearby places saved by friends within 5km radius

### 2. **Friends Screen** (`app/(app)/friends.tsx`)
- View list of friends
- Manage friend requests (accept/reject)
- Add new friends
- Shows friend avatars, names, and emails

### 3. **Profile Screen** (`app/(app)/profile.tsx`)
- View/edit user profile
- Display user information (name, email, bio)
- Logout functionality
- Settings shortcuts
- Profile editing mode with save/cancel actions

### 4. **Authentication** (`app/(auth)/`)
- Login screen (to be created)
- Register screen (to be created)
- JWT token management
- Persistent authentication state

## Key Technologies

- **React Native**: Native mobile development framework
- **Expo**: Development and deployment platform
- **Expo Router**: File-based routing (like Next.js)
- **React Native Maps**: Google Maps integration
- **Expo Location**: GPS and location services
- **AsyncStorage**: Local data persistence
- **Axios**: HTTP client
- **TypeScript**: Type safety
- **Material Community Icons**: Icon library

## Setup Instructions

### Prerequisites
- Node.js >= 18
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Mobile device with Expo Go app (iOS/Android)

### Installation

1. **Install dependencies**
```bash
cd mobile
npm install
```

2. **Create environment file**
```bash
cp .env.example .env
```

3. **Configure API URL**
Edit `.env` and set `EXPO_PUBLIC_API_URL` to your backend URL:
```
EXPO_PUBLIC_API_URL=http://your-backend-url/api
```

### Running the App

```bash
# Start the development server
npm start

# Open in iOS simulator
npm run ios

# Open in Android emulator
npm run android

# Open in web (browser)
npm run web
```

## API Integration

All API calls are made through `src/api/` modules:

```typescript
// Example: Fetching places
import { placesAPI } from '@/src/api/places';

const places = await placesAPI.getMyPlaces();
const nearbyPlaces = await placesAPI.getNearbyPlaces(lat, lng, radius);
```

## Authentication Flow

1. **Splash Screen** → Checks if user token exists
2. **If authenticated** → Navigate to main app
3. **If not** → Navigate to login/register screens
4. **Token Management** → Automatically added to all requests via axios interceptor
5. **Persistent State** → Token and user data stored in AsyncStorage

## Location Tracking

The `useLocation` hook:
- Requests foreground location permission on first use
- Fetches current location with high accuracy
- Watches location changes every 10 seconds or 50 meters
- Updates nearby places when location changes
- Returns formatted map region ready for MapView

## Hooks Usage

### useLocation
```typescript
const { location, mapRegion, updateMapRegion, isLoading, error } = useLocation();
// location: { latitude, longitude, accuracy }
// mapRegion: MapRegion for MapView
```

### usePlaces
```typescript
const {
  myPlaces,
  nearbyPlaces,
  allPlaces,
  isLoading,
  error,
  refreshPlaces,
  fetchNearbyPlaces,
} = usePlaces();
```

### useAuth
```typescript
const { user, userToken, isLoading, login, logout, register } = useAuth();
```

## File Creation Checklist

- ✅ app.json
- ✅ app/_layout.tsx
- ✅ app/index.tsx
- ✅ app/(auth)/_layout.tsx
- ✅ app/(app)/_layout.tsx
- ✅ app/(app)/map.tsx
- ✅ app/(app)/friends.tsx
- ✅ app/(app)/profile.tsx
- ✅ src/types/index.ts
- ✅ src/store/auth.ts
- ✅ src/api/client.ts
- ✅ src/api/places.ts
- ✅ src/hooks/useLocation.ts
- ✅ src/hooks/usePlaces.ts
- ✅ src/components/MapPin/MapPin.tsx
- ✅ tsconfig.json
- ✅ babel.config.js
- ✅ .env.example

## Still To Create

1. **Authentication Screens**
   - `app/(auth)/login.tsx`
   - `app/(auth)/register.tsx`
   - Auth API endpoints

2. **Additional Screens**
   - `app/(app)/place-details.tsx` - View place details
   - `app/(app)/add-place.tsx` - Add new place
   - `app/(app)/search.tsx` - Search places

3. **Components**
   - `src/components/Input/` - Custom input component
   - `src/components/Button/` - Custom button component
   - `src/components/PlaceCard/` - Place card display

4. **API Modules**
   - `src/api/auth.ts` - Auth API calls
   - `src/api/users.ts` - User API calls
   - `src/api/friends.ts` - Friends API calls

5. **Utilities**
   - `src/utils/distance.ts` - Distance calculation
   - Error handling utilities
   - Validation utilities

## Next Steps

1. Install dependencies: `npm install`
2. Create login/register screens
3. Create auth API integration
4. Add more screens (place details, add place, search)
5. Implement image upload for place photos
6. Add real-time location sharing to backend
7. Implement WebSocket for real-time updates

## Debugging

- Use Expo DevTools: Press `Shift + M` in terminal
- Check console logs: `expo start` shows all logs
- Use React Native Debugger for advanced debugging
- Check API calls with network tab in DevTools

## Performance Tips

- Lazy load map when navigating to map screen
- Throttle location updates to avoid excessive requests
- Cache place data locally
- Use React.memo for expensive components
- Implement pagination for large place lists

## Production Build

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Troubleshooting

### Location permission denied
- Check app permissions in device settings
- Restart the app
- Clear app cache

### Map not showing
- Ensure Google Maps API key is configured in app.json
- Check API URL is correct in .env
- Verify backend is running

### API calls failing
- Check network connectivity
- Verify API_URL in .env
- Check JWT token expiration
- Review backend error logs
