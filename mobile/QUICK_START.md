# 🚀 Haritaly Mobile App - Quick Start Guide

## Installation (5 minutes)

```bash
# 1. Navigate to mobile folder
cd /Users/sudeerdagi/Desktop/web/haritaly/mobile

# 2. Install all dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Edit .env with your backend URL
# EXPO_PUBLIC_API_URL=http://your-backend-url/api

# 5. Start development server
npm start
```

## Running the App

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web

# Or scan QR code with Expo Go app on your phone
```

## File Locations Quick Reference

| Feature | Location | Status |
|---------|----------|--------|
| **Map Screen** | `app/(app)/map.tsx` | ✅ Complete |
| **Friends Screen** | `app/(app)/friends.tsx` | ✅ Complete |
| **Profile Screen** | `app/(app)/profile.tsx` | ✅ Complete |
| **Login Screen** | `app/(auth)/login.tsx` | ⏳ TODO |
| **Register Screen** | `app/(auth)/register.tsx` | ⏳ TODO |
| **API Client** | `src/api/client.ts` | ✅ Complete |
| **Places API** | `src/api/places.ts` | ✅ Complete |
| **Location Hook** | `src/hooks/useLocation.ts` | ✅ Complete |
| **Places Hook** | `src/hooks/usePlaces.ts` | ✅ Complete |
| **Auth Store** | `src/store/auth.ts` | ✅ Complete |
| **Types** | `src/types/index.ts` | ✅ Complete |

## Project Structure at a Glance

```
mobile/
├── app/                    ← Navigation screens
├── src/
│   ├── api/               ← API endpoints
│   ├── components/        ← Reusable UI
│   ├── hooks/             ← Custom React hooks
│   ├── store/             ← State management
│   ├── types/             ← Type definitions
│   └── utils/             ← Helper functions
└── 📚 Documentation
    ├── README.md
    ├── MAP_SCREEN_GUIDE.md
    ├── FILE_STRUCTURE.md
    ├── IMPLEMENTATION_SUMMARY.md
    └── DIAGRAMS_AND_WORKFLOWS.md
```

## Key Features & Their Files

### 🗺️ Map Display
```
app/(app)/map.tsx
├── Uses: useLocation hook
├── Uses: usePlaces hook
├── Shows: User location + place pins
└── Interactions: Filter, add place, view details
```

### 👥 Friends Management
```
app/(app)/friends.tsx
├── Shows: Friend list
├── Shows: Pending requests
└── Actions: Accept, reject, add friends
```

### 👤 User Profile
```
app/(app)/profile.tsx
├── Shows: User info
├── Actions: Edit profile, logout
└── Settings: Notifications, privacy, about
```

### 🔐 Authentication
```
src/store/auth.ts
├── Manages: User login/logout
├── Stores: JWT token & user data
├── Persists: Using AsyncStorage
└── Auto-restores: On app restart
```

## API Endpoints Ready to Use

```typescript
// Places API (already implemented)
import { placesAPI } from '@/src/api/places';

placesAPI.getMyPlaces()                           // Get saved places
placesAPI.getNearbyPlaces(lat, lng, 5000)       // Get friend places
placesAPI.getPlaceDetails(placeId)               // Get place info
placesAPI.searchPlaces(query)                    // Search
placesAPI.createPlace(data)                      // Create
placesAPI.updatePlace(placeId, data)             // Update
placesAPI.deletePlace(placeId)                   // Delete
```

## Data Flow (Simplified)

```
User Opens App
    ↓
useAuth checks token → Show map OR login
    ↓
useLocation gets GPS
    ↓
usePlaces fetches places
    ↓
Map displays pins
    ↓
User taps pin → Navigate to details
```

## Common Tasks

### 1. Create a New API Endpoint

```typescript
// File: src/api/newFeature.ts
import { apiClient } from './client';

export const featureAPI = {
  async getFeatures() {
    const response = await apiClient.get('/features');
    return response.data.data || [];
  },
};
```

### 2. Create a New Hook

```typescript
// File: src/hooks/useNewFeature.ts
import { useEffect, useState } from 'react';

export const useNewFeature = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Fetch or setup logic
  }, []);
  
  return { data };
};
```

### 3. Create a New Screen

```typescript
// File: app/(app)/newscreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NewScreen() {
  return (
    <View style={styles.container}>
      <Text>New Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### 4. Get Location

```typescript
import { useLocation } from '@/src/hooks/useLocation';

const { location, mapRegion, isLoading } = useLocation();
// location: { latitude, longitude, accuracy }
// mapRegion: { latitude, longitude, latitudeDelta, longitudeDelta }
```

### 5. Get Places

```typescript
import { usePlaces } from '@/src/hooks/usePlaces';

const { myPlaces, nearbyPlaces, allPlaces } = usePlaces();
```

### 6. Get Auth State

```typescript
import { useAuth } from '@/src/store/auth';

const { user, userToken, login, logout } = useAuth();
```

## Styling Guide

### Colors
```typescript
const COLORS = {
  primary: '#6366f1',    // Indigo
  secondary: '#ec4899',  // Pink
  accent: '#f59e0b',     // Amber
  success: '#10b981',    // Green
  danger: '#ef4444',     // Red
  bgLight: '#f9fafb',    // Light gray
  text: '#1f2937',       // Dark gray
  textLight: '#6b7280',  // Medium gray
  border: '#e5e7eb',     // Border gray
};
```

### Common Spacing
```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
};
```

### Shadows
```typescript
const shadow = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};
```

## Performance Tips

1. **Use React.memo for expensive components**
   ```typescript
   export const MyComponent = React.memo(({ data }) => (...))
   ```

2. **Throttle location updates** (Already done in useLocation)

3. **Cache API responses** where possible

4. **Lazy load screens** with Expo Router (automatic)

5. **Use FlatList for long lists** (not ScrollView)

## Debugging

### Check Logs
```bash
# Logs appear in terminal where you ran `npm start`
# Look for red errors and yellow warnings
```

### React Native Debugger
```bash
# Press Shift + M in terminal
# Opens Expo DevTools
# Check Network tab for API calls
```

### Console Logs
```typescript
import { useEffect } from 'react';

useEffect(() => {
  console.log('Component mounted');
  return () => console.log('Component unmounted');
}, []);
```

## Common Issues & Fixes

### "Cannot find module" Error
```bash
npm install
# Then clear cache
npm start -- --clear
```

### API calls failing
```typescript
// Check 1: Verify backend URL in .env
EXPO_PUBLIC_API_URL=http://localhost:3000/api

// Check 2: Verify backend is running
// Check 3: Check network tab in DevTools
// Check 4: Check JWT token in AsyncStorage
```

### Map not showing
```typescript
// 1. Check Google Maps API key in app.json
// 2. Verify PROVIDER_GOOGLE is set
// 3. Check permissions in app.json
```

### Location not updating
```typescript
// 1. Check location permission in device settings
// 2. Test with real device (simulator has limitations)
// 3. Check location accuracy setting
```

## Next Priority Tasks

1. ✅ **Complete** - Map screen with pins
2. ✅ **Complete** - Friends screen
3. ✅ **Complete** - Profile screen
4. 🔴 **Priority 1** - Create login screen
5. 🔴 **Priority 1** - Create register screen
6. 🟠 **Priority 2** - Create place-details screen
7. 🟠 **Priority 2** - Create add-place screen
8. 🟡 **Priority 3** - Add validation
9. 🟡 **Priority 3** - Add error handling
10. ⚪ **Later** - Polish and optimize

## Testing Checklist

Before showing to others:
- [ ] App opens without crashes
- [ ] Map displays correctly
- [ ] Location permission works
- [ ] Pins show on map
- [ ] Filter toggle works
- [ ] Navigation between tabs works
- [ ] Profile screen editable
- [ ] Logout works
- [ ] Persistent login works
- [ ] No console errors

## Documentation to Read

For detailed information, read these in order:
1. **README.md** - Overview and setup
2. **MAP_SCREEN_GUIDE.md** - Map implementation details
3. **FILE_STRUCTURE.md** - Complete file reference
4. **DIAGRAMS_AND_WORKFLOWS.md** - Visual explanations
5. **IMPLEMENTATION_SUMMARY.md** - Current status

## Terminal Commands

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Start with specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser

# Clear cache and restart
npm start -- --clear

# View project structure
find . -type f -name "*.tsx" | head -20

# Search for component usage
grep -r "useLocation" src/

# Test build
eas build --platform ios --local
```

## Environment Variables

```env
# File: .env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_ENV=development
```

## Key Dependencies

```json
{
  "expo": "~50.0.0",
  "expo-router": "~3.4.0",
  "react-native": "0.73.0",
  "react-native-maps": "1.10.0",
  "expo-location": "~16.5.0",
  "axios": "^1.6.0",
  "@react-native-async-storage/async-storage": "^1.21.0"
}
```

## Support Resources

- Expo Docs: https://docs.expo.dev
- React Native: https://reactnative.dev
- TypeScript: https://www.typescriptlang.org/docs
- Maps: https://react-native-maps.github.io/react-native-maps

## Quick Wins to Try

1. **Change app name** in app.json
2. **Change colors** in MAP_SCREEN_GUIDE.md
3. **Add console logs** to see data flow
4. **Test with real device** using Expo Go
5. **Toggle filter buttons** on map to test state

---

**Ready to start?** Run `npm install` and then `npm start` 🚀

Need help? Check the documentation files or search through the code - everything is well-commented!
