# Haritaly Mobile App - Visual Diagrams & Workflows

## 1. App Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        App Starts                            │
│                   (app/index.tsx)                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                ┌──────────▼──────────┐
                │  Check Auth Token   │
                └──────────┬──────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
        YES│               │NO             │LOADING
           │               │               │
     ┌─────▼──────┐  ┌─────▼──────┐  ┌────▼─────┐
     │  (app)     │  │  (auth)    │  │ Spinner  │
     │ Tab Navbar │  │ Stack Nav  │  │ Loading  │
     └─────┬──────┘  └─────┬──────┘  └──────────┘
           │               │
     ┌─────┴─────┬─────────┘
     │           │
  ┌──▼──┐  ┌─────▼──────────┐
  │ Map │  │ Login/Register │
  │Tab │  │   Screens      │
  │    │  │    (TO DO)     │
  │    │  └────────────────┘
  ├────┤
  │ F  │  After successful login:
  │ r  │  ├─ Save JWT token
  │ i  │  ├─ Save user data
  │ e  │  ├─ Redirect to (app)
  │ n  │  └─ Restore location tracking
  │ d  │
  │ s  │  On logout:
  │    │  ├─ Clear token
  │ T  │  ├─ Clear user data
  │ a  │  ├─ Redirect to (auth)
  │ b  │  └─ Stop location tracking
  │    │
  ├────┤
  │ P  │
  │ r  │
  │ o  │
  │ f  │
  │ i  │
  │ l  │
  │ e  │
  └────┘
```

## 2. Map Screen Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Map Screen (app/(app)/map.tsx)            │
└──────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
          ┌─────▼──────┐  ┌───▼─────┐  ┌──▼───────┐
          │ useLocation│  │usePlaces │  │ useAuth  │
          └──────┬──────┘  └───┬─────┘  └──┬───────┘
                 │             │           │
         ┌───────┴──────┐      │           │
         │              │      │           │
    ┌────▼─────┐   ┌────▼───┐ │      ┌────▼────┐
    │Permission│   │ Get    │ │      │ Get     │
    │Request   │   │Current │ │      │ User    │
    │          │   │Location│ │      │ Info    │
    └────┬─────┘   └────┬───┘ │      └─────────┘
         │              │      │
         └──────┬───────┘      │
                │              │
           ┌────▼──────────────┴────┐
           │ Watch Location Changes │
           │ (Every 10s or 50m)    │
           └────┬───────────────────┘
                │
                ├─────────────────┐
                │                 │
           ┌────▼──────┐      ┌───▼────────┐
           │ Fetch My  │      │ Fetch      │
           │ Saved     │      │ Nearby     │
           │ Places    │      │ Friends    │
           │           │      │ Places     │
           └────┬──────┘      └───┬────────┘
                │                 │
                └────────┬────────┘
                         │
                    ┌────▼─────────┐
                    │ Combine      │
                    │ All Places   │
                    └────┬────────┘
                         │
                ┌────────┴────────┐
                │                 │
            ┌───▼──────┐      ┌───▼──────────┐
            │ Display  │      │ Apply Filter │
            │ All      │      │ (All vs      │
            │ Places   │      │  Friends)    │
            └───┬──────┘      └───┬──────────┘
                │                 │
                └────────┬────────┘
                         │
                    ┌────▼──────┐
                    │  Render   │
                    │ MapView   │
                    │ with Pins │
                    └───────────┘
                         │
                    User Interactions:
                    ├─ Tap pin → Place details
                    ├─ Toggle filters
                    ├─ Tap + button → Add place
                    └─ Pinch/drag → Pan map
```

## 3. Authentication State Machine

```
┌──────────────────────────────────────────────────────────────┐
│                    Auth Context State                        │
└──────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   App Starts    │
                    │ (isLoading:true)│
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Check Storage   │
                    │ for saved token │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         ┌────▼────┐    ┌────▼────┐   ┌───▼────┐
         │ Token   │    │ Token   │   │ No    │
         │ Found   │    │ Expired │   │ Token│
         │ & Valid │    │         │   │      │
         └────┬────┘    └────┬────┘   └───┬──┘
              │              │            │
         ┌────▼──────┐  ┌────▼──────┐ ┌──▼──────┐
         │ Restore   │  │ Refresh   │ │ Redirect│
         │ User Data │  │ Token     │ │ to      │
         │           │  │           │ │ Login   │
         │ Set Token │  │ Get New   │ │         │
         └────┬──────┘  │ Token     │ └──┬──────┘
              │         │           │    │
              │         └────┬──────┘    │
              │              │          │
              └──────┬───────┴──────────┘
                     │
                ┌────▼──────────────┐
                │ isLoading: false   │
                │ Now either         │
                │ ├─ Show (app)      │
                │ └─ Show (auth)     │
                └────────────────────┘

User Actions:
─────────────

LOGIN Screen:
    User Input Email/Password
           │
           ▼
    POST /api/auth/login
           │
           ▼
    Receive token + user data
           │
           ├─ Save token to AsyncStorage
           ├─ Save user data to AsyncStorage
           ├─ Update Context state
           └─ Redirect to (app)

REGISTER Screen:
    User Input Name/Email/Password
           │
           ▼
    POST /api/auth/register
           │
           ▼
    Same as LOGIN flow
           │
           ▼
    Auto-login after registration

LOGOUT Button (Profile Screen):
    User Confirmation Dialog
           │
           ▼
    DELETE /api/auth/logout (optional)
           │
           ├─ Remove token from AsyncStorage
           ├─ Remove user data from AsyncStorage
           ├─ Clear Context state
           └─ Redirect to (auth)
```

## 4. Place Display on Map

```
┌────────────────────────────────────────────────────────────┐
│         How Places Get Displayed on Map Screen            │
└────────────────────────────────────────────────────────────┘

Data Structure:
───────────────
Place {
  id: 1
  name: "Coffee Shop"
  latitude: 37.7749
  longitude: -122.4194
  rating: 4.5
  userId: 123           ← Who saved this place
}

Display Logic:
──────────────
Is this place in myPlaces[]?
    │
    ├─ YES  → Color: #6366f1 (INDIGO)
    │        Icon: ❤️ Heart
    │        Size: 36x36px
    │
    └─ NO   → Color: #ec4899 (PINK)
             Icon: 📍 Map Marker
             Size: 36x36px

Pin Components:
───────────────
┌─────────────────────────┐
│    MapPin Component     │
│  (src/components/MapPin)│
└──────────┬──────────────┘
           │
           ├─ Receives:
           │  ├─ place: Place
           │  ├─ isUserPlace: boolean
           │  └─ onPress: () => void
           │
           ├─ Renders:
           │  ├─ Colored circle (pin)
           │  ├─ Icon inside
           │  ├─ Place name label
           │  └─ Rating (if available)
           │
           └─ Behaviors:
              ├─ On press → navigate to details
              └─ Shows label with name + rating

Example Pin Rendering:
──────────────────────
User's Place:
    ┌─────────┐
    │    ❤️   │  ← Indigo (#6366f1)
    └─────────┘
   Coffee Shop
    ★ 4.5

Friend's Place:
    ┌─────────┐
    │    📍   │  ← Pink (#ec4899)
    └─────────┘
   Restaurant
    ★ 4.8

Map View Rendering:
───────────────────
<MapView>
  {/* User location marker (blue dot) */}
  showsUserLocation={true}
  
  {/* All place markers */}
  {displayedPlaces.map((place) => (
    <Marker coordinate={place.coords}>
      <MapPin 
        place={place}
        isUserPlace={myPlaces.includes(place.id)}
        onPress={handlePress}
      />
    </Marker>
  ))}
</MapView>

Filtering Logic:
────────────────
showNearbyOnly = false (default)
  → displayedPlaces = [...myPlaces, ...nearbyPlaces]
  → Shows ALL places

showNearbyOnly = true
  → displayedPlaces = nearbyPlaces
  → Shows ONLY friends' places

Toggle Button:
  "All" (enabled)   → myPlaces + friendPlaces
  "Friends" (enabled) → friendPlaces only
```

## 5. Location Tracking Flow

```
┌──────────────────────────────────────────────────────┐
│         useLocation Hook Lifecycle                  │
└──────────────────────────────────────────────────────┘

Component Mounts:
────────────────
useLocation()
    │
    ├─ State Init:
    │  ├─ location: null
    │  ├─ mapRegion: default (San Francisco)
    │  └─ isLoading: true
    │
    └─ useEffect on Mount

Effect 1 - Request Permission:
──────────────────────────────
    │
    ▼
requestForegroundPermissionsAsync()
    │
    ├─ status === 'granted'? ✓
    │       │
    │       ▼
    │   getCurrentPositionAsync()
    │       │
    │       ├─ Get precise location
    │       ├─ Update location state
    │       ├─ Update mapRegion
    │       └─ isLoading = false
    │
    └─ status === 'denied'? ✗
            │
            ▼
        Set error message
        isLoading = false
        Show message to user

Effect 2 - Watch Location (Continuous):
──────────────────────────────────────
    │
    ▼
watchPositionAsync({
  accuracy: 'High',
  timeInterval: 10000ms,    ← Update every 10 seconds
  distanceInterval: 50m      ← Or when moved 50 meters
})
    │
    ├─ New location received
    │       │
    │       ▼
    │   Update location state
    │       │
    │       ▼
    │   Triggers usePlaces to refetch nearby
    │
    └─ Cleanup on unmount
            │
            ▼
        subscription.remove()

Returned Data:
──────────────
{
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 5.0    ← Accuracy in meters
  },
  
  mapRegion: {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421
  },
  
  updateMapRegion: (region) => {...},  ← For manual map updates
  
  isLoading: false,
  
  error: null  ← or error message
}

Usage in Map Screen:
────────────────────
const { location, mapRegion } = useLocation();

// When location updates, fetch nearby places
useEffect(() => {
  if (location) {
    fetchNearbyPlaces(
      location.latitude,
      location.longitude,
      5000  ← 5km radius
    );
  }
}, [location, fetchNearbyPlaces]);

// Render map with location
<MapView
  initialRegion={mapRegion}
  showsUserLocation={true}  ← Blue dot
/>
```

## 6. API Request Flow with JWT

```
┌──────────────────────────────────────────────────────┐
│      API Client Request/Response Cycle               │
└──────────────────────────────────────────────────────┘

Application Code:
─────────────────
placesAPI.getMyPlaces()
    │
    ▼
apiClient.get('/places')
    │
    ▼
Axios Request Interceptor:
──────────────────────────
    ├─ Get token from AsyncStorage
    ├─ Add to headers:
    │  Authorization: "Bearer eyJhbGc..."
    │
    └─ Continue request
         │
         ▼
HTTP Request:
─────────────
GET /api/places
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer TOKEN'
}
    │
    ▼
Backend Processing:
───────────────────
    ├─ Verify JWT token
    ├─ Get user ID from token
    ├─ Query database for user's places
    │
    └─ Return 200 + data
         │
         ▼
HTTP Response:
──────────────
{
  success: true,
  data: [
    {
      id: 1,
      name: "Place Name",
      latitude: 37.77,
      longitude: -122.41,
      ...
    }
  ]
}
    │
    ▼
Axios Response Interceptor:
───────────────────────────
    ├─ Check status
    ├─ Handle errors if needed
    │
    └─ Return to app
         │
         ▼
Application Code:
─────────────────
const places = response.data.data
// Now use places in component

Error Handling:
───────────────
Request Error (Network):
    → Catch in hook
    → Set error state
    → Show error message

401 Unauthorized (Token Expired):
    → Interceptor catches
    → Try to refresh token
    → Retry request with new token
    → Or redirect to login

Other Errors (500, etc):
    → Catch in hook
    → Show user-friendly message
    → Suggest retry

Example in usePlaces Hook:
──────────────────────────
try {
  setIsLoading(true);
  const places = await placesAPI.getMyPlaces();
  setMyPlaces(places);
} catch (err) {
  setError(err.message);
  console.error(err);
} finally {
  setIsLoading(false);
}
```

## 7. User Interaction Timeline

```
User Opens App:
───────────────
Time: T0
    │
    ├─ Splash screen shows
    ├─ useAuth checks storage
    ├─ useLocation requests permission
    │
    └─→ T1: User sees map (already logged in)
       OR
       └─→ Login screen (not logged in)

User on Map:
────────────
T1: App displays map
    │
    ├─ Blue dot shows user location
    ├─ Pins appear for places
    ├─ Info bar shows count
    │
    └─ Waiting for user interaction

User Taps Pin:
──────────────
T1 + 100ms: User taps blue pin
            │
            ▼
        MapPin onPress triggered
            │
            ▼
        handleMarkerPress(place)
            │
            ├─ Store selectedPlace
            ├─ Navigate to place-details
            │
            └─→ T2: Place details screen loads

User Taps "Add" Button:
──────────────────────
T1 + 500ms: User taps FAB
            │
            ▼
        router.push('/add-place')
            │
            └─→ T2: Add place screen loads

User Toggles Filter:
────────────────────
T1 + 300ms: User taps "Friends" button
            │
            ├─ setShowNearbyOnly(true)
            ├─ nearbyPlaces become visible
            ├─ myPlaces are hidden
            │
            └─→ T1+310ms: Map updates with animation

User Navigates to Friends Tab:
───────────────────────────────
T1 + 200ms: User taps Friends tab
            │
            ├─ Stop displaying map
            ├─ Show friends list
            ├─ Display friend requests
            │
            └─→ T2: Friends screen active

User Returns to Map:
────────────────────
T2 + 400ms: User taps Map tab
            │
            ├─ Resume map display
            ├─ Check if location updated
            ├─ Refetch places if needed
            │
            └─→ T3: Map screen reappears
```

## 8. Data Structure Relationships

```
┌─────────────┐
│    User     │
├─────────────┤
│ id          │ ◄─────────┐
│ email       │           │
│ firstName   │           │
│ lastName    │           │ 1:N
│ bio         │           │ (One user, many places)
│ latitude    │           │
│ longitude   │           │
│ profilePic  │           ├─────────┐
└─────────────┘           │         │
      ▲                   │         │
      │ 1:N               │         │
      │ (created by)      ▼         │
      │              ┌─────────┐    │
      │              │  Place  │    │
      │              ├─────────┤    │
      │              │ id      │    │
      │              │ userId  ├────┘
      │              │ name    │
      │ N:N          │ lat/lng │
      │ (friendship) │ address │
      │              │ rating  │
      │              │ notes   │
      │              │ food    │
      │              │ drink   │
      │              └────┬────┘
      │                   │
      │                   │ 1:N
      │                   │ (Place has many photos)
      │                   │
      │                   ▼
      │              ┌─────────┐
      │              │  Photo  │
      │              ├─────────┤
      │              │ id      │
      │              │ placeId │
      │              │ url     │
      │              │ date    │
      │              └─────────┘
      │
      ├─────┐
      │     │
      │     ▼
      │  ┌──────────────┐
      │  │ Friendship   │
      │  ├──────────────┤
      │  │ senderId     │ ──┐
      │  │ receiverId   │ ──┼─→ User.id
      │  │ status       │   │
      │  │ createdAt    │ ──┘
      │  └──────────────┘
      │
      └─ N:N through Friendship
         (Connected to other users)
```

---

This document provides visual representations of all major flows and relationships in the Haritaly mobile app. Use these diagrams alongside the code comments for better understanding of the architecture.
