import { ok } from '@/src/lib/http';

// Tokens are stateless (JWT), so logging out only means the client deletes its token.
export async function POST() {
  return ok({ message: 'Logged out' });
}
