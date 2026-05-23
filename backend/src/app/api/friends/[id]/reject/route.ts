import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { verifyToken } from '@/src/lib/jwt';
import { AuthenticationError, NotFoundError, handleError } from '@/src/lib/errors';

// Reject friend request
export async function POST(
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
    const friendRequestId = parseInt(id, 10);

    if (isNaN(friendRequestId)) {
      throw new NotFoundError('Invalid request ID');
    }

    const friendship = await db.friendship.findUnique({
      where: { id: friendRequestId },
    });

    if (!friendship) {
      throw new NotFoundError('Friend request not found');
    }

    if (friendship.receiverId !== payload.id) {
      throw new AuthenticationError('Cannot reject this request');
    }

    const updated = await db.friendship.update({
      where: { id: friendRequestId },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
