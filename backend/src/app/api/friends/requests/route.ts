import { NextRequest } from 'next/server';
import { listIncomingRequests } from '@/src/lib/friends';
import { fail, ok, requireAuth } from '@/src/lib/http';

// GET /api/friends/requests — pending requests sent to the current user
export async function GET(req: NextRequest) {
  try {
    const { id: userId } = requireAuth(req);
    return ok(await listIncomingRequests(userId));
  } catch (error) {
    return fail(error);
  }
}
