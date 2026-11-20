import { prisma } from './db';
import { publicUserSelect } from './selects';
import { NotFoundError, ValidationError } from './errors';

/**
 * Blocking is one of the safety tools the App Store requires for apps with user content.
 * When A blocks B: their friendship and any pending request are removed, neither can send
 * the other a request, and they no longer appear in each other's search results.
 */

/** IDs of users the given user blocked or was blocked by. */
export async function getBlockedUserIds(userId: number): Promise<number[]> {
  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  return blocks.map((b) => (b.blockerId === userId ? b.blockedId : b.blockerId));
}

export async function isBlockedEitherWay(a: number, b: number): Promise<boolean> {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: a, blockedId: b },
        { blockerId: b, blockedId: a },
      ],
    },
    select: { blockerId: true },
  });
  return block !== null;
}

export async function blockUser(blockerId: number, blockedId: number) {
  if (blockerId === blockedId) {
    throw new ValidationError('You cannot block yourself');
  }

  const target = await prisma.user.findUnique({ where: { id: blockedId }, select: { id: true } });
  if (!target) {
    throw new NotFoundError('User not found');
  }

  // Both writes succeed or neither does, so a block never leaves the friendship in place
  await prisma.$transaction([
    prisma.friendship.deleteMany({
      where: {
        OR: [
          { senderId: blockerId, receiverId: blockedId },
          { senderId: blockedId, receiverId: blockerId },
        ],
      },
    }),
    prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      create: { blockerId, blockedId },
      update: {},
    }),
  ]);
}

export async function unblockUser(blockerId: number, blockedId: number) {
  await prisma.block.deleteMany({ where: { blockerId, blockedId } });
}

export async function listBlockedUsers(userId: number) {
  const blocks = await prisma.block.findMany({
    where: { blockerId: userId },
    include: { blocked: { select: publicUserSelect } },
    orderBy: { createdAt: 'desc' },
  });
  return blocks.map((b) => ({ ...b.blocked, blockedAt: b.createdAt }));
}
