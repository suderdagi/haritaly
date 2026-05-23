import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { verifyToken } from '@/src/lib/jwt';
import { AuthenticationError, handleError } from '@/src/lib/errors';

// Get pending friend requests (received by user)
export async function GET(req: NextRequest) {
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

    const pendingRequests = await db.friendship.findMany({
      where: {
        receiverId: payload.id,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: pendingRequests,
        count: pendingRequests.length,
      },
      { status: 200 }
    );
  } catch (error) {
    const { statusCode, message } = handleError(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: statusCode }
    );
  }
}
