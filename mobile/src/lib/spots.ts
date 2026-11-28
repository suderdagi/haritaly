import { MapRegion, Place } from '@/src/types';
import { distanceInMeters } from './geo';

/**
 * Two kinds of grouping keep the map readable:
 *
 * 1. Spots. When you and your friends save the same place, each of you has your own entry (with your own
 *    notes and favorites). Entries with matching names within SAME_PLACE_RADIUS_M are one spot, drawn as one
 *    marker that says how many people saved it. Uses the same rules as the server's AI summaries.
 *
 * 2. Clusters. When zoomed out, spots that would overlap on screen are merged into a numbered circle;
 *    tapping it zooms in. This depends on the zoom level and is recalculated as the map moves.
 */

export const SAME_PLACE_RADIUS_M = 100;

/** Lowercase, drop accents and punctuation: "Kahve Dünyası!" -> "kahve dunyasi" */
export function normalizeName(name: string): string {
  let s = name.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase().replace(/ı/g, 'i');
  try {
    s = s.normalize('NFKD').replace(/[̀-ͯ]/g, '');
  } catch {
    // Without Unicode normalization, accented letters simply stay as they are
  }
  return s.replace(/[^a-z0-9]+/g, ' ').trim();
}

/** "Kronotrop" matches "Kronotrop Cihangir", but very short names must match exactly. */
export function namesMatch(a: string, b: string): boolean {
  const x = normalizeName(a);
  const y = normalizeName(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const [shorter, longer] = x.length <= y.length ? [x, y] : [y, x];
  return shorter.length >= 4 && longer.includes(shorter);
}

export interface Spot {
  key: string;
  latitude: number;
  longitude: number;
  /** The entry the marker represents: yours if you saved it, otherwise the newest. */
  primary: Place;
  /** Every entry for this spot, yours first. */
  places: Place[];
  hasMine: boolean;
  /** Number of different people who saved it. */
  people: number;
}

export function groupIntoSpots(places: Place[], myId?: number): Spot[] {
  // Yours first, then newest, so the representative entry is chosen consistently
  const sorted = [...places].sort((a, b) => {
    const mineDiff = Number(b.userId === myId) - Number(a.userId === myId);
    return mineDiff || b.createdAt.localeCompare(a.createdAt) || a.id - b.id;
  });

  const spots: Spot[] = [];
  for (const place of sorted) {
    const spot = spots.find(
      (s) => namesMatch(s.primary.name, place.name) && distanceInMeters(s.primary, place) <= SAME_PLACE_RADIUS_M
    );
    if (spot) {
      spot.places.push(place);
    } else {
      spots.push({
        key: `spot-${place.id}`,
        latitude: place.latitude,
        longitude: place.longitude,
        primary: place,
        places: [place],
        hasMine: false,
        people: 0,
      });
    }
  }

  for (const spot of spots) {
    spot.hasMine = spot.places.some((p) => p.userId === myId);
    spot.people = new Set(spot.places.map((p) => p.userId)).size;
  }
  return spots;
}

export interface Cluster {
  key: string;
  latitude: number;
  longitude: number;
  spots: Spot[];
}

export type MapItem = { kind: 'spot'; spot: Spot } | { kind: 'cluster'; cluster: Cluster };

/**
 * Merges spots that would be closer than `thresholdPx` on screen. `keep` (the selected spot) is never
 * merged, so the selection stays visible.
 */
export function clusterSpots(
  spots: Spot[],
  region: MapRegion,
  size: { width: number; height: number },
  keep?: string | null,
  thresholdPx = 46
): MapItem[] {
  if (!size.width || !size.height) return spots.map((spot) => ({ kind: 'spot', spot }));

  const toPoint = (p: { latitude: number; longitude: number }) => ({
    x: ((p.longitude - region.longitude) / region.longitudeDelta) * size.width,
    y: ((region.latitude - p.latitude) / region.latitudeDelta) * size.height,
  });

  const groups: { anchor: { x: number; y: number }; spots: Spot[] }[] = [];
  const kept: Spot[] = [];
  // A fixed order keeps clusters from flickering between frames
  for (const spot of [...spots].sort((a, b) => a.primary.id - b.primary.id)) {
    if (spot.key === keep) {
      kept.push(spot);
      continue;
    }
    const point = toPoint(spot);
    const group = groups.find((g) => Math.hypot(g.anchor.x - point.x, g.anchor.y - point.y) < thresholdPx);
    if (group) group.spots.push(spot);
    else groups.push({ anchor: point, spots: [spot] });
  }

  const items: MapItem[] = groups.map((g) => {
    if (g.spots.length === 1) return { kind: 'spot', spot: g.spots[0] };
    const latitude = g.spots.reduce((sum, s) => sum + s.latitude, 0) / g.spots.length;
    const longitude = g.spots.reduce((sum, s) => sum + s.longitude, 0) / g.spots.length;
    return {
      kind: 'cluster',
      cluster: { key: `cluster-${g.spots.map((s) => s.primary.id).join('-')}`, latitude, longitude, spots: g.spots },
    };
  });
  return [...items, ...kept.map((spot) => ({ kind: 'spot' as const, spot }))];
}
