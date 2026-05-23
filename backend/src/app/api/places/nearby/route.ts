import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { verifyToken } from '@/src/lib/jwt';
import { ValidationError, handleError } from '@/src/lib/errors';
import { serializePlace } from '@/src/lib/serializers';

// Get nearby places from friends
export async function GET(req: NextRequest) {
  try {
    console.log('[GET /api/places/nearby] Request received');
    
    let payload = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      payload = verifyToken(token);
      console.log('[GET /api/places/nearby] Auth token verified for user:', payload?.id);
    } else {
      console.log('[GET /api/places/nearby] No auth token, returning all places');
    }

    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radius = parseFloat(searchParams.get('radius') || '1000'); // meters

    console.log('[GET /api/places/nearby] Query params:', { lat, lng, radius });

    if (isNaN(lat) || isNaN(lng)) {
      throw new ValidationError('Latitude and longitude are required');
    }

    let places: Array<{ latitude: unknown; longitude: unknown }>;
    if (payload) {
      console.log('[GET /api/places/nearby] Fetching accepted friendships...');
      // Get accepted friends
      const friendships = (await db.friendship.findMany({
        where: {
          OR: [
            { senderId: payload.id, status: 'ACCEPTED' },
            { receiverId: payload.id, status: 'ACCEPTED' },
          ],
        },
        include: {
          sender: { select: { id: true } },
          receiver: { select: { id: true } },
        },
      })) as Array<{ senderId: number; receiverId: number }>;

      const friendIds = friendships.map((f) =>
        f.senderId === payload.id ? f.receiverId : f.senderId
      );

      console.log('[GET /api/places/nearby] Found friends:', friendIds);

      // Get all places from friends
      places = await db.place.findMany({
        where: {
          userId: { in: friendIds },
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
      });
    } else {
      // TODO: Re-enable auth for GET /api/places/nearby once login flow is implemented.
      console.log('[GET /api/places/nearby] Fetching all places (no auth)');
      places = await db.place.findMany({
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
      });
    }

    console.log('[GET /api/places/nearby] Found total places:', places.length);

    // Filter by distance (simple calculation, for production use Haversine formula)
    const radiusKm = radius / 1000;
    const filtered = places.filter((place: any) => {
      const latDiff = Math.abs(parseFloat(place.latitude.toString()) - lat);
      const lngDiff = Math.abs(parseFloat(place.longitude.toString()) - lng);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // rough km conversion
      return distance <= radiusKm;
    });

    console.log('[GET /api/places/nearby] Filtered places by distance:', filtered.length);

    return NextResponse.json({ success: true, data: filtered.map(serializePlace) });
  } catch (error) {
    console.error('[GET /api/places/nearby] Error:', error);
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ success: false, data: [], error: message }, { status: statusCode });
  }
}
