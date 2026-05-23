import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { MapRegion } from '@/src/types';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [mapRegion, setMapRegion] = useState<MapRegion>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        setIsLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setError('Location permission denied');
          setIsLoading(false);
          return;
        }

        // Get current location
        const userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const coords = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          accuracy: userLocation.coords.accuracy,
        };

        setLocation(coords);
        setMapRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get location');
      } finally {
        setIsLoading(false);
      }
    };

    requestLocationPermission();
  }, []);

  // Watch location changes (optional, for real-time updates)
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startWatchingLocation = async () => {
      try {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000, // Update every 10 seconds
            distanceInterval: 50, // Or when distance changes by 50 meters
          },
          (newLocation) => {
            const coords = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              accuracy: newLocation.coords.accuracy,
            };
            setLocation(coords);
          }
        );
      } catch (err) {
        console.error('Error watching location', err);
      }
    };

    startWatchingLocation();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const updateMapRegion = (newRegion: MapRegion) => {
    setMapRegion(newRegion);
  };

  return {
    location,
    mapRegion,
    updateMapRegion,
    isLoading,
    error,
  };
};
