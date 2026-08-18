/* Service worker: makes the app load with no signal.
 *
 * Strategy is split deliberately:
 *   - the page itself  -> network-first (with a short timeout), so a new deploy
 *                         lands on the phone by itself and you never have to
 *                         hand-bump a cache version
 *   - everything else  -> cache-first, since icons/manifest rarely change
 *
 * The timeout matters more than it looks: gym wifi that associates but has no
 * working uplink would otherwise hang the fetch for ~30s before failing over.
 * We give the network 2.5s, then serve the cached copy regardless.
 */
const CACHE = 'gains-quest-v2';
const NET_TIMEOUT = 2500;

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // Individual failures (e.g. a missing icon) must not abort the install.
      .then(c => Promise.allSettled(ASSETS.map(a => c.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/** Store a copy without blocking the response we hand back. */
function stash(req, res) {
  if (res && res.ok) {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
  }
  return res;
}

/** Network, but never wait longer than NET_TIMEOUT before falling back. */
async function networkFirst(req) {
  const cached = caches.match(req);

  const timeout = new Promise(resolve =>
    setTimeout(() => resolve(cached.then(hit => hit || null)), NET_TIMEOUT)
  );

  const network = fetch(req)
    .then(res => stash(req, res))
    .catch(() => null);

  // Whichever wins, make sure we never resolve to null.
  const winner = await Promise.race([network, timeout]);
  if (winner) return winner;

  return (await network) || (await cached) || caches.match('./index.html');
}

async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  try {
    return stash(req, await fetch(req));
  } catch {
    return caches.match('./index.html');
  }
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;  // let anything cross-origin pass through

  const isPage = e.request.mode === 'navigate' ||
                 url.pathname === '/' ||
                 url.pathname.endsWith('/index.html');

  e.respondWith(isPage ? networkFirst(e.request) : cacheFirst(e.request));
});
