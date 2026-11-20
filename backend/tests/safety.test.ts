/**
 * Integration tests for the App Store safety features: account deletion, blocking and reporting.
 * Like api.test.ts, these run the real route handlers against a disposable PostgreSQL database.
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import * as register from '@/src/app/api/auth/register/route';
import * as login from '@/src/app/api/auth/login/route';
import * as profile from '@/src/app/api/users/profile/route';
import * as userSearch from '@/src/app/api/users/search/route';
import * as block from '@/src/app/api/users/[id]/block/route';
import * as blocked from '@/src/app/api/users/blocked/route';
import * as places from '@/src/app/api/places/route';
import * as place from '@/src/app/api/places/[id]/route';
import * as report from '@/src/app/api/places/[id]/report/route';
import * as friends from '@/src/app/api/friends/route';
import * as accept from '@/src/app/api/friends/[id]/accept/route';
import * as favorite from '@/src/app/api/places/[id]/favorite/route';
import * as config from '@/src/app/api/config/route';

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

type TestUser = { token: string; id: number };

async function signUp(email: string, firstName: string): Promise<TestUser> {
  const res = await register.POST(
    request('/api/auth/register', { method: 'POST', body: { email, password: 'password123', firstName } })
  );
  const json = await res.json();
  return { token: json.data.token, id: json.data.user.id };
}

async function makeFriends(a: TestUser, b: TestUser) {
  const res = await friends.POST(request('/api/friends', { method: 'POST', token: a.token, body: { receiverId: b.id } }));
  const requestId = (await res.json()).data.id;
  await accept.POST(request(`/api/friends/${requestId}/accept`, { method: 'POST', token: b.token }), params(requestId));
}

async function savePlace(user: TestUser, name: string) {
  const res = await places.POST(
    request('/api/places', { method: 'POST', token: user.token, body: { name, latitude: 41.03, longitude: 28.98 } })
  );
  return (await res.json()).data.id as number;
}

async function search(user: TestUser, q: string) {
  const res = await userSearch.GET(request(`/api/users/search?q=${q}`, { token: user.token }));
  return (await res.json()).data as { id: number }[];
}

async function reset() {
  await db.aiSummary.deleteMany();
  await db.report.deleteMany();
  await db.block.deleteMany();
  await db.favorite.deleteMany();
  await db.photo.deleteMany();
  await db.place.deleteMany();
  await db.friendship.deleteMany();
  await db.user.deleteMany();
}

let sude: TestUser;
let ali: TestUser;

beforeEach(async () => {
  await reset();
  sude = await signUp('sude@test.com', 'Sude');
  ali = await signUp('ali@test.com', 'Ali');
});

afterAll(async () => {
  await reset();
  await db.$disconnect();
});

describe('account deletion', () => {
  const deleteAccount = (user: TestUser, password: string) =>
    profile.DELETE(request('/api/users/profile', { method: 'DELETE', token: user.token, body: { password } }));

  it('asks for the password again and keeps the account when it is wrong', async () => {
    const res = await deleteAccount(sude, 'not-my-password');

    // 403 rather than 401, so the app does not log the user out
    expect(res.status).toBe(403);
    expect(await db.user.count({ where: { id: sude.id } })).toBe(1);
  });

  it('removes the user and everything they created', async () => {
    await makeFriends(sude, ali);
    const sudesPlace = await savePlace(sude, 'Kronotrop');
    const alisPlace = await savePlace(ali, 'Moda Sahili');
    await favorite.POST(request(`/api/places/${alisPlace}/favorite`, { method: 'POST', token: sude.token }), params(alisPlace));
    await db.aiSummary.create({ data: { sourceHash: 'abc', content: {}, model: 'test' } });

    const res = await deleteAccount(sude, 'password123');
    expect(res.status).toBe(200);

    expect(await db.user.count({ where: { id: sude.id } })).toBe(0);
    expect(await db.place.count({ where: { id: sudesPlace } })).toBe(0);
    expect(await db.friendship.count()).toBe(0);
    expect(await db.favorite.count()).toBe(0);
    expect(await db.aiSummary.count()).toBe(0);

    // Other users' data is untouched
    expect(await db.place.count({ where: { id: alisPlace } })).toBe(1);

    // The old credentials no longer work
    const loginRes = await login.POST(
      request('/api/auth/login', { method: 'POST', body: { email: 'sude@test.com', password: 'password123' } })
    );
    expect(loginRes.status).toBe(401);
  });
});

describe('blocking', () => {
  const blockUser = (user: TestUser, target: TestUser) =>
    block.POST(request(`/api/users/${target.id}/block`, { method: 'POST', token: user.token }), params(target.id));

  it('ends the friendship and hides the blocker’s places', async () => {
    await makeFriends(sude, ali);
    const sudesPlace = await savePlace(sude, 'Kronotrop');

    expect((await blockUser(sude, ali)).status).toBe(200);

    expect(await db.friendship.count()).toBe(0);
    const res = await place.GET(request(`/api/places/${sudesPlace}`, { token: ali.token }), params(sudesPlace));
    expect(res.status).toBe(403);
  });

  it('stops friend requests and search results in both directions', async () => {
    await blockUser(sude, ali);

    for (const [from, to] of [
      [ali, sude],
      [sude, ali],
    ]) {
      const res = await friends.POST(request('/api/friends', { method: 'POST', token: from.token, body: { receiverId: to.id } }));
      expect(res.status).toBe(403);
    }

    expect(await search(ali, 'sude')).toHaveLength(0);
    expect(await search(sude, 'ali')).toHaveLength(0);
  });

  it('lists blocked users and allows unblocking', async () => {
    await blockUser(sude, ali);

    let res = await blocked.GET(request('/api/users/blocked', { token: sude.token }));
    expect((await res.json()).data).toMatchObject([{ id: ali.id }]);

    await block.DELETE(request(`/api/users/${ali.id}/block`, { method: 'DELETE', token: sude.token }), params(ali.id));

    res = await blocked.GET(request('/api/users/blocked', { token: sude.token }));
    expect((await res.json()).data).toHaveLength(0);
    expect(await search(ali, 'sude')).toHaveLength(1);
  });

  it('does not let users block themselves', async () => {
    expect((await blockUser(sude, sude)).status).toBe(400);
  });
});

describe('reporting', () => {
  const reportPlace = (user: TestUser, placeId: number, body: unknown) =>
    report.POST(request(`/api/places/${placeId}/report`, { method: 'POST', token: user.token, body }), params(placeId));

  it("lets a friend report a place and stores the report for review", async () => {
    await makeFriends(sude, ali);
    const alisPlace = await savePlace(ali, 'Moda Sahili');

    const res = await reportPlace(sude, alisPlace, { reason: 'INAPPROPRIATE', details: 'Offensive note' });

    expect(res.status).toBe(201);
    expect(await db.report.findFirst()).toMatchObject({
      reporterId: sude.id,
      placeId: alisPlace,
      reason: 'INAPPROPRIATE',
      status: 'OPEN',
    });
  });

  it('only accepts known reasons', async () => {
    await makeFriends(sude, ali);
    const alisPlace = await savePlace(ali, 'Moda Sahili');

    expect((await reportPlace(sude, alisPlace, { reason: 'BORING' })).status).toBe(400);
  });

  it("rejects reports for your own places and for places you can't see", async () => {
    const sudesPlace = await savePlace(sude, 'Kronotrop');

    expect((await reportPlace(sude, sudesPlace, { reason: 'SPAM' })).status).toBe(400);
    expect((await reportPlace(ali, sudesPlace, { reason: 'SPAM' })).status).toBe(403);
  });
});

describe('config', () => {
  it('reports whether AI summaries are available', async () => {
    const original = process.env.OPENAI_API_KEY;
    try {
      delete process.env.OPENAI_API_KEY;
      expect((await (await config.GET()).json()).data).toEqual({ aiSummary: false });

      process.env.OPENAI_API_KEY = 'sk-test';
      expect((await (await config.GET()).json()).data).toEqual({ aiSummary: true });
    } finally {
      if (original === undefined) delete process.env.OPENAI_API_KEY;
      else process.env.OPENAI_API_KEY = original;
    }
  });
});
