import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { NotFoundError } from '@/src/lib/errors';
import { publicUserSelect } from '@/src/lib/selects';
import { isBlockedEitherWay } from '@/src/lib/blocks';
import { fail, ok, parseId, requireAuth } from '@/src/lib/http';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: viewerId } = requireAuth(req);
    const userId = parseId((await params).id, 'user ID');

    // A blocked profile looks the same as a missing one
    if (await isBlockedEitherWay(viewerId, userId)) {
      throw new NotFoundError('User not found');
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        ...publicUserSelect,
        // Others only learn how many places are shared with friends, not how many are private
        _count: { select: { places: viewerId === userId ? true : { where: { isPrivate: false } } } },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return ok(user);
  } catch (error) {
    return fail(error);
  }
}
