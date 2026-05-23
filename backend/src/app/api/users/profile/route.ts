import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { verifyToken } from '@/src/lib/jwt';
import { UpdateProfileSchema } from '@/src/lib/validators';
import { AuthenticationError, ValidationError, NotFoundError, handleError } from '@/src/lib/errors';

// Get user profile
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError();
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (!payload) {
      throw new AuthenticationError();
    }

    const user = await db.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

// Update user profile
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError();
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (!payload) {
      throw new AuthenticationError();
    }

    const body = await req.json();

    // Validate input
    const validationResult = UpdateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.errors[0].message);
    }

    const user = await db.user.update({
      where: { id: payload.id },
      data: validationResult.data,
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
