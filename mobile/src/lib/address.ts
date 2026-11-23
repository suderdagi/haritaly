import * as Location from 'expo-location';
import { Coordinates } from './geo';

/**
 * A readable address for a point, from the phone's own geocoder (Apple's on iPhone).
 * Needs no location permission. Returns null when nothing is known, or on the web.
 */
export async function describeLocation(point: Coordinates): Promise<string | null> {
  try {
    const [hit] = await Location.reverseGeocodeAsync(point);
    if (!hit) return null;
    const street = [hit.street, hit.streetNumber].filter(Boolean).join(' ');
    const parts = [hit.name && hit.name !== street ? hit.name : null, street || null, hit.district, hit.city];
    // Drop empty and repeated parts ("Beyoğlu, Beyoğlu")
    const unique = parts.filter((p, i): p is string => !!p && parts.indexOf(p) === i);
    return unique.slice(0, 3).join(', ') || null;
  } catch {
    return null;
  }
}
