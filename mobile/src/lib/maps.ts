import { Linking, Platform, Share } from 'react-native';
import { Place } from '@/src/types';

type Located = Pick<Place, 'name' | 'latitude' | 'longitude'> & { address?: string | null };

const googleLink = (p: Located) => `https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`;
const googleDirections = (p: Located) =>
  `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`;

const open = (url: string | undefined, fallback: string) =>
  Linking.openURL(url ?? fallback).catch(() => Linking.openURL(fallback));

/** Directions from the current location, in Apple Maps on iPhone. */
export function openDirections(place: Located) {
  const { latitude: lat, longitude: lng } = place;
  open(
    Platform.select({
      ios: `maps://?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
    }),
    googleDirections(place)
  );
}

/** The place as a labelled pin in Apple Maps on iPhone. */
export function openInMaps(place: Located) {
  const label = encodeURIComponent(place.name);
  const { latitude: lat, longitude: lng } = place;
  open(
    Platform.select({
      ios: `maps://?ll=${lat},${lng}&q=${label}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
    }),
    googleLink(place)
  );
}

/** The system share sheet with the name, address and a map link anyone can open. */
export function sharePlace(place: Located) {
  return Share.share({
    title: place.name,
    message: [place.name, place.address, googleLink(place)].filter(Boolean).join('\n'),
  }).catch(() => {});
}
