import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { CreatePlaceSchema, PLACE_CATEGORIES } from '@/src/lib/validators';
import { serializePlace } from '@/src/lib/serializers';
import { placeInclude } from '@/src/lib/places';
import { fail, ok, requireAuth } from '@/src/lib/http';

// GET /api/places?category=Cafe — places saved by the current user
export async function GET(req: NextRequest) {
  try {
    const { id: userId } = requireAuth(req);
    const category = req.nextUrl.searchParams.get('category');

    const places = await db.place.findMany({
      where: {
        userId,
        ...(category && (PLACE_CATEGORIES as readonly string[]).includes(category)
          ? { category }
          : {}),
      },
      include: placeInclude,
      orderBy: { createdAt: 'desc' },
    });

    return ok(places.map(serializePlace));
  } catch (error) {
    return fail(error);
  }
}

// POST /api/places — save a new place
export async function POST(req: NextRequest) {
  try {
    const { id: userId } = requireAuth(req);
    const data = CreatePlaceSchema.parse(await req.json());

    const place = await db.place.create({
      data: { ...data, userId },
      include: placeInclude,
    });

    return ok(serializePlace(place), 201);
  } catch (error) {
    return fail(error);
  }
}
