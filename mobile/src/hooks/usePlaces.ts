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
      const raw = await placesAPI.getMyPlaces();
      setMyPlaces(raw);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load places';
      // Non-blocking: warn instead of throwing an aggressive error so the map stays usable
      console.warn('Non-fatal: Error fetching places:', err);
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
        // Silently fail nearby fetch, allPlaces will use myPlaces as fallback
        setNearbyPlaces([]);
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
