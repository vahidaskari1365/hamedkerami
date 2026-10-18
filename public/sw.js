/*
 * Service Worker — Dr. Hamed Kermani PWA
 * Strategy:
 *  - Precache app shell (document + critical assets)
 *  - Navigation requests: network-first, fall back to cached shell
 *  - Static assets (images/fonts/css/js): stale-while-revalidate
 *  - Never cache: /api/*, cross-origin
 */
const VERSION = "v1.1.0";
const SHELL_CACHE = `shell-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const SHELL_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon-32.png",
  "/favicon-192.png",
  "/pwa-192.png",
  "/pwa-512.png",
  "/apple-touch-icon.png",
];

/* ---------- install: precache shell ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) =>
        Promise.allSettled(SHELL_ASSETS.map((url) => cache.add(url))),
      )
      .then(() => self.skipWaiting()),
  );
});

/* ---------- activate: clean old caches ---------- */
self.addEventListener("activate", (event) => {
  const keep = new Set([SHELL_CACHE, RUNTIME_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/* ---------- message: skip waiting on update ---------- */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

/* ---------- fetch strategies ---------- */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // never intercept API / cross-origin
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  // navigation (SPA shell)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((c) => c.put("/", copy));
          return response;
        })
        .catch(() =>
          caches.match("/").then((shell) => shell || Response.error()),
        ),
    );
    return;
  }

  // static: stale-while-revalidate
  event.respondWith(
    caches.open(RUNTIME_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
