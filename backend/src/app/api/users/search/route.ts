import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { ValidationError } from '@/src/lib/errors';
import { publicUserSelect } from '@/src/lib/selects';
import { relationStatuses } from '@/src/lib/friends';
import { fail, ok, requireAuth } from '@/src/lib/http';

// GET /api/users/search?q=ayse — find people to add as friends
export async function GET(req: NextRequest) {
  try {
    const { id: userId } = requireAuth(req);
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

    if (q.length < 2) {
      throw new ValidationError('Search query must be at least 2 characters');
    }

    const users = await db.user.findMany({
      where: {
        id: { not: userId },
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: publicUserSelect,
      take: 20,
    });

    const statusOf = await relationStatuses(userId, users.map((u) => u.id));
    return ok(users.map((user) => ({ ...user, relation: statusOf(user.id) })));
  } catch (error) {
    return fail(error);
  }
}
