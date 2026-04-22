// GrowForMe Service Worker — PWA caching + Background Sync
const CACHE = "gfm-v2";
const SHELL = ["/", "/offline.html", "/icons/icon-192.svg", "/icons/icon-512.svg"];
const API_HOST = "grow4me-backend-213305484430.us-central1.run.app";
const SYNC_TAG = "sync-expenses";

// ── Install: precache the app shell ──────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

// ── Activate: purge old caches ────────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: routing strategy ───────────────────────────────────────────────────
self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Never intercept non-GET (POST/PUT/DELETE pass through directly)
  if (request.method !== "GET") return;

  // ① API calls → network-first, cache GET responses as fallback
  if (url.hostname === API_HOST) {
    e.respondWith(networkFirstApi(request));
    return;
  }

  // ② Navigation (page loads) → network-first, fall back to shell, then /offline.html
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put("/", clone));
          }
          return res;
        })
        .catch(() =>
          caches.match("/").then((r) => r ?? caches.match("/offline.html"))
        )
    );
    return;
  }

  // ③ Google Fonts + static assets → cache-first, populate on miss
  if (
    url.origin === self.location.origin ||
    url.hostname.endsWith("fonts.googleapis.com") ||
    url.hostname.endsWith("fonts.gstatic.com")
  ) {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
          }
          return res;
        });
      })
    );
  }
});

async function networkFirstApi(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    return (await cache.match(request)) ?? Response.error();
  }
}

// ── Background Sync: notify clients to flush the expense queue ────────────────
self.addEventListener("sync", (e) => {
  if (e.tag === SYNC_TAG) e.waitUntil(notifyClientsToSync());
});

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clients.forEach((c) => c.postMessage({ type: "GFM_SYNC_REQUEST" }));
}
