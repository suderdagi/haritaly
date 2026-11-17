import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { NotFoundError } from '@/src/lib/errors';
import { UpdateProfileSchema } from '@/src/lib/validators';
import { publicUserSelect } from '@/src/lib/selects';
import { fail, ok, requireAuth } from '@/src/lib/http';

const profileSelect = {
  ...publicUserSelect,
  createdAt: true,
  _count: { select: { places: true } },
} as const;

export async function GET(req: NextRequest) {
  try {
    const { id: userId } = requireAuth(req);
    const user = await db.user.findUnique({ where: { id: userId }, select: profileSelect });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return ok(user);
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id: userId } = requireAuth(req);
    const data = UpdateProfileSchema.parse(await req.json());

    const user = await db.user.update({ where: { id: userId }, data, select: profileSelect });
    return ok(user);
  } catch (error) {
    return fail(error);
  }
}
