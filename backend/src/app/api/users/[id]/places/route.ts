import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { AuthorizationError, NotFoundError } from '@/src/lib/errors';
import { serializePlace } from '@/src/lib/serializers';
import { areFriends } from '@/src/lib/friends';
import { isBlockedEitherWay } from '@/src/lib/blocks';
import { placeInclude } from '@/src/lib/places';
import { fail, ok, parseId, requireAuth } from '@/src/lib/http';

// GET /api/users/:id/places — a friend's shared places (or all of your own), newest first
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: viewerId } = requireAuth(req);
    const userId = parseId((await params).id, 'user ID');
    const isSelf = userId === viewerId;

    if (!isSelf) {
      // A blocked profile looks the same as a missing one
      if (await isBlockedEitherWay(viewerId, userId)) {
        throw new NotFoundError('User not found');
      }
      if (!(await areFriends(viewerId, userId))) {
        throw new AuthorizationError('You can only see the places of your friends');
      }
    }

    const places = await db.place.findMany({
      where: { userId, ...(isSelf ? {} : { isPrivate: false }) },
      include: placeInclude,
      orderBy: { createdAt: 'desc' },
    });

    return ok(places.map(serializePlace));
  } catch (error) {
    return fail(error);
  }
}
