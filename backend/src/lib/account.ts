import { prisma } from './db';
import { comparePasswords } from './auth';
import { AuthorizationError, NotFoundError } from './errors';
import { deletePhotoFiles } from './storage';

/**
 * Permanently deletes a user and everything they created (App Store guideline 5.1.1(v)
 * requires in-app account deletion).
 *
 * The password is asked again so a phone left unlocked can't be used to delete the account.
 * A wrong password returns 403, not 401: the app logs the user out on 401.
 */
export async function deleteAccount(userId: number, password: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  if (!(await comparePasswords(password, user.password))) {
    throw new AuthorizationError('Incorrect password');
  }

  const photos = await prisma.photo.findMany({ where: { place: { userId } }, select: { url: true } });

  await prisma.$transaction([
    // Places, photos, friendships, favorites, blocks and reports are removed by ON DELETE CASCADE
    prisma.user.delete({ where: { id: userId } }),
    // Cached AI summaries are keyed by a hash of their input, so there is no way to tell which ones
    // were built from this user's notes. The cache is cheap to rebuild, so it is cleared entirely.
    prisma.aiSummary.deleteMany(),
  ]);

  await deletePhotoFiles(photos.map((p) => p.url));
}
