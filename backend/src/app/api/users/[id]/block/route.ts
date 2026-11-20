import { NextRequest } from 'next/server';
import { blockUser, unblockUser } from '@/src/lib/blocks';
import { fail, ok, parseId, requireAuth } from '@/src/lib/http';

type Params = { params: Promise<{ id: string }> };

// POST /api/users/:id/block — block a user (also ends the friendship)
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: userId } = requireAuth(req);
    const blockedId = parseId((await params).id, 'user ID');

    await blockUser(userId, blockedId);
    return ok({ userId: blockedId, blocked: true });
  } catch (error) {
    return fail(error);
  }
}

// DELETE /api/users/:id/block — unblock (the friendship is not restored)
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id: userId } = requireAuth(req);
    const blockedId = parseId((await params).id, 'user ID');

    await unblockUser(userId, blockedId);
    return ok({ userId: blockedId, blocked: false });
  } catch (error) {
    return fail(error);
  }
}
