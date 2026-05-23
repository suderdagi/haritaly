# Map Screen Implementation Guide

## Overview

The map screen is the heart of Haritaly. It displays:
- User's current location
- User's saved places (with blue pins)
- Friends' nearby saved places (with pink pins)
- Interactive place cards with ratings
- Filter controls to toggle between all places and friends' places only

## File: `app/(app)/map.tsx`

### Key Components

#### 1. **Map Display**
```typescript
<MapView
  provider={PROVIDER_GOOGLE}
  style={styles.map}
  initialRegion={mapRegion || INITIAL_REGION}
  onRegionChange={updateMapRegion}
  showsUserLocation      // Shows blue dot for user location
  showsMyLocationButton  // Shows "center on me" button
>
```

#### 2. **Markers with Custom Pins**
```typescript
{displayedPlaces.map((place) => (
  <Marker
    coordinate={{
      latitude: place.latitude,
      longitude: place.longitude,
    }}
    onPress={() => handleMarkerPress(place)}
  >
    <MapPin
      place={place}
      isUserPlace={myPlaces.some((p) => p.id === place.id)}
      onPress={() => handleMarkerPress(place)}
    />
  </Marker>
))}
```

#### 3. **MapPin Component** (`src/components/MapPin/MapPin.tsx`)
- Shows different colors based on ownership:
  - **Indigo (#6366f1)** for user's places
  - **Pink (#ec4899)** for friends' places
- Displays place name and rating on tap
- Custom icon inside the pin

### Data Flow

```
useAuth Hook
    ↓
User authenticated?
    ↓
useLocation Hook
    ├─ Gets current location (lat, lng)
    └─ Watches location changes
       
usePlaces Hook
    ├─ Gets user's saved places
    └─ Fetches nearby friends' places
       
Combine places
    ↓
Display on map with colored pins
    ↓
User taps pin
    └─ Navigate to place details
```

### State Management

```typescript
const { location, mapRegion } = useLocation();
// Returns: { latitude, longitude, accuracy }
//          { latitude, longitude, latitudeDelta, longitudeDelta }

const { myPlaces, nearbyPlaces, allPlaces } = usePlaces();
// myPlaces: Places saved by current user
// nearbyPlaces: Places saved by friends within 5km
// allPlaces: Combined list

const [showNearbyOnly, setShowNearbyOnly] = useState(false);
// Toggle between all places and friends' places only
```

### Styling Notes

- **Top Controls**: Filter buttons to toggle between "All" and "Friends"
- **Map**: Full screen with proper padding for status bar
- **Info Bar**: Shows total place count and legend
- **FAB**: Floating action button to add new places (bottom-right)

### User Interactions

1. **Map Interaction**
   - Drag/pinch to navigate
   - Tap location button to center on user
   - Tap any marker to view place details

2. **Filter Toggle**
   - "All" button: Shows user's places + friends' places
   - "Friends" button: Shows only friends' places nearby

3. **Add Place**
   - Tap FAB button
   - Navigates to add-place screen

4. **Place Details**
   - Tap any pin
   - Navigates to place-details screen with placeId

### Hooks Explanation

#### useLocation
```typescript
const useLocation = () => {
  // Request location permission
  // Get current location
  // Watch location changes
  // Return location, mapRegion, updateMapRegion, isLoading, error
};
```

#### usePlaces
```typescript
const usePlaces = () => {
  // Fetch user's saved places on mount
  // Provide fetchNearbyPlaces to call with location
  // Return combined place lists, loading state, and functions
};
```

### API Calls

```typescript
// Places API
placesAPI.getMyPlaces()
placesAPI.getNearbyPlaces(latitude, longitude, radius)
placesAPI.getPlaceDetails(placeId)
placesAPI.createPlace(data)
placesAPI.updatePlace(placeId, data)
placesAPI.deletePlace(placeId)
placesAPI.searchPlaces(query)
```

### Color Scheme

- **Primary**: Indigo `#6366f1`
- **Secondary**: Pink `#ec4899`
- **Accent**: Amber `#f59e0b`
- **Background**: Light Gray `#f9fafb`
- **Text Dark**: `#1f2937`
- **Text Light**: `#6b7280`
- **Border**: `#e5e7eb`

### Performance Considerations

1. **Location Updates**
   - Updates every 10 seconds
   - Or when distance changes by 50 meters
   - Prevents excessive API calls

2. **Place Fetching**
   - Fetches on location change
   - 5km radius by default
   - Could be expanded to 10km, 25km etc.

3. **Map Rendering**
   - Only renders visible markers
   - Native maps library optimized for performance
   - Smooth interactions with gesture handler

### Future Enhancements

1. **Clustering**
   - Group nearby markers when zoomed out
   - Improve performance with many places

2. **Heatmap**
   - Show popular areas
   - Visual density of saved places

3. **Real-time Updates**
   - WebSocket for live friend locations
   - Real-time place additions

4. **Search Integration**
   - Search on map
   - Filter by category

5. **Place Photos**
   - Show photo thumbnails on pins
   - Gallery view in place details

### Testing Scenarios

1. **Location Permission**
   - First launch should request permission
   - Handle denied permission gracefully

2. **No Places**
   - Show empty state message
   - Suggest adding first place

3. **No Friends/Places**
   - Show helpful message
   - Encourage adding friends

4. **Network Error**
   - Show retry button
   - Cache last known places

5. **Large Area**
   - Handle 100+ places efficiently
   - Consider clustering at zoom level

## Code Examples

### Getting User Location
```typescript
const { location } = useLocation();

if (location) {
  console.log(`User at: ${location.latitude}, ${location.longitude}`);
}
```

### Fetching Nearby Places
```typescript
const { fetchNearbyPlaces } = usePlaces();

const handleLocationUpdate = async (coords) => {
  await fetchNearbyPlaces(coords.latitude, coords.longitude, 5000);
};
```

### Navigating to Place Details
```typescript
const handlePlacePress = (place) => {
  router.push({
    pathname: '/place-details',
    params: { placeId: place.id },
  });
};
```

### Combining User and Friends' Places
```typescript
const displayedPlaces = showNearbyOnly ? nearbyPlaces : allPlaces;

const isUserPlace = myPlaces.some((p) => p.id === place.id);

<MapPin
  place={place}
  isUserPlace={isUserPlace}
  onPress={() => handlePlacePress(place)}
/>
```

## Related Files

- `src/types/index.ts` - Type definitions
- `src/hooks/useLocation.ts` - Location hook
- `src/hooks/usePlaces.ts` - Places hook
- `src/api/places.ts` - Places API
- `src/components/MapPin/MapPin.tsx` - Pin component
- `src/store/auth.ts` - Authentication state
