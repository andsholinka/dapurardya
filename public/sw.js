const CACHE_NAME = "dapurardya-v1.2";
const STATIC_ASSETS = ["/", "/resep", "/manifest.json", "/icon-192.png", "/icon-512.png"];

// Install: Cache aset statis dasar
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  // Jangan skipWaiting otomatis — tunggu user konfirmasi update
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
  self.clients.claim();
});

// Terima pesan dari halaman (misal: konfirmasi update)
self.addEventListener("message", (e) => {
  if (e.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
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

// Handle Push Notifications
self.addEventListener("push", (e) => {
  const data = e.data?.json() || {
    title: "Dapur Ardya Update",
    body: "Ada fitur baru untukmu!",
    icon: "/icon-192.png",
  };

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192.png",
    badge: "/icon-192.png", // Icon satu warna untuk status bar
    data: {
      url: data.url || "/",
    },
    actions: [
      { action: "open", title: "Buka Sekarang" },
      { action: "close", title: "Tutup" },
    ],
  };

  e.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle Notification Click
self.addEventListener("notificationclick", (e) => {
  e.notification.close();

  if (e.action === "close") return;

  const urlToOpen = e.notification.data.url || "/";

  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Jika tab sudah terbuka, fokuskan. Jika tidak, buka tab baru.
      for (let client of windowClients) {
        if (client.url === urlToOpen && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});
