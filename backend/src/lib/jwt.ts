import jwt from 'jsonwebtoken';

export interface JWTPayload {
  id: number;
  email: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign({ id: payload.id, email: payload.email }, getSecret(), {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret());
    if (typeof decoded === 'string' || typeof decoded.id !== 'number') {
      return null;
    }
    return { id: decoded.id, email: decoded.email };
  } catch {
    return null;
  }
}
