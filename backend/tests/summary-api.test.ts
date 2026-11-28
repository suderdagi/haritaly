/**
 * Integration tests for GET /api/places/:id/summary against a real PostgreSQL database.
 * The LLM call is mocked: these tests check our logic (permissions, matching, caching, validation),
 * not the model.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import * as register from '@/src/app/api/auth/register/route';
import * as places from '@/src/app/api/places/route';
import * as friends from '@/src/app/api/friends/route';
import * as accept from '@/src/app/api/friends/[id]/accept/route';
import * as summary from '@/src/app/api/places/[id]/summary/route';

vi.mock('@/src/lib/llm', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/src/lib/llm')>()),
  completeJson: vi.fn(),
}));
const { completeJson } = await import('@/src/lib/llm');
const llm = vi.mocked(completeJson);

process.env.JWT_SECRET ??= 'test-secret';

function request(path: string, opts: { method?: string; token?: string; body?: unknown } = {}) {
  return new NextRequest(`http://localhost${path}`, {
    method: opts.method ?? 'GET',
    headers: {
      'content-type': 'application/json',
      ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
}

const params = (id: number) => ({ params: Promise.resolve({ id: String(id) }) });

async function signUp(email: string) {
  const res = await register.POST(
    request('/api/auth/register', { method: 'POST', body: { email, password: 'password123' } })
  );
  const json = await res.json();
  return { token: json.data.token as string, id: json.data.user.id as number };
}

async function savePlace(token: string, body: Record<string, unknown>) {
  const res = await places.POST(request('/api/places', { method: 'POST', token, body }));
  return (await res.json()).data.id as number;
}

async function getSummary(token: string, placeId: number) {
  const res = await summary.GET(request(`/api/places/${placeId}/summary`, { token }), params(placeId));
  return { status: res.status, json: await res.json() };
}

async function reset() {
  await db.aiSummary.deleteMany();
  await db.favorite.deleteMany();
  await db.photo.deleteMany();
  await db.place.deleteMany();
  await db.friendship.deleteMany();
  await db.user.deleteMany();
}

const KRONOTROP = { latitude: 41.0315, longitude: 28.9822 };
const goodAnswer = { summary: 'Kahvesi çok övülüyor.', highlights: ['Filtre kahve'], mustTry: ['Cheesecake'] };

let sude: { token: string; id: number };
let ali: { token: string; id: number };
let stranger: { token: string; id: number };
let sudePlaceId: number;

beforeAll(async () => {
  await reset();
  sude = await signUp('sude@summary.test');
  ali = await signUp('ali@summary.test');
  stranger = await signUp('stranger@summary.test');

  // Sude and Ali are friends
  await friends.POST(request('/api/friends', { method: 'POST', token: sude.token, body: { receiverId: ali.id } }));
  const pending = await db.friendship.findFirstOrThrow({ where: { receiverId: ali.id } });
  await accept.POST(request(`/api/friends/${pending.id}/accept`, { method: 'POST', token: ali.token }), params(pending.id));

  sudePlaceId = await savePlace(sude.token, {
    name: 'Kronotrop', ...KRONOTROP, favoriteFood: 'Cheesecake', notes: 'Harika kahve',
  });
  // Ali saved the same café separately, a few meters away, with a slightly different name
  await savePlace(ali.token, {
    name: 'Kronotrop Cihangir', latitude: KRONOTROP.latitude + 0.0002, longitude: KRONOTROP.longitude,
    favoriteDrink: 'Filtre kahve',
  });
  // Not friends with Sude: must never reach the prompt
  await savePlace(stranger.token, { name: 'Kronotrop', ...KRONOTROP, notes: 'SECRET NOTE' });
  // Friend's entry for a different place nearby: must not be matched
  await savePlace(ali.token, { name: 'Petra Roasting', ...KRONOTROP, notes: 'Other place' });
});

beforeEach(() => {
  llm.mockReset();
});

afterAll(async () => {
  await reset();
  await db.$disconnect();
});

describe('place summary', () => {
  it('summarizes entries from the user and their friends only', async () => {
    llm.mockResolvedValue(goodAnswer);

    const { status, json } = await getSummary(sude.token, sudePlaceId);

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ status: 'OK', mentionCount: 2, cached: false, ...goodAnswer });

    const prompt = llm.mock.calls[0][0].user;
    expect(prompt).toContain('Cheesecake');
    expect(prompt).toContain('Filtre kahve');
    expect(prompt).not.toContain('SECRET NOTE');
    expect(prompt).not.toContain('Other place');
    expect(prompt).not.toContain('@summary.test'); // no emails sent to the AI provider
  });

  it('serves the second request from the cache without calling the model', async () => {
    const { json } = await getSummary(sude.token, sudePlaceId);
    expect(json.data).toMatchObject({ status: 'OK', cached: true, summary: goodAnswer.summary });
    expect(llm).not.toHaveBeenCalled();
  });

  it('builds a new summary when a friend edits their entry', async () => {
    await db.place.updateMany({ where: { userId: ali.id, name: 'Kronotrop Cihangir' }, data: { notes: 'Cortado da güzel' } });
    llm.mockResolvedValue(goodAnswer);

    const { json } = await getSummary(sude.token, sudePlaceId);
    expect(json.data.cached).toBe(false);
    expect(llm).toHaveBeenCalledOnce();
  });

  it('rejects a malformed model answer with 502 and does not cache it', async () => {
    await db.place.updateMany({ where: { userId: ali.id, name: 'Kronotrop Cihangir' }, data: { notes: 'Artık çok kalabalık' } });
    llm.mockResolvedValue({ summary: '', highlights: 'not an array' });

    const { status } = await getSummary(sude.token, sudePlaceId);
    expect(status).toBe(502);
    expect(await db.aiSummary.count()).toBe(2); // only the two valid answers above
  });

  it('does not call the model when there is nothing to summarize', async () => {
    const emptyId = await savePlace(sude.token, { name: 'Boş Park', latitude: 41.1, longitude: 29.0 });

    const { json } = await getSummary(sude.token, emptyId);
    expect(json.data).toEqual({ status: 'NOT_ENOUGH_DATA', mentionCount: 0 });
    expect(llm).not.toHaveBeenCalled();
  });

  it('applies the same permissions as place details', async () => {
    expect((await getSummary(stranger.token, sudePlaceId)).status).toBe(403);
    expect(llm).not.toHaveBeenCalled();
  });
});
