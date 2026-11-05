/* Menyimpan berkas aplikasi agar tetap terbuka saat sinyal buruk. Data keuangan tidak lewat sini. */
const VERSI = 'amplop-1.0.0';
const BERKAS = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(BERKAS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // Utamakan versi terbaru dari internet, pakai simpanan saat offline.
  e.respondWith(
    fetch(e.request).then(r => {
      const salinan = r.clone();
      if (r.ok) caches.open(VERSI).then(c => c.put(e.request, salinan));
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
