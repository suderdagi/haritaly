import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/src/lib/jwt';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      user?: JWTPayload;
    }
  }
}

export function withAuth(handler: Function) {
  return async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Missing or invalid authorization header' },
          { status: 401 }
        );
      }

      const token = authHeader.slice(7);
      const payload = verifyToken(token);

      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Attach user info to request
      const requestWithUser = Object.assign(req, { userId: payload.id, user: payload });

      return handler(requestWithUser);
    } catch (error) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
