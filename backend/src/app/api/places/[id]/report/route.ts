import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { ValidationError } from '@/src/lib/errors';
import { ReportPlaceSchema } from '@/src/lib/validators';
import { getVisiblePlace } from '@/src/lib/places';
import { fail, ok, parseId, requireAuth } from '@/src/lib/http';

// POST /api/places/:id/report { reason, details? } — report a friend's place as objectionable
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = requireAuth(req);
    const placeId = parseId((await params).id, 'place ID');

    // You can only report what you are allowed to see
    const place = await getVisiblePlace(userId, placeId);
    if (place.userId === userId) {
      throw new ValidationError('You cannot report your own place');
    }

    const { reason, details } = ReportPlaceSchema.parse(await req.json());
    const report = await db.report.create({
      data: { reporterId: userId, placeId, reason, details: details || null },
    });

    return ok({ id: report.id }, 201);
  } catch (error) {
    return fail(error);
  }
}
