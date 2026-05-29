import { useEffect, useState, useCallback } from 'react';
import { Place } from '@/src/types';
import { placesAPI } from '@/src/api/places';

interface UsePlacesReturn {
  myPlaces: Place[];
  nearbyPlaces: Place[];
  allPlaces: Place[];
  isLoading: boolean;
  error: string | null;
  refreshPlaces: () => Promise<void>;
  fetchNearbyPlaces: (latitude: number, longitude: number, radius?: number) => Promise<void>;
}

export const usePlaces = (): UsePlacesReturn => {
  const [myPlaces, setMyPlaces] = useState<Place[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's own places
  const refreshPlaces = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('[usePlaces] Fetching places from /places ...');
      const raw = await placesAPI.getMyPlaces();
      console.log('[usePlaces] Raw fetched places:', raw);
      setMyPlaces(raw);
      console.log('[usePlaces] myPlaces state set:', raw);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load places';
      setError(errorMessage);
      console.error('Error fetching places:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch nearby places from friends
  const fetchNearbyPlaces = useCallback(
    async (latitude: number, longitude: number, radius: number = 5000) => {
      try {
        setIsLoading(true);
        setError(null);
        const nearby = await placesAPI.getNearbyPlaces(latitude, longitude, radius);
        setNearbyPlaces(nearby);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load nearby places';
        setError(errorMessage);
        console.error('Error fetching nearby places:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Load places on mount
  useEffect(() => {
    refreshPlaces();
  }, [refreshPlaces]);

  // Combine all places (own + nearby from friends)
  const allPlaces = [...myPlaces, ...nearbyPlaces];
  console.log('[usePlaces] allPlaces:', allPlaces);

  return {
    myPlaces,
    nearbyPlaces,
    allPlaces,
    isLoading,
    error,
    refreshPlaces,
    fetchNearbyPlaces,
  };
};
