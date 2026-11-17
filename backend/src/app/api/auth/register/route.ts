import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { hashPassword } from '@/src/lib/auth';
import { generateToken } from '@/src/lib/jwt';
import { RegisterSchema } from '@/src/lib/validators';
import { ConflictError } from '@/src/lib/errors';
import { publicUserSelect } from '@/src/lib/selects';
import { fail, ok } from '@/src/lib/http';

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName } = RegisterSchema.parse(await req.json());

    const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      throw new ConflictError('This email is already registered');
    }

    const user = await db.user.create({
      data: {
        email,
        password: await hashPassword(password),
        firstName: firstName || null,
        lastName: lastName || null,
      },
      select: publicUserSelect,
    });

    const token = generateToken({ id: user.id, email: user.email });
    return ok({ user, token }, 201);
  } catch (error) {
    return fail(error);
  }
}
