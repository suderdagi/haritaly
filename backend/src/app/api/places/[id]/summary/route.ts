import { NextRequest } from 'next/server';
import { serializePlace } from '@/src/lib/serializers';
import { getVisiblePlace } from '@/src/lib/places';
import { getPlaceSummary } from '@/src/lib/summaries';
import { fail, ok, parseId, requireAuth } from '@/src/lib/http';

// GET /api/places/:id/summary — AI summary of what the user and their friends said about this place
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = requireAuth(req);
    const placeId = parseId((await params).id, 'place ID');

    // Same permission rule as place details: owner or friends only
    const place = serializePlace(await getVisiblePlace(userId, placeId));

    return ok(await getPlaceSummary(userId, place));
  } catch (error) {
    return fail(error);
  }
}
