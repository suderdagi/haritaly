import { prisma } from './db';
import { publicUserSelect } from './selects';
import { areFriends } from './friends';
import { AuthorizationError, NotFoundError } from './errors';

/** Prisma filter for places a viewer may see: their own, and their friends' shared (not private) ones. */
export function visibleToViewer(viewerId: number, friendIds: number[]) {
  return {
    OR: [{ userId: viewerId }, { userId: { in: friendIds }, isPrivate: false }],
  };
}

export const placeInclude = {
  photos: true,
  user: { select: publicUserSelect },
} as const;

/** A place is visible to its owner and to the owner's friends. */
export async function getVisiblePlace(viewerId: number, placeId: number) {
  const place = await prisma.place.findUnique({ where: { id: placeId }, include: placeInclude });

  if (!place) {
    throw new NotFoundError('Place not found');
  }

  if (place.userId !== viewerId) {
    // A private place looks the same as a missing one to everybody but its owner
    if (place.isPrivate) {
      throw new NotFoundError('Place not found');
    }
    if (!(await areFriends(viewerId, place.userId))) {
      throw new AuthorizationError('You can only view places saved by you or your friends');
    }
  }

  return place;
}

export async function getOwnedPlace(ownerId: number, placeId: number) {
  const place = await prisma.place.findUnique({ where: { id: placeId } });

  if (!place) {
    throw new NotFoundError('Place not found');
  }
  if (place.userId !== ownerId) {
    throw new AuthorizationError('You can only change your own places');
  }

  return place;
}
