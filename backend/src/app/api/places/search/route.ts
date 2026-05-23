import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { ValidationError, handleError } from '@/src/lib/errors';
import { serializePlace } from '@/src/lib/serializers';

// Search places by name
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      throw new ValidationError('Search query must be at least 2 characters');
    }

    const places = await db.place.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        photos: true,
      },
      take: 20,
    });

    return NextResponse.json({ success: true, data: places.map(serializePlace) });
  } catch (error) {
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
