import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { verifyToken } from '@/src/lib/jwt';
import { AuthenticationError, ValidationError, NotFoundError, handleError } from '@/src/lib/errors';

// Upload photos for a place
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const placeId = parseInt(id);
    if (isNaN(placeId)) {
      throw new ValidationError('Invalid place ID');
    }

    // Verify the place belongs to the user
    const place = await db.place.findFirst({
      where: {
        id: placeId,
        userId: payload.id,
      },
    });

    if (!place) {
      throw new NotFoundError('Place not found');
    }

    const formData = await req.formData();
    const files = formData.getAll('photos') as File[];

    if (!files || files.length === 0) {
      throw new ValidationError('No photos provided');
    }

    // In a real implementation, you would upload these files to a cloud storage service
    // like AWS S3, Cloudinary, or similar. For now, we'll simulate URLs.
    const uploadedPhotos = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new ValidationError('Only image files are allowed');
      }

      // Validate file size (max 5MB per file)
      if (file.size > 5 * 1024 * 1024) {
        throw new ValidationError('File size must be less than 5MB');
      }

      // Simulate file upload - in production, upload to cloud storage
      const fileName = `${Date.now()}-${file.name}`;
      const url = `https://storage.example.com/places/${fileName}`; // Replace with actual upload logic

      const photo = await db.photo.create({
        data: {
          placeId,
          url,
        },
      });

      uploadedPhotos.push(photo);
    }

    return NextResponse.json({
      success: true,
      data: uploadedPhotos,
      message: `Successfully uploaded ${uploadedPhotos.length} photo(s)`,
    });
  } catch (error) {
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

// Get photos for a place
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const placeId = parseInt(id);
    if (isNaN(placeId)) {
      throw new ValidationError('Invalid place ID');
    }

    const photos = await db.photo.findMany({
      where: { placeId },
    });

    return NextResponse.json({ success: true, data: photos || [] });
  } catch (error) {
    console.error('[GET /api/places/[id]/photos] Error:', error);
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ success: false, data: [], error: message }, { status: statusCode });
  }
}
