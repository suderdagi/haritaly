function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  return Number(value?.toString());
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return toNumber(value);
}

export function serializePlace<T extends { latitude: unknown; longitude: unknown; rating?: unknown }>(
  place: T
) {
  return {
    ...place,
    latitude: toNumber(place.latitude),
    longitude: toNumber(place.longitude),
    rating: toNullableNumber(place.rating),
  };
}
