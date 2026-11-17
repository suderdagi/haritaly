import { NextResponse } from 'next/server';
import { db } from '@/src/lib/db';

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', database: 'up', timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: 'degraded', database: 'down' }, { status: 503 });
  }
}
