import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { NotFoundError, handleError } from '@/src/lib/errors';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      throw new NotFoundError('Invalid user ID');
    }

    const user = await db.user.findUnique({
      where: { id: userId },
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
