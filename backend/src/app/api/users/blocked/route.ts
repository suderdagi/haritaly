import { NextRequest } from 'next/server';
import { listBlockedUsers } from '@/src/lib/blocks';
import { fail, ok, requireAuth } from '@/src/lib/http';

// GET /api/users/blocked — users the current user has blocked
export async function GET(req: NextRequest) {
  try {
    const { id: userId } = requireAuth(req);
    return ok(await listBlockedUsers(userId));
  } catch (error) {
    return fail(error);
  }
}
