/* Already Home: keeps the kit working on weak wifi after one visit.
   Page: network first (3.5 s), then the saved copy. Pictures and fonts: the saved copy first.
   Analytics (Umami) and sign-ups (Brevo) are never touched. Change V to refresh every phone's saved copy. */
const V = 'ah-v1';
const FONTS_CSS = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,500;1,700&family=Inter:wght@400;500;600;700&display=swap';
const IMGS = ['s_daniel', 's_daniel_phone', 's_donkey', 's_kate', 's_llama', 's_llama_calm', 's_marta', 's_marta_say', 's_priya', 's_priya_bingo', 's_priya_worry', 's_tom', 's_tom_story'];
const CORE = ['./', 'icon-32.png', 'icon-192.png', 'icon-180.png'].concat(IMGS.map(n => 'img/' + n + '.jpg'));
const PAGE = new URL('./', self.location).href;

async function saveFonts(cache) {
  try {
    const res = await fetch(FONTS_CSS, { mode: 'cors' });
    if (!res.ok) return;
    const css = await res.clone().text();
    await cache.put(FONTS_CSS, res);
    const urls = Array.from(css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)).map(m => m[1]);
    await Promise.all(urls.map(u => fetch(u, { mode: 'cors' }).then(r => r.ok ? cache.put(u, r) : null).catch(() => null)));
  } catch (e) {}
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(V);
    await cache.addAll(CORE);
    await saveFonts(cache);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('ah-') && k !== V).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function pageFirst(req) {
  const cache = await caches.open(V);
  const net = fetch(req).then(res => {
    if (res && res.ok && !res.redirected) cache.put(PAGE, res.clone());
    return res;
  });
  net.catch(() => null);
  const saved = await cache.match(PAGE);
  if (!saved) return net;
  const timeout = new Promise(resolve => setTimeout(() => resolve(null), 3500));
  try {
    const res = await Promise.race([net, timeout]);
    return res || saved;
  } catch (e) {
    return saved;
  }
}

async function savedFirst(req, refresh) {
  const cache = await caches.open(V);
  const saved = await cache.match(req);
  if (saved && !refresh) return saved;
  const net = fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  });
  if (saved) {
    net.catch(() => null);
    return saved;
  }
  return net;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const scope = new URL('./', self.location);
  if (url.origin === scope.origin && url.pathname.startsWith(scope.pathname)) {
    if (req.mode === 'navigate' || url.pathname === scope.pathname || url.pathname === scope.pathname + 'index.html') {
      e.respondWith(pageFirst(req));
      return;
    }
    if (url.pathname.endsWith('/sw.js')) return;
    e.respondWith(savedFirst(req, true));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(savedFirst(req, false));
  }
});
