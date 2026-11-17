import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(403, message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
    this.name = 'ConflictError';
  }
}

export function handleError(error: unknown): { statusCode: number; message: string } {
  if (error instanceof AppError) {
    return { statusCode: error.statusCode, message: error.message };
  }

  if (error instanceof ZodError) {
    return { statusCode: 400, message: error.errors[0]?.message ?? 'Invalid input' };
  }

  if (error instanceof SyntaxError) {
    return { statusCode: 400, message: 'Invalid JSON body' };
  }

  // Never leak internal error details (DB errors, stack traces) to the client
  console.error(error);
  return { statusCode: 500, message: 'Internal server error' };
}
