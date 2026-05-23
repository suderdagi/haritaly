import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { hashPassword } from '@/src/lib/auth';
import { generateToken } from '@/src/lib/jwt';
import { RegisterSchema } from '@/src/lib/validators';
import { ValidationError, handleError } from '@/src/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validationResult = RegisterSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.errors[0].message);
    }

    const { email, password, firstName, lastName } = validationResult.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
      },
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        user: userWithoutPassword,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    const { statusCode, message } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
