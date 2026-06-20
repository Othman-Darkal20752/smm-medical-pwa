const CACHE_NAME = "smm-pwa-v4";

const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icons/smm-icon.svg",
  "/hero/hero-1-desktop.webp",
  "/hero/hero-1-mobile.webp",
  "/hero/hero-2-desktop.webp",
  "/hero/hero-2-mobile.webp",
  "/hero/hero-3-desktop.webp",
  "/hero/hero-3-mobile.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/media/")) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/")));
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((networkResponse) => {
        const isStaticAsset =
          STATIC_ASSETS.includes(url.pathname) ||
          url.pathname.startsWith("/assets/");

        if (isStaticAsset && networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, responseClone));
        }

        return networkResponse;
      });
    })
  );
});