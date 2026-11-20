import { useCallback, useMemo, useRef, useState } from 'react';
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

  const latestNearbyRequest = useRef(0);

  /** Friends' places within `radius` meters of the given point. */
  const fetchNearbyPlaces = useCallback(async (latitude: number, longitude: number, radius = 5000) => {
    const requestId = ++latestNearbyRequest.current;
    try {
      const places = await placesAPI.getNearbyPlaces(latitude, longitude, radius);
      // When the map moves quickly, an older and slower response must not replace the newer one
      if (requestId === latestNearbyRequest.current) {
        setNearbyPlaces(places);
      }
    } catch {
      // Keep showing the last places that loaded
    }
  }, []);

  const allPlaces = useMemo(() => [...myPlaces, ...nearbyPlaces], [myPlaces, nearbyPlaces]);

  return { myPlaces, nearbyPlaces, allPlaces, isLoading, error, refreshPlaces, fetchNearbyPlaces };
};
