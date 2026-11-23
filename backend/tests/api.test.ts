/**
 * Integration tests: call the route handlers directly against a real PostgreSQL database.
 * Requires DATABASE_URL to point to a disposable test database (see README).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { db } from '@/src/lib/db';
import * as register from '@/src/app/api/auth/register/route';
import * as login from '@/src/app/api/auth/login/route';
import * as places from '@/src/app/api/places/route';
import * as place from '@/src/app/api/places/[id]/route';
import * as nearby from '@/src/app/api/places/nearby/route';
import * as friends from '@/src/app/api/friends/route';
import * as requests from '@/src/app/api/friends/requests/route';
import * as accept from '@/src/app/api/friends/[id]/accept/route';
import * as favorite from '@/src/app/api/places/[id]/favorite/route';
import * as favorites from '@/src/app/api/favorites/route';
import * as userSearch from '@/src/app/api/users/search/route';
import * as search from '@/src/app/api/places/search/route';
import * as userPlaces from '@/src/app/api/users/[id]/places/route';
import * as userProfile from '@/src/app/api/users/[id]/route';

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

async function signUp(email: string, firstName: string) {
  const res = await register.POST(
    request('/api/auth/register', { method: 'POST', body: { email, password: 'password123', firstName } })
  );
  const json = await res.json();
  return { token: json.data.token as string, id: json.data.user.id as number };
}

async function reset() {
  await db.favorite.deleteMany();
  await db.photo.deleteMany();
  await db.place.deleteMany();
  await db.friendship.deleteMany();
  await db.user.deleteMany();
}

let sude: { token: string; id: number };
let ali: { token: string; id: number };

beforeAll(async () => {
  await reset();
  sude = await signUp('sude@test.com', 'Sude');
  ali = await signUp('ali@test.com', 'Ali');
});

afterAll(async () => {
  await reset();
  await db.$disconnect();
});

describe('auth', () => {
  it('never returns the password hash', async () => {
    const res = await login.POST(
      request('/api/auth/login', { method: 'POST', body: { email: 'sude@test.com', password: 'password123' } })
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.user.password).toBeUndefined();
  });

  it('rejects a wrong password', async () => {
    const res = await login.POST(
      request('/api/auth/login', { method: 'POST', body: { email: 'sude@test.com', password: 'wrong-pass' } })
    );
    expect(res.status).toBe(401);
  });

  it('does not allow registering the same email twice', async () => {
    const res = await register.POST(
      request('/api/auth/register', { method: 'POST', body: { email: 'SUDE@test.com', password: 'password123' } })
    );
    expect(res.status).toBe(409);
  });
});

describe('places', () => {
  let placeId: number;

  it('requires authentication', async () => {
    const res = await places.GET(request('/api/places'));
    expect(res.status).toBe(401);
  });

  it('creates a place for the logged-in user', async () => {
    const res = await places.POST(
      request('/api/places', {
        method: 'POST',
        token: ali.token,
        body: { name: 'Moda Sahili', category: 'Park', latitude: 40.9809, longitude: 29.0254, rating: 4.5 },
      })
    );
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.data.latitude).toBe(40.9809);
    expect(json.data.user.password).toBeUndefined();
    placeId = json.data.id;
  });

  it('hides a place from users who are not friends', async () => {
    const res = await place.GET(request(`/api/places/${placeId}`, { token: sude.token }), params(placeId));
    expect(res.status).toBe(403);
  });

  it('does not let another user delete the place', async () => {
    const res = await place.DELETE(
      request(`/api/places/${placeId}`, { method: 'DELETE', token: sude.token }),
      params(placeId)
    );
    expect(res.status).toBe(403);
  });

  it('returns friends places in nearby search after a friendship is accepted', async () => {
    // No friends yet → nothing nearby
    let res: Response = await nearby.GET(request('/api/places/nearby?lat=40.99&lng=29.03', { token: sude.token }));
    expect((await res.json()).data).toHaveLength(0);

    // Sude finds Ali and sends a request, Ali accepts it
    res = await userSearch.GET(request('/api/users/search?q=ali', { token: sude.token }));
    const [found] = (await res.json()).data;
    expect(found).toMatchObject({ id: ali.id, relation: 'NONE' });

    await friends.POST(request('/api/friends', { method: 'POST', token: sude.token, body: { receiverId: ali.id } }));
    res = await requests.GET(request('/api/friends/requests', { token: ali.token }));
    const [pending] = (await res.json()).data;
    res = await accept.POST(request(`/api/friends/${pending.id}/accept`, { method: 'POST', token: ali.token }), params(pending.id));
    expect(res.status).toBe(200);

    res = await nearby.GET(request('/api/places/nearby?lat=40.99&lng=29.03&radius=3000', { token: sude.token }));
    const json = await res.json();
    expect(json.data).toHaveLength(1);
    expect(json.data[0].distance).toBeGreaterThan(0);
    expect(json.data[0].distance).toBeLessThan(3000);

    // Outside the radius
    res = await nearby.GET(request('/api/places/nearby?lat=41.04&lng=28.98&radius=1000', { token: sude.token }));
    expect((await res.json()).data).toHaveLength(0);
  });

  it('lets friends view place details', async () => {
    const res = await place.GET(request(`/api/places/${placeId}`, { token: sude.token }), params(placeId));
    expect(res.status).toBe(200);
    expect((await res.json()).data.isFavorite).toBe(false);
  });

  it('adds and removes a friend\'s place from favorites', async () => {
    const add = () =>
      favorite.POST(request(`/api/places/${placeId}/favorite`, { method: 'POST', token: sude.token }), params(placeId));

    expect((await add()).status).toBe(200);
    expect((await add()).status).toBe(200); // idempotent

    let res: Response = await favorites.GET(request('/api/favorites', { token: sude.token }));
    expect((await res.json()).data).toHaveLength(1);

    await favorite.DELETE(request(`/api/places/${placeId}/favorite`, { method: 'DELETE', token: sude.token }), params(placeId));
    res = await favorites.GET(request('/api/favorites', { token: sude.token }));
    expect((await res.json()).data).toHaveLength(0);
  });
});

describe('private places', () => {
  let privateId: number;
  let sharedId: number;

  const create = async (name: string, isPrivate: boolean) => {
    const res = await places.POST(
      request('/api/places', {
        method: 'POST',
        token: ali.token,
        body: { name, category: 'Park', latitude: 40.9815, longitude: 29.026, isPrivate },
      })
    );
    expect(res.status).toBe(201);
    return (await res.json()).data as { id: number; isPrivate: boolean };
  };

  it('saves a private place that only its owner can open', async () => {
    const created = await create('Secret Garden', true);
    expect(created.isPrivate).toBe(true);
    privateId = created.id;

    let res: Response = await place.GET(request(`/api/places/${privateId}`, { token: ali.token }), params(privateId));
    expect(res.status).toBe(200);

    // To a friend it looks like it does not exist
    res = await place.GET(request(`/api/places/${privateId}`, { token: sude.token }), params(privateId));
    expect(res.status).toBe(404);
  });

  it("keeps private places out of friends' nearby results, search and favorites", async () => {
    let res: Response = await nearby.GET(
      request('/api/places/nearby?lat=40.99&lng=29.03&radius=3000', { token: sude.token })
    );
    expect((await res.json()).data.map((p: { id: number }) => p.id)).not.toContain(privateId);

    res = await search.GET(request('/api/places/search?q=secret', { token: sude.token }));
    expect((await res.json()).data).toHaveLength(0);
    res = await search.GET(request('/api/places/search?q=secret', { token: ali.token }));
    expect((await res.json()).data).toHaveLength(1);

    res = await favorite.POST(
      request(`/api/places/${privateId}/favorite`, { method: 'POST', token: sude.token }),
      params(privateId)
    );
    expect(res.status).toBe(404);
  });

  it("drops a place from friends' favorites when its owner makes it private", async () => {
    sharedId = (await create('Yogurtcu Park', false)).id;
    await favorite.POST(request(`/api/places/${sharedId}/favorite`, { method: 'POST', token: sude.token }), params(sharedId));
    let res: Response = await favorites.GET(request('/api/favorites', { token: sude.token }));
    expect((await res.json()).data.map((p: { id: number }) => p.id)).toContain(sharedId);

    res = await place.PUT(
      request(`/api/places/${sharedId}`, { method: 'PUT', token: ali.token, body: { isPrivate: true } }),
      params(sharedId)
    );
    expect(res.status).toBe(200);

    res = await favorites.GET(request('/api/favorites', { token: sude.token }));
    expect((await res.json()).data.map((p: { id: number }) => p.id)).not.toContain(sharedId);

    // Sharing it again brings it back
    await place.PUT(
      request(`/api/places/${sharedId}`, { method: 'PUT', token: ali.token, body: { isPrivate: false } }),
      params(sharedId)
    );
    res = await favorites.GET(request('/api/favorites', { token: sude.token }));
    expect((await res.json()).data.map((p: { id: number }) => p.id)).toContain(sharedId);
  });
});

describe('friend profiles', () => {
  it("lists a friend's shared places and counts only those", async () => {
    let res: Response = await userPlaces.GET(request(`/api/users/${ali.id}/places`, { token: sude.token }), params(ali.id));
    expect(res.status).toBe(200);
    const shared = (await res.json()).data as { isPrivate: boolean }[];
    expect(shared.length).toBeGreaterThan(0);
    expect(shared.every((p) => !p.isPrivate)).toBe(true);

    res = await userProfile.GET(request(`/api/users/${ali.id}`, { token: sude.token }), params(ali.id));
    expect((await res.json()).data._count.places).toBe(shared.length);
  });

  it('shows all of your own places, private ones included', async () => {
    const res = await userPlaces.GET(request(`/api/users/${ali.id}/places`, { token: ali.token }), params(ali.id));
    const own = (await res.json()).data as { isPrivate: boolean }[];
    expect(own.some((p) => p.isPrivate)).toBe(true);
  });

  it('refuses people who are not friends', async () => {
    const zeynep = await signUp('zeynep@test.com', 'Zeynep');
    const res = await userPlaces.GET(request(`/api/users/${ali.id}/places`, { token: zeynep.token }), params(ali.id));
    expect(res.status).toBe(403);
  });
});
