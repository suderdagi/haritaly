import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import { comparePasswords } from '@/src/lib/auth';
import { generateToken } from '@/src/lib/jwt';
import { LoginSchema } from '@/src/lib/validators';
import { AuthenticationError } from '@/src/lib/errors';
import { fail, ok } from '@/src/lib/http';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = LoginSchema.parse(await req.json());

    const user = await db.user.findUnique({ where: { email } });

    // Same message for unknown email and wrong password, so emails can't be enumerated
    if (!user || !(await comparePasswords(password, user.password))) {
      throw new AuthenticationError('Invalid email or password');
    }

    const { password: _password, ...publicUser } = user;
    const token = generateToken({ id: user.id, email: user.email });

    return ok({ user: publicUser, token });
  } catch (error) {
    return fail(error);
  }
}
