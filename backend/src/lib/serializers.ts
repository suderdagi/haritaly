type DecimalLike = { toString(): string } | number;

function toNumber(value: DecimalLike): number {
  return typeof value === 'number' ? value : Number(value.toString());
}

/** Prisma returns Decimal objects for coordinates and rating; the API exposes plain numbers. */
export function serializePlace<
  T extends { latitude: DecimalLike; longitude: DecimalLike; rating?: DecimalLike | null },
>(place: T) {
  return {
    ...place,
    latitude: toNumber(place.latitude),
    longitude: toNumber(place.longitude),
    rating: place.rating == null ? null : toNumber(place.rating),
  };
}
