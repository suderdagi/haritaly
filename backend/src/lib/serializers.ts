type DecimalLike = { toString(): string } | number;

function toNumber(value: DecimalLike): number {
  return typeof value === 'number' ? value : Number(value.toString());
}

/**
 * Prisma returns Decimal objects for coordinates; the API exposes plain numbers.
 * Places no longer have ratings, so an old value still in the database is left out.
 */
export function serializePlace<T extends { latitude: DecimalLike; longitude: DecimalLike; rating?: unknown }>(
  place: T
): Omit<T, 'latitude' | 'longitude' | 'rating'> & { latitude: number; longitude: number } {
  const { latitude, longitude, rating, ...rest } = place;
  void rating;
  return { ...rest, latitude: toNumber(latitude), longitude: toNumber(longitude) };
}
