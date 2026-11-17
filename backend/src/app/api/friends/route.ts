import { NextRequest } from 'next/server';
import { FriendRequestSchema } from '@/src/lib/validators';
import { listFriends, removeFriend, sendFriendRequest } from '@/src/lib/friends';
import { fail, ok, parseId, requireAuth } from '@/src/lib/http';

// GET /api/friends — accepted friends of the current user
export async function GET(req: NextRequest) {
  try {
    const { id: userId } = requireAuth(req);
    return ok(await listFriends(userId));
  } catch (error) {
    return fail(error);
  }
}

// POST /api/friends { receiverId } — send a friend request
export async function POST(req: NextRequest) {
  try {
    const { id: userId } = requireAuth(req);
    const { receiverId } = FriendRequestSchema.parse(await req.json());

    const friendship = await sendFriendRequest(userId, receiverId);
    return ok(friendship, 201);
  } catch (error) {
    return fail(error);
  }
}

// DELETE /api/friends?friendId=12 — remove a friend
export async function DELETE(req: NextRequest) {
  try {
    const { id: userId } = requireAuth(req);
    const friendId = parseId(req.nextUrl.searchParams.get('friendId') ?? '', 'friend ID');

    await removeFriend(userId, friendId);
    return ok({ friendId });
  } catch (error) {
    return fail(error);
  }
}
