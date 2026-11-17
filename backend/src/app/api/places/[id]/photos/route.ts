import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { ValidationError } from '@/src/lib/errors';
import { getOwnedPlace, getVisiblePlace } from '@/src/lib/places';
import { savePhoto, validatePhoto } from '@/src/lib/storage';
import { fail, ok, parseId, requireAuth } from '@/src/lib/http';

type Params = { params: Promise<{ id: string }> };

const MAX_PHOTOS_PER_REQUEST = 5;

// POST /api/places/:id/photos — multipart/form-data with one or more `photos` fields
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: userId } = requireAuth(req);
    const placeId = parseId((await params).id, 'place ID');
    await getOwnedPlace(userId, placeId);

    const files = (await req.formData()).getAll('photos').filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      throw new ValidationError('No photos provided');
    }
    if (files.length > MAX_PHOTOS_PER_REQUEST) {
      throw new ValidationError(`You can upload up to ${MAX_PHOTOS_PER_REQUEST} photos at once`);
    }

    // Validate everything first so a bad file doesn't leave a half-finished upload
    files.forEach(validatePhoto);

    const photos = [];
    for (const file of files) {
      const url = await savePhoto(file);
      photos.push(await db.photo.create({ data: { placeId, url } }));
    }

    return ok(photos, 201);
  } catch (error) {
    return fail(error);
  }
}

// GET /api/places/:id/photos
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: userId } = requireAuth(req);
    const placeId = parseId((await params).id, 'place ID');
    await getVisiblePlace(userId, placeId);

    const photos = await db.photo.findMany({ where: { placeId }, orderBy: { uploadedAt: 'asc' } });
    return ok(photos);
  } catch (error) {
    return fail(error);
  }
}
