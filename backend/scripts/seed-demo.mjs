#!/usr/bin/env node
/**
 * Creates demo accounts, friendships and places through the public API.
 * Used for the App Review demo account and for App Store screenshots.
 *
 *   DEMO_PASSWORD='choose-a-password' node scripts/seed-demo.mjs https://your-app.vercel.app/api
 *
 * It only talks to the HTTP API, so it needs no database access, and it doubles as an end-to-end
 * check of a fresh deployment. Running it again is safe: existing accounts are logged in and
 * places are only added to accounts that have none.
 */

const API = (process.argv[2] ?? '').replace(/\/$/, '');
const PASSWORD = process.env.DEMO_PASSWORD ?? '';

if (!API.startsWith('http') || PASSWORD.length < 8) {
  console.error('Usage: DEMO_PASSWORD=<at least 8 characters> node scripts/seed-demo.mjs <API URL ending in /api>');
  process.exit(1);
}

async function call(method, path, { token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json.data, error: json.error };
}

async function account({ email, firstName, lastName, bio }) {
  let res = await call('POST', '/auth/register', { body: { email, password: PASSWORD, firstName, lastName } });
  if (res.status === 409) {
    res = await call('POST', '/auth/login', { body: { email, password: PASSWORD } });
  }
  if (!res.data?.token) {
    throw new Error(`Could not sign in as ${email}: ${res.status} ${res.error ?? ''}`);
  }

  const user = { email, token: res.data.token, id: res.data.user.id };
  if (bio) await call('PUT', '/users/profile', { token: user.token, body: { bio } });
  return user;
}

/** `from` sends a request; `to` accepts it unless `pendingOnly` is set. */
async function befriend(from, to, { pendingOnly = false } = {}) {
  await call('POST', '/friends', { token: from.token, body: { receiverId: to.id } });
  if (pendingOnly) return;

  const incoming = await call('GET', '/friends/requests', { token: to.token });
  const request = incoming.data?.find((r) => r.senderId === from.id);
  if (request) await call('POST', `/friends/${request.id}/accept`, { token: to.token });
}

async function addPlaces(user, places) {
  const existing = await call('GET', '/places', { token: user.token });
  if (existing.data?.length > 0) return existing.data;

  const created = [];
  for (const place of places) {
    const res = await call('POST', '/places', { token: user.token, body: place });
    if (res.status !== 201) throw new Error(`Could not save "${place.name}": ${res.status} ${res.error ?? ''}`);
    created.push(res.data);
  }
  return created;
}

const reviewer = await account({
  email: 'appreview@example.com',
  firstName: 'App',
  lastName: 'Review',
  bio: 'Demo account for App Review',
});
const ayse = await account({ email: 'ayse.demo@example.com', firstName: 'Ayşe', lastName: 'Demo', bio: 'Coffee and long walks by the sea' });
const mert = await account({ email: 'mert.demo@example.com', firstName: 'Mert', lastName: 'Demo', bio: 'Museums, views and good food' });
const zeynep = await account({ email: 'zeynep.demo@example.com', firstName: 'Zeynep', lastName: 'Demo' });

await befriend(ayse, reviewer);
await befriend(mert, reviewer);
await befriend(ayse, mert);
// Left pending so the reviewer can see and answer a friend request
await befriend(zeynep, reviewer, { pendingOnly: true });

await addPlaces(reviewer, [
  { name: 'Karaköy Güllüoğlu', category: 'Restaurant', latitude: 41.0225, longitude: 28.9779, rating: 5, favoriteFood: 'Fıstıklı baklava', notes: 'Best baklava in town, go early.' },
  { name: 'Maçka Parkı', category: 'Park', latitude: 41.0446, longitude: 28.9936, rating: 4, notes: 'Quiet and green, good for a Sunday walk.' },
]);

const aysePlaces = await addPlaces(ayse, [
  { name: 'Kronotrop', category: 'Cafe', latitude: 41.0315, longitude: 28.9822, rating: 4.5, favoriteDrink: 'Filtre kahve', favoriteFood: 'Cheesecake', notes: 'Sessiz, çalışmak için ideal. Hafta sonu kalabalık oluyor.' },
  { name: 'Moda Sahili', category: 'Park', latitude: 40.9809, longitude: 29.0254, rating: 5, notes: 'Gün batımında yürüyüş için en güzel yer.' },
  // App Review usually happens in California: places near Cupertino make the "friends nearby" view visible there
  { name: 'Apple Park Visitor Center', category: 'Attraction', latitude: 37.3327, longitude: -122.0053, rating: 4, notes: 'Nice view of the campus from the terrace.' },
]);

const mertPlaces = await addPlaces(mert, [
  { name: 'Kronotrop Cihangir', category: 'Cafe', latitude: 41.0316, longitude: 28.9823, rating: 4, favoriteDrink: 'Cortado', notes: 'Kahve harika ama oturacak yer az.' },
  { name: 'Galata Kulesi', category: 'Attraction', latitude: 41.0256, longitude: 28.9741, rating: 4, notes: 'Gün batımından önce git, sıra kısalıyor.' },
  { name: 'Cupertino Memorial Park', category: 'Park', latitude: 37.3239, longitude: -122.0444, rating: 4.5, notes: 'Great for a walk around the pond.' },
]);

for (const place of [aysePlaces[1], mertPlaces[1]].filter(Boolean)) {
  await call('POST', `/places/${place.id}/favorite`, { token: reviewer.token });
}

const friends = await call('GET', '/friends', { token: reviewer.token });
const nearby = await call('GET', '/places/nearby?lat=41.03&lng=28.98&radius=10000', { token: reviewer.token });

console.log('Demo data is ready.');
console.log(`  Sign in: ${reviewer.email} / (the DEMO_PASSWORD you chose)`);
console.log(`  Friends: ${friends.data?.length ?? 0}, friends' places around Istanbul: ${nearby.data?.length ?? 0}`);
