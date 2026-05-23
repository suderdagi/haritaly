import { NextResponse } from 'next/server';

export async function POST() {
  // This is a simple logout that just returns success
  // The actual token is managed on the client side
  return NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );
}
