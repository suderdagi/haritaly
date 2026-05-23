import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { verifyToken } from '@/src/lib/jwt';
import { UpdatePlaceSchema } from '@/src/lib/validators';
import { AuthenticationError, NotFoundError, ValidationError, handleError } from '@/src/lib/errors';
import { serializePlace } from '@/src/lib/serializers';

// Get place details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const placeId = parseInt(id, 10);

    if (isNaN(placeId)) {
      throw new NotFoundError('Invalid place ID');
    }

    const place = await db.place.findUnique({
      where: { id: placeId },
      include: { photos: true },
    });

    if (!place) {
      throw new NotFoundError('Place not found');
    }

    return NextResponse.json({ success: true, data: serializePlace(place) });
  } catch (error) {
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

// Update place
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError();
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (!payload) {
      throw new AuthenticationError();
    }

    const { id } = await params;
    const placeId = parseInt(id, 10);

    if (isNaN(placeId)) {
      throw new NotFoundError('Invalid place ID');
    }

    const place = await db.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundError('Place not found');
    }

    if (place.userId !== payload.id) {
      throw new AuthenticationError('Cannot update this place');
    }

    const body = await req.json();

    // Validate input
    const validationResult = UpdatePlaceSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.errors[0].message);
    }

    const updated = await db.place.update({
      where: { id: placeId },
      data: validationResult.data,
      include: { photos: true },
    });

    return NextResponse.json({ success: true, data: serializePlace(updated) });
  } catch (error) {
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

// Delete place
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError();
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (!payload) {
      throw new AuthenticationError();
    }

    const { id } = await params;
    const placeId = parseInt(id, 10);

    if (isNaN(placeId)) {
      throw new NotFoundError('Invalid place ID');
    }

    const place = await db.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundError('Place not found');
    }

    if (place.userId !== payload.id) {
      throw new AuthenticationError('Cannot delete this place');
    }

    await db.place.delete({
      where: { id: placeId },
    });

    return NextResponse.json({ success: true, message: 'Place deleted' });
  } catch (error) {
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
