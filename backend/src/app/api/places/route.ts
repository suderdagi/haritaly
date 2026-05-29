import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { verifyToken } from '@/src/lib/jwt';
import { CreatePlaceSchema } from '@/src/lib/validators';
import { ValidationError, handleError } from '@/src/lib/errors';
import { serializePlace } from '@/src/lib/serializers';

// Get user's saved places
export async function GET(req: NextRequest) {
  try {
    console.log('[GET /api/places] Request received');
    

    // Always show all places for now, regardless of auth
    console.log('[GET /api/places] Fetching all places (show all, ignore userId)');
    const places = await db.place.findMany({
      include: { photos: true },
    });

    // Explicitly ensure all places have numeric latitude/longitude
    const safePlaces = places.map((p) => serializePlace(p));
    console.log('[GET /api/places] Returning places:', safePlaces.length, safePlaces.map(pl => ({id: pl.id, lat: typeof pl.latitude, lng: typeof pl.longitude})));
    return NextResponse.json({ success: true, data: safePlaces });
  } catch (error) {
    console.error('[GET /api/places] Error:', error);
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ success: false, data: [], error: message }, { status: statusCode });
  }
}

// Create a new place
export async function POST(req: NextRequest) {
  try {
    console.log('[POST /api/places] Request received');
    
    const body = await req.json();
    console.log('[POST /api/places] Request body:', body);

    // Validate input
    const validationResult = CreatePlaceSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('[POST /api/places] Validation error:', validationResult.error.errors);
      throw new ValidationError(validationResult.error.errors[0].message);
    }

    // Get user ID from auth or use demo user for development
    let userId: number | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.id;
        console.log('[POST /api/places] Using authenticated user:', userId);
      }
    }

    if (!userId) {
      // TODO: Remove demo user fallback once auth is implemented
      console.log('[POST /api/places] No auth, finding or creating demo user...');
      
      let demoUser = await db.user.findUnique({
        where: { email: 'demo@haritaly.app' },
      });

      if (!demoUser) {
        console.log('[POST /api/places] Creating demo user');
        demoUser = await db.user.create({
          data: {
            email: 'demo@haritaly.app',
            password: 'demo',
            firstName: 'Demo',
            lastName: 'User',
          },
        });
      }

      userId = demoUser.id;
      console.log('[POST /api/places] Using demo user:', userId);
    }

    console.log('[POST /api/places] Creating place with userId:', userId);
    const place = await db.place.create({
      data: {
        name: validationResult.data.name,
        description: validationResult.data.description || undefined,
        category: validationResult.data.category || undefined,
        latitude: validationResult.data.latitude,
        longitude: validationResult.data.longitude,
        address: validationResult.data.address || undefined,
        rating: validationResult.data.rating || 0,
        notes: validationResult.data.notes || undefined,
        favoriteFood: validationResult.data.favoriteFood || undefined,
        favoriteDrink: validationResult.data.favoriteDrink || undefined,
        userId,
      },
      include: { photos: true, user: true },
    });
    console.log('[POST /api/places] Place created:', place.id);
    return NextResponse.json({ success: true, data: serializePlace(place) }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/places] Error:', error);
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ success: false, data: null, error: message }, { status: statusCode });
  }
}
