import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';
import { AuthenticationError, ValidationError, handleError } from './errors';

/**
 * Reads the Bearer token from the request and returns the user payload.
 * Throws AuthenticationError when the token is missing or invalid.
 */
export function requireAuth(req: NextRequest): JWTPayload {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new AuthenticationError();
  }

  const payload = verifyToken(header.slice(7));
  if (!payload) {
    throw new AuthenticationError('Invalid or expired token');
  }

  return payload;
}

export function parseId(value: string, label = 'ID'): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(`Invalid ${label}`);
  }
  return id;
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(error: unknown) {
  const { statusCode, message } = handleError(error);
  return NextResponse.json({ success: false, error: message }, { status: statusCode });
}
