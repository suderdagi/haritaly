import { ok } from '@/src/lib/http';

// Read the environment on every request, not once at build time
export const dynamic = 'force-dynamic';

// GET /api/config — which optional features this server has turned on, so the app can hide the rest
export async function GET() {
  return ok({
    aiSummary: Boolean(process.env.OPENAI_API_KEY),
  });
}
