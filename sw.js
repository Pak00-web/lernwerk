/* Lernwerk Service Worker: eigene Dateien immer frisch vom Netz (Cache nur als Offline-Rückfall),
   Schriften/CDN aus dem Cache. Anfragen an Supabase werden nie zwischengespeichert. */
const CACHE = 'lernwerk-v28';
const SHELL = ['./', 'index.html', 'css/style.css', 'css/games.css', 'fragen.js', 'js/grafik.js', 'js/spiel.js', 'js/app.js', 'js/konto.js', 'js/duell.js', 'js/games-gfx.js', 'js/games.js', 'js/games-karten.js', 'js/games-bombe.js', 'js/games-mio.js', 'js/games-arena.js', 'icons/icon.svg', 'manifest.webmanifest', 'img/hero.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, {cache: 'reload'}))).catch(() => {}))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.hostname.endsWith('supabase.co')) return;
  const eigen = url.origin === location.origin;
  if (eigen){
    // network-first: neue Version sofort, ohne Strg+F5
    e.respondWith(fetch(e.request, {cache: 'no-cache'}).then(r => {
      if (r.ok){ const k = r.clone(); caches.open(CACHE).then(c => c.put(e.request, k)); }
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true})));
    return;
  }
  if (!(url.hostname.includes('fonts.g') || url.hostname === 'cdn.jsdelivr.net')) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const alt = await c.match(e.request);
    if (alt) return alt;
    const r = await fetch(e.request); if (r.ok) c.put(e.request, r.clone()); return r;
  }));
});
