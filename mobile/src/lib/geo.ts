import { MapRegion } from '@/src/types';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_M = 6_371_000;
export const METERS_PER_DEGREE = 111_320;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * A point rounded to two decimals, about a kilometre: 0.01° is 1.1 km north–south and a little less east–west.
 * Used when the server only needs an area, so it never receives exactly where the user is.
 */
export function roundToKilometer(point: Coordinates): Coordinates {
  return {
    latitude: Math.round(point.latitude * 100) / 100,
    longitude: Math.round(point.longitude * 100) / 100,
  };
}

/** The farthest a rounded point can be from the real one: half the diagonal of a 0.01° cell is at most 790 m. */
export const ROUNDING_MARGIN_M = 800;

/** Great-circle distance in meters. */
export function distanceInMeters(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** A region of roughly `meters` across, centered on a point. */
export function regionAround(point: Coordinates, meters = 1500): MapRegion {
  const latitudeDelta = meters / METERS_PER_DEGREE;
  return {
    latitude: point.latitude,
    longitude: point.longitude,
    latitudeDelta,
    longitudeDelta: latitudeDelta / Math.max(Math.cos(toRad(point.latitude)), 0.2),
  };
}

/** The smallest region that shows every point, with some breathing room around them. */
export function regionForPoints(points: Coordinates[], padding = 1.6, minMeters = 1200): MapRegion | null {
  if (points.length === 0) return null;
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const center = { latitude: (minLat + maxLat) / 2, longitude: (minLng + maxLng) / 2 };
  const min = regionAround(center, minMeters);
  return {
    ...center,
    latitudeDelta: Math.max((maxLat - minLat) * padding, min.latitudeDelta),
    longitudeDelta: Math.max((maxLng - minLng) * padding, min.longitudeDelta),
  };
}

/** Whether a point is inside the visible region. */
export function regionContains(region: MapRegion, point: Coordinates): boolean {
  return (
    Math.abs(point.latitude - region.latitude) <= region.latitudeDelta / 2 &&
    Math.abs(point.longitude - region.longitude) <= region.longitudeDelta / 2
  );
}

/** Distance from the center of the region to its corner, in meters. */
export function regionRadius(region: MapRegion): number {
  const halfHeight = (region.latitudeDelta / 2) * METERS_PER_DEGREE;
  const halfWidth = (region.longitudeDelta / 2) * METERS_PER_DEGREE * Math.cos(toRad(region.latitude));
  return Math.hypot(halfHeight, halfWidth);
}
