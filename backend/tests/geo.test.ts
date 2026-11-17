import { describe, expect, it } from 'vitest';
import { boundingBox, distanceInMeters } from '@/src/lib/geo';

const taksim = { latitude: 41.0369, longitude: 28.985 };
const kadikoy = { latitude: 40.9901, longitude: 29.0292 };

describe('distanceInMeters', () => {
  it('returns 0 for the same point', () => {
    expect(distanceInMeters(taksim, taksim)).toBe(0);
  });

  it('calculates Taksim to Kadıköy as roughly 6.3 km', () => {
    const d = distanceInMeters(taksim, kadikoy);
    expect(d).toBeGreaterThan(6000);
    expect(d).toBeLessThan(6600);
  });

  it('is symmetric', () => {
    expect(distanceInMeters(taksim, kadikoy)).toBeCloseTo(distanceInMeters(kadikoy, taksim), 6);
  });
});

describe('boundingBox', () => {
  it('contains every point inside the radius', () => {
    const box = boundingBox(taksim, 7000);
    expect(kadikoy.latitude).toBeGreaterThanOrEqual(box.minLat);
    expect(kadikoy.latitude).toBeLessThanOrEqual(box.maxLat);
    expect(kadikoy.longitude).toBeGreaterThanOrEqual(box.minLng);
    expect(kadikoy.longitude).toBeLessThanOrEqual(box.maxLng);
  });

  it('excludes far away points', () => {
    const box = boundingBox(taksim, 1000);
    expect(kadikoy.latitude < box.minLat || kadikoy.longitude > box.maxLng).toBe(true);
  });
});
