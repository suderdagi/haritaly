import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { UpdatePlaceSchema } from '@/src/lib/validators';
import { serializePlace } from '@/src/lib/serializers';
import { getOwnedPlace, getVisiblePlace, placeInclude } from '@/src/lib/places';
import { fail, ok, parseId, requireAuth } from '@/src/lib/http';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: userId } = requireAuth(req);
    const placeId = parseId((await params).id, 'place ID');

    const place = await getVisiblePlace(userId, placeId);
    const favorite = await db.favorite.findUnique({
      where: { userId_placeId: { userId, placeId } },
    });

    return ok({ ...serializePlace(place), isFavorite: favorite !== null });
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id: userId } = requireAuth(req);
    const placeId = parseId((await params).id, 'place ID');
    await getOwnedPlace(userId, placeId);

    const data = UpdatePlaceSchema.parse(await req.json());
    const updated = await db.place.update({
      where: { id: placeId },
      data,
      include: placeInclude,
    });

    return ok(serializePlace(updated));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id: userId } = requireAuth(req);
    const placeId = parseId((await params).id, 'place ID');
    await getOwnedPlace(userId, placeId);

    await db.place.delete({ where: { id: placeId } });
    return ok({ id: placeId });
  } catch (error) {
    return fail(error);
  }
}
