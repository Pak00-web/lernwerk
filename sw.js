/* Lernwerk Service Worker: eigene Dateien offline verfügbar, beim Online-Öffnen im Hintergrund aktualisiert.
   Anfragen an Supabase werden nie zwischengespeichert. */
const CACHE = 'lernwerk-v8';
const SHELL = ['./', 'index.html', 'css/style.css', 'fragen.js', 'js/grafik.js', 'js/spiel.js', 'js/app.js', 'js/konto.js', 'js/duell.js', 'icons/icon.svg', 'manifest.webmanifest', 'img/hero.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {}))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.hostname.endsWith('supabase.co')) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const alt = await c.match(e.request, {ignoreSearch: true});
    const neu = fetch(e.request).then(r => { if (r.ok && (url.origin === location.origin || url.hostname.includes('fonts.g') || url.hostname === 'cdn.jsdelivr.net')) c.put(e.request, r.clone()); return r; }).catch(() => alt);
    return alt || neu;
  }));
});
