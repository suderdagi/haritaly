import { NextRequest } from 'next/server';
import { respondToRequest } from '@/src/lib/friends';
import { fail, ok, parseId, requireAuth } from '@/src/lib/http';

// POST /api/friends/:id/reject — :id is the friend request (friendship) ID
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = requireAuth(req);
    const requestId = parseId((await params).id, 'request ID');

    return ok(await respondToRequest(userId, requestId, 'REJECTED'));
  } catch (error) {
    return fail(error);
  }
}
