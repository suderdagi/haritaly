import { prisma } from './db';
import { publicUserSelect } from './selects';
import { areFriends } from './friends';
import { AuthorizationError, NotFoundError } from './errors';

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

  if (place.userId !== viewerId && !(await areFriends(viewerId, place.userId))) {
    throw new AuthorizationError('You can only view places saved by you or your friends');
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
