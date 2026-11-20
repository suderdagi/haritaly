import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocation } from '@/src/hooks/useLocation';
import { usePlaces } from '@/src/hooks/usePlaces';
import { MapPin } from '@/src/components/MapPin/MapPin';
import { MapRegion, Place } from '@/src/types';

// Istanbul, used until the user's location is known
const INITIAL_REGION = {
  latitude: 41.0082,
  longitude: 28.9784,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// The nearby endpoint accepts radii between 100 m and 50 km
const MIN_RADIUS_M = 100;
const MAX_RADIUS_M = 50_000;
const METERS_PER_DEGREE = 111_320;
const REGION_DEBOUNCE_MS = 400;

/** Distance from the center of the visible map to its corner, so the search circle covers the screen. */
function regionRadius(region: MapRegion): number {
  const halfHeight = (region.latitudeDelta / 2) * METERS_PER_DEGREE;
  const halfWidth =
    (region.longitudeDelta / 2) * METERS_PER_DEGREE * Math.cos((region.latitude * Math.PI) / 180);
  return Math.round(Math.min(Math.max(Math.hypot(halfHeight, halfWidth), MIN_RADIUS_M), MAX_RADIUS_M));
}

export default function MapScreen() {
  const router = useRouter();
  const { location, mapRegion, updateMapRegion, isLoading: locationLoading } = useLocation();
  const {
    myPlaces,
    nearbyPlaces,
    allPlaces,
    isLoading: placesLoading,
    refreshPlaces,
    fetchNearbyPlaces,
  } = usePlaces();

  const [showNearbyOnly, setShowNearbyOnly] = useState(false);

  // `initialRegion` is only read when the map mounts, so the camera has to be moved
  // by hand once the first location fix arrives
  const mapRef = useRef<MapView>(null);
  const centeredOnUser = useRef(false);
  useEffect(() => {
    if (location && !centeredOnUser.current) {
      centeredOnUser.current = true;
      mapRef.current?.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: INITIAL_REGION.latitudeDelta,
          longitudeDelta: INITIAL_REGION.longitudeDelta,
        },
        600
      );
    }
  }, [location]);

  // Friends' places are loaded for the area on screen, so panning the map (to another
  // neighborhood or city) shows the places saved there
  const regionRef = useRef<MapRegion>(mapRegion);
  regionRef.current = mapRegion;
  const lastQuery = useRef('');

  const loadFriendsInView = useCallback(
    (force = false) => {
      const region = regionRef.current;
      const radius = regionRadius(region);
      const query = `${region.latitude.toFixed(4)},${region.longitude.toFixed(4)},${radius}`;
      if (!force && query === lastQuery.current) return;
      lastQuery.current = query;
      fetchNearbyPlaces(region.latitude, region.longitude, radius);
    },
    [fetchNearbyPlaces]
  );

  // Reload when the tab gets focus so new or edited places show up immediately
  useFocusEffect(
    useCallback(() => {
      refreshPlaces();
      loadFriendsInView(true);
    }, [refreshPlaces, loadFriendsInView])
  );

  // Wait until the map stops moving before asking the server
  useEffect(() => {
    const timer = setTimeout(() => loadFriendsInView(), REGION_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [mapRegion, loadFriendsInView]);

  const handleMarkerPress = (place: Place) => {
    router.push({ pathname: '/place-details', params: { placeId: place.id } });
  };

  const displayedPlaces = showNearbyOnly ? nearbyPlaces : allPlaces;
  const uniqueDisplayedPlaces = Array.from(
    new Map(displayedPlaces.map((place) => [String(place.id), place])).values()
  );

  return (
    <View style={styles.container}>
      {/* Map: Apple Maps on iOS, Google Maps on Android (each platform's default provider) */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion || INITIAL_REGION}
        onRegionChangeComplete={updateMapRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Display all places as markers */}
        {uniqueDisplayedPlaces.map((place) => (
          <Marker
            key={`place-${place.id}`}
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
      </MapView>

      {/* Loading indicator */}
      {(locationLoading || placesLoading) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      )}

      {/* Top controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={[styles.filterButton, !showNearbyOnly && styles.filterButtonActive]}
          onPress={() => setShowNearbyOnly(false)}
        >
          <MaterialCommunityIcons name="cards" size={20} color={!showNearbyOnly ? '#fff' : '#6b7280'} />
          <Text style={[styles.filterText, !showNearbyOnly && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, showNearbyOnly && styles.filterButtonActive]}
          onPress={() => setShowNearbyOnly(true)}
        >
          <MaterialCommunityIcons
            name="account-multiple"
            size={20}
            color={showNearbyOnly ? '#fff' : '#6b7280'}
          />
          <Text style={[styles.filterText, showNearbyOnly && styles.filterTextActive]}>
            Friends
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info bar */}
      <View style={styles.infoBar}>
        <View>
          <Text style={styles.infoTitle}>{showNearbyOnly ? "Friends' places in this area" : 'All places'}</Text>
          <Text style={styles.infoCount}>
            {uniqueDisplayedPlaces.length} {uniqueDisplayedPlaces.length === 1 ? 'place' : 'places'}
          </Text>
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#6366f1' }]} />
            <Text style={styles.legendText}>Saved</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ec4899' }]} />
            <Text style={styles.legendText}>Friends</Text>
          </View>
        </View>
      </View>

      {/* Add place button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add-place')}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
  },
  topControls: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  infoBar: {
    position: 'absolute',
    bottom: 96,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
