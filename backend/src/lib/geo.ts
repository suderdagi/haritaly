const EARTH_RADIUS_M = 6_371_000;

const toRad = (deg: number) => (deg * Math.PI) / 180;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Great-circle distance between two points in meters (Haversine formula). */
export function distanceInMeters(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/**
 * Rectangle that contains every point within `radius` meters of `center`.
 * Used to pre-filter rows in the database before the exact distance check.
 */
export function boundingBox(center: Coordinates, radius: number) {
  const latDelta = (radius / EARTH_RADIUS_M) * (180 / Math.PI);
  const lngDelta = latDelta / Math.max(Math.cos(toRad(center.latitude)), 0.000001);

  return {
    minLat: Math.max(center.latitude - latDelta, -90),
    maxLat: Math.min(center.latitude + latDelta, 90),
    minLng: center.longitude - lngDelta,
    maxLng: center.longitude + lngDelta,
  };
}
