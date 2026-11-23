import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Place } from '@/src/types';
import { placesAPI } from '@/src/api/places';
import { getErrorMessage } from '@/src/api/client';
import { haptics } from '@/src/lib/haptics';

/** The places the map shows: your own, your friends' in the visible area, and which ones are favorites. */
export const usePlaces = () => {
  const [myPlaces, setMyPlaces] = useState<Place[]>([]);
  const [friendPlaces, setFriendPlaces] = useState<Place[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loadingMine, setLoadingMine] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const refreshMine = useCallback(async () => {
    setLoadingMine(true);
    try {
      setMyPlaces(await placesAPI.getMyPlaces());
    } catch {
      // Keep showing the last places that loaded
    } finally {
      setLoadingMine(false);
      setLoadedOnce(true);
    }
  }, []);

  const refreshFavorites = useCallback(async () => {
    try {
      const favorites = await placesAPI.getFavorites();
      setFavoriteIds(new Set(favorites.map((p) => p.id)));
    } catch {
      // Favorites only add a badge; the map works without them
    }
  }, []);

  const latestNearbyRequest = useRef(0);

  /** Friends' places within `radius` meters of a point. */
  const fetchFriendsNear = useCallback(async (latitude: number, longitude: number, radius: number) => {
    const requestId = ++latestNearbyRequest.current;
    setLoadingFriends(true);
    try {
      const places = await placesAPI.getNearbyPlaces(latitude, longitude, radius);
      // When the map moves quickly, an older and slower response must not replace a newer one
      if (requestId === latestNearbyRequest.current) setFriendPlaces(places);
    } catch {
      // Keep showing the last places that loaded
    } finally {
      if (requestId === latestNearbyRequest.current) setLoadingFriends(false);
    }
  }, []);

  const toggleFavorite = useCallback(
    async (place: Place) => {
      const next = !favoriteIds.has(place.id);
      const update = (add: boolean) =>
        setFavoriteIds((prev) => {
          const copy = new Set(prev);
          if (add) copy.add(place.id);
          else copy.delete(place.id);
          return copy;
        });

      // Optimistic, rolled back if the request fails
      update(next);
      haptics.selection();
      try {
        if (next) await placesAPI.addFavorite(place.id);
        else await placesAPI.removeFavorite(place.id);
      } catch (error) {
        update(!next);
        Alert.alert('Could not update favorites', getErrorMessage(error, 'Please try again.'));
      }
    },
    [favoriteIds]
  );

  const allPlaces = useMemo(() => {
    const byId = new Map<number, Place>();
    for (const place of [...myPlaces, ...friendPlaces]) byId.set(place.id, place);
    return [...byId.values()];
  }, [myPlaces, friendPlaces]);

  const isFavorite = useCallback((placeId: number) => favoriteIds.has(placeId), [favoriteIds]);

  return {
    myPlaces,
    allPlaces,
    isFavorite,
    toggleFavorite,
    loading: loadingMine || loadingFriends,
    loadedOnce,
    refreshMine,
    refreshFavorites,
    fetchFriendsNear,
  };
};
