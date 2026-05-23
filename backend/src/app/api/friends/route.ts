import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { verifyToken } from '@/src/lib/jwt';
import { AuthenticationError, ValidationError, NotFoundError, handleError } from '@/src/lib/errors';

// Get friend list (accepted friendships)
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

    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { senderId: payload.id, status: 'ACCEPTED' },
          { receiverId: payload.id, status: 'ACCEPTED' },
        ],
      },
      include: {
        sender: { select: { id: true, email: true, firstName: true, lastName: true, profilePicture: true } },
        receiver: { select: { id: true, email: true, firstName: true, lastName: true, profilePicture: true } },
      },
    });

    const friends = friendships.map((friendship) => {
      const friend = friendship.senderId === payload.id ? friendship.receiver : friendship.sender;
      return friend;
    });

    return NextResponse.json(friends);
  } catch (error) {
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

// Send friend request
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { receiverId } = body;

    if (!receiverId) {
      throw new ValidationError('Receiver ID is required');
    }

    if (receiverId === payload.id) {
      throw new ValidationError('Cannot send friend request to yourself');
    }

    // Check if receiver exists
    const receiver = await db.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundError('User not found');
    }

    // Check if friendship already exists
    const existingFriendship = await db.friendship.findUnique({
      where: {
        senderId_receiverId: {
          senderId: Math.min(payload.id, receiverId),
          receiverId: Math.max(payload.id, receiverId),
        },
      },
    });

    if (existingFriendship) {
      throw new ValidationError('Friendship request already exists');
    }

    const friendship = await db.friendship.create({
      data: {
        senderId: payload.id,
        receiverId: receiverId,
        status: 'PENDING',
      },
    });

    return NextResponse.json(friendship, { status: 201 });
  } catch (error) {
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

// Delete friend
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const friendId = searchParams.get('friendId');

    if (!friendId) {
      throw new ValidationError('Friend ID is required');
    }

    // Delete any friendship between these two users
    await db.friendship.deleteMany({
      where: {
        OR: [
          { senderId: payload.id, receiverId: parseInt(friendId) },
          { senderId: parseInt(friendId), receiverId: payload.id },
        ],
      },
    });

    return NextResponse.json({ message: 'Friend removed' });
  } catch (error) {
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
