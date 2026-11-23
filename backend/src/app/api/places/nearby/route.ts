import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { NearbyQuerySchema } from '@/src/lib/validators';
import { serializePlace } from '@/src/lib/serializers';
import { getFriendIds } from '@/src/lib/friends';
import { placeInclude } from '@/src/lib/places';
import { boundingBox, distanceInMeters } from '@/src/lib/geo';
import { fail, ok, requireAuth } from '@/src/lib/http';

// GET /api/places/nearby?lat=..&lng=..&radius=5000&category=Cafe
// Places saved by the user's friends within `radius` meters, closest first.
export async function GET(req: NextRequest) {
  try {
    const { id: userId } = requireAuth(req);
    const query = NearbyQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const center = { latitude: query.lat, longitude: query.lng };

    const friendIds = await getFriendIds(userId);
    if (friendIds.length === 0) {
      return ok([]);
    }

    // Cheap rectangle filter in the database, exact distance check in code
    const box = boundingBox(center, query.radius);
    const candidates = await db.place.findMany({
      where: {
        userId: { in: friendIds },
        isPrivate: false,
        latitude: { gte: box.minLat, lte: box.maxLat },
        longitude: { gte: box.minLng, lte: box.maxLng },
        ...(query.category ? { category: query.category } : {}),
      },
      include: placeInclude,
    });

    const places = candidates
      .map((place) => {
        const serialized = serializePlace(place);
        return { ...serialized, distance: Math.round(distanceInMeters(center, serialized)) };
      })
      .filter((place) => place.distance <= query.radius)
      .sort((a, b) => a.distance - b.distance);

    return ok(places);
  } catch (error) {
    return fail(error);
  }
}
