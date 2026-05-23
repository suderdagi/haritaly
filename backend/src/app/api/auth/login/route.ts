import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { comparePasswords } from '@/src/lib/auth';
import { generateToken } from '@/src/lib/jwt';
import { LoginSchema } from '@/src/lib/validators';
import { AuthenticationError, ValidationError, handleError } from '@/src/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.errors[0].message);
    }

    const { email, password } = validationResult.data;

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Compare passwords
    const passwordMatch = await comparePasswords(password, user.password);

    if (!passwordMatch) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
