import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Linking } from 'react-native';
import * as Location from 'expo-location';
import { Coordinates } from '@/src/lib/geo';

/**
 * Location, shared by the whole signed-in app.
 *
 * Privacy rules this follows (App Store guideline 5.1.1 and Apple's HIG):
 * - Nothing asks for permission on launch. The system prompt appears only after the user taps something
 *   that needs location (the locate button, "Use my location", "Current location" when adding a place),
 *   and the screen explains why before they tap.
 * - Only "while using the app" access is requested. There is no background location.
 * - The position stays on the device; it is only used to center the map, measure distances and fill in
 *   the coordinates of a place the user saves. It is never sent to friends.
 * - Everything still works without it: the map can be moved and searched, and places can be added by
 *   searching for an address or moving a pin.
 */

export type LocationStatus = 'checking' | 'undetermined' | 'granted' | 'denied';

interface LocationContextValue {
  status: LocationStatus;
  coords: Coordinates | null;
  /** Shows the system prompt if it has not been answered yet, then returns a fresh position. */
  requestLocation: () => Promise<Coordinates | null>;
  /** For when permission was denied: explains, then offers the Settings app. */
  explainDenied: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

const toCoords = (p: Location.LocationObject): Coordinates => ({
  latitude: p.coords.latitude,
  longitude: p.coords.longitude,
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<LocationStatus>('checking');
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const watcher = useRef<Location.LocationSubscription | null>(null);

  const startUpdates = useCallback(async () => {
    try {
      // The last known position appears instantly; a fresh one follows
      const last = await Location.getLastKnownPositionAsync();
      if (last) setCoords(toCoords(last));
    } catch {
      // No cached position yet
    }
    if (watcher.current) return;
    try {
      watcher.current = await Location.watchPositionAsync(
        // Balanced accuracy is plenty for "places near me" and much kinder to the battery than GPS
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 75, timeInterval: 15_000 },
        (position) => setCoords(toCoords(position))
      );
    } catch {
      // Location services may be switched off for the whole phone
    }
  }, []);

  const stopUpdates = useCallback(() => {
    watcher.current?.remove();
    watcher.current = null;
  }, []);

  const syncPermission = useCallback(async () => {
    try {
      const permission = await Location.getForegroundPermissionsAsync();
      const next: LocationStatus =
        permission.status === 'granted' ? 'granted' : permission.status === 'denied' ? 'denied' : 'undetermined';
      setStatus(next);
      if (next === 'granted') startUpdates();
      else stopUpdates();
      return next;
    } catch {
      setStatus('undetermined');
      return 'undetermined' as const;
    }
  }, [startUpdates, stopUpdates]);

  useEffect(() => {
    syncPermission();
    // The user may change the permission in Settings while the app is in the background
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncPermission();
    });
    return () => {
      subscription.remove();
      stopUpdates();
    };
  }, [syncPermission, stopUpdates]);

  const explainDenied = useCallback(() => {
    Alert.alert(
      'Location is turned off',
      'To see places around you, allow Haritaly to use your location while you use the app. You can change this in Settings.',
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  }, []);

  const requestLocation = useCallback(async (): Promise<Coordinates | null> => {
    let current = status === 'checking' ? await syncPermission() : status;

    if (current === 'undetermined') {
      const answer = await Location.requestForegroundPermissionsAsync();
      current = answer.status === 'granted' ? 'granted' : 'denied';
      setStatus(current);
      // They just said no in the system prompt: respect that without asking again
      if (current !== 'granted') return null;
    }

    // Denied earlier, and now they tapped something that needs location: say where to change it
    if (current !== 'granted') {
      explainDenied();
      return null;
    }

    startUpdates();
    try {
      const fresh = toCoords(await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      setCoords(fresh);
      return fresh;
    } catch {
      return coords;
    }
  }, [status, coords, syncPermission, startUpdates, explainDenied]);

  const value = useMemo(
    () => ({ status, coords, requestLocation, explainDenied }),
    [status, coords, requestLocation, explainDenied]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useUserLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useUserLocation must be used inside LocationProvider');
  return context;
}
