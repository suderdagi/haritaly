import { Coordinates } from './geo';

export interface PendingLocation extends Coordinates {
  address: string | null;
}

/**
 * Hands a chosen location to the add-place screen: from a pin dropped on the map, or from the
 * location picker when it closes. Read once, then cleared.
 */
let pending: PendingLocation | null = null;

export function setPendingLocation(location: PendingLocation) {
  pending = location;
}

export function takePendingLocation(): PendingLocation | null {
  const location = pending;
  pending = null;
  return location;
}
