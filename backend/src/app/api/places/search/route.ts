import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { ValidationError } from '@/src/lib/errors';
import { serializePlace } from '@/src/lib/serializers';
import { getFriendIds } from '@/src/lib/friends';
import { placeInclude } from '@/src/lib/places';
import { fail, ok, requireAuth } from '@/src/lib/http';

// GET /api/places/search?q=kahve — searches the user's and their friends' places
export async function GET(req: NextRequest) {
  try {
    const { id: userId } = requireAuth(req);
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

    if (q.length < 2) {
      throw new ValidationError('Search query must be at least 2 characters');
    }

    const friendIds = await getFriendIds(userId);
    const places = await db.place.findMany({
      where: {
        userId: { in: [userId, ...friendIds] },
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
          { favoriteFood: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: placeInclude,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return ok(places.map(serializePlace));
  } catch (error) {
    return fail(error);
  }
}
