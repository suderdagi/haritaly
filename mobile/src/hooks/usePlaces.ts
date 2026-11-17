import { useCallback, useMemo, useState } from 'react';
import { Place } from '@/src/types';
import { placesAPI } from '@/src/api/places';

export const usePlaces = () => {
  const [myPlaces, setMyPlaces] = useState<Place[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPlaces = useCallback(async () => {
    setIsLoading(true);
    try {
      setMyPlaces(await placesAPI.getMyPlaces());
      setError(null);
    } catch {
      // Keep the map usable and show the last known places
      setError('Could not load your places');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Friends' places within `radius` meters of the given point. */
  const fetchNearbyPlaces = useCallback(async (latitude: number, longitude: number, radius = 5000) => {
    try {
      setNearbyPlaces(await placesAPI.getNearbyPlaces(latitude, longitude, radius));
    } catch {
      setNearbyPlaces([]);
    }
  }, []);

  const allPlaces = useMemo(() => [...myPlaces, ...nearbyPlaces], [myPlaces, nearbyPlaces]);

  return { myPlaces, nearbyPlaces, allPlaces, isLoading, error, refreshPlaces, fetchNearbyPlaces };
};
