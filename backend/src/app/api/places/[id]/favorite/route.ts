import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { getVisiblePlace } from '@/src/lib/places';
import { fail, ok, parseId, requireAuth } from '@/src/lib/http';

type Params = { params: Promise<{ id: string }> };

// POST /api/places/:id/favorite — add a place (own or a friend's) to favorites
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: userId } = requireAuth(req);
    const placeId = parseId((await params).id, 'place ID');
    await getVisiblePlace(userId, placeId);

    // upsert makes the request idempotent: favoriting twice is not an error
    await db.favorite.upsert({
      where: { userId_placeId: { userId, placeId } },
      create: { userId, placeId },
      update: {},
    });

    return ok({ placeId, isFavorite: true });
  } catch (error) {
    return fail(error);
  }
}

// DELETE /api/places/:id/favorite
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id: userId } = requireAuth(req);
    const placeId = parseId((await params).id, 'place ID');

    await db.favorite.deleteMany({ where: { userId, placeId } });
    return ok({ placeId, isFavorite: false });
  } catch (error) {
    return fail(error);
  }
}
