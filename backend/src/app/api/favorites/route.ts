import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { serializePlace } from '@/src/lib/serializers';
import { getFriendIds } from '@/src/lib/friends';
import { placeInclude, visibleToViewer } from '@/src/lib/places';
import { fail, ok, requireAuth } from '@/src/lib/http';

// GET /api/favorites — the user's favorite places, newest first
export async function GET(req: NextRequest) {
  try {
    const { id: userId } = requireAuth(req);
    const friendIds = await getFriendIds(userId);

    const favorites = await db.favorite.findMany({
      // If a friendship ends or a friend makes a place private, it silently disappears from favorites
      where: { userId, place: visibleToViewer(userId, friendIds) },
      include: { place: { include: placeInclude } },
      orderBy: { createdAt: 'desc' },
    });

    return ok(favorites.map((f) => ({ ...serializePlace(f.place), isFavorite: true })));
  } catch (error) {
    return fail(error);
  }
}
