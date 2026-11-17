import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { NotFoundError } from '@/src/lib/errors';
import { publicUserSelect } from '@/src/lib/selects';
import { fail, ok, parseId, requireAuth } from '@/src/lib/http';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAuth(req);
    const userId = parseId((await params).id, 'user ID');

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { ...publicUserSelect, _count: { select: { places: true } } },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return ok(user);
  } catch (error) {
    return fail(error);
  }
}
