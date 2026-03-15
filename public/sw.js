const CACHE_NAME = "dapurardya-v1.1";
const STATIC_ASSETS = ["/", "/resep", "/manifest.json", "/icon-192.png", "/icon-512.png"];

// Install: Cache aset statis dasar
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // Paksa service worker baru langsung aktif
});

// Activate: Hapus cache lama
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim(); // Langsung ambil kendali klien tanpa reload
});

// Fetch: Strategi Network First untuk navigasi, Stale-While-Revalidate untuk aset
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  
  const url = new URL(e.request.url);
  if (url.pathname.startsWith("/api/")) return;

  // Untuk navigasi halaman (HTML), cari di network dulu
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Untuk aset lain (gambar/css/js), gunakan Stale-While-Revalidate
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const networked = fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || networked;
    })
  );
});
