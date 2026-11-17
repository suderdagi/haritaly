import { FriendshipStatus } from '@prisma/client';
import { prisma } from './db';
import { publicUserSelect } from './selects';
import { ConflictError, NotFoundError, AuthorizationError, ValidationError } from './errors';

const betweenUsers = (a: number, b: number) => ({
  OR: [
    { senderId: a, receiverId: b },
    { senderId: b, receiverId: a },
  ],
});

export async function getFriendIds(userId: number): Promise<number[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    select: { senderId: true, receiverId: true },
  });

  return friendships.map((f) => (f.senderId === userId ? f.receiverId : f.senderId));
}

export async function areFriends(a: number, b: number): Promise<boolean> {
  const friendship = await prisma.friendship.findFirst({
    where: { status: FriendshipStatus.ACCEPTED, ...betweenUsers(a, b) },
    select: { id: true },
  });
  return friendship !== null;
}

export async function listFriends(userId: number) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: publicUserSelect },
      receiver: { select: publicUserSelect },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return friendships.map((f) => ({
    friendshipId: f.id,
    since: f.updatedAt,
    ...(f.senderId === userId ? f.receiver : f.sender),
  }));
}

export async function listIncomingRequests(userId: number) {
  return prisma.friendship.findMany({
    where: { receiverId: userId, status: FriendshipStatus.PENDING },
    include: { sender: { select: publicUserSelect } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function sendFriendRequest(senderId: number, receiverId: number) {
  if (senderId === receiverId) {
    throw new ValidationError('You cannot add yourself as a friend');
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } });
  if (!receiver) {
    throw new NotFoundError('User not found');
  }

  const existing = await prisma.friendship.findFirst({ where: betweenUsers(senderId, receiverId) });

  if (existing?.status === FriendshipStatus.ACCEPTED) {
    throw new ConflictError('You are already friends');
  }

  if (existing?.status === FriendshipStatus.PENDING) {
    // The other user already sent us a request: accepting it is the natural outcome
    if (existing.receiverId === senderId) {
      return prisma.friendship.update({
        where: { id: existing.id },
        data: { status: FriendshipStatus.ACCEPTED },
      });
    }
    throw new ConflictError('Friend request already sent');
  }

  if (existing) {
    // A previously rejected request can be sent again
    return prisma.friendship.update({
      where: { id: existing.id },
      data: { senderId, receiverId, status: FriendshipStatus.PENDING },
    });
  }

  return prisma.friendship.create({
    data: { senderId, receiverId, status: FriendshipStatus.PENDING },
  });
}

export async function respondToRequest(
  userId: number,
  friendshipId: number,
  status: 'ACCEPTED' | 'REJECTED'
) {
  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });

  if (!friendship) {
    throw new NotFoundError('Friend request not found');
  }
  if (friendship.receiverId !== userId) {
    throw new AuthorizationError('Only the receiver can respond to this request');
  }
  if (friendship.status !== FriendshipStatus.PENDING) {
    throw new ConflictError('This request has already been answered');
  }

  return prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: FriendshipStatus[status] },
  });
}

export async function removeFriend(userId: number, friendId: number) {
  const result = await prisma.friendship.deleteMany({
    where: { status: FriendshipStatus.ACCEPTED, ...betweenUsers(userId, friendId) },
  });

  if (result.count === 0) {
    throw new NotFoundError('Friendship not found');
  }
}

/** Relationship of `viewerId` to each user in `userIds`, used by user search. */
export async function relationStatuses(viewerId: number, userIds: number[]) {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { senderId: viewerId, receiverId: { in: userIds } },
        { receiverId: viewerId, senderId: { in: userIds } },
      ],
    },
  });

  const map = new Map<number, 'FRIEND' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'NONE'>();
  for (const f of friendships) {
    const otherId = f.senderId === viewerId ? f.receiverId : f.senderId;
    if (f.status === FriendshipStatus.ACCEPTED) map.set(otherId, 'FRIEND');
    else if (f.status === FriendshipStatus.PENDING)
      map.set(otherId, f.senderId === viewerId ? 'REQUEST_SENT' : 'REQUEST_RECEIVED');
  }
  return (id: number) => map.get(id) ?? 'NONE';
}
