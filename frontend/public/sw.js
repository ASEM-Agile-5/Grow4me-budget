// GrowForMe Service Worker — Background Sync for offline expense queue
const SYNC_TAG = "sync-expenses";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// When Background Sync fires (connectivity restored), tell the active client to flush
self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(notifyClientsToSync());
  }
});

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  clients.forEach((client) => client.postMessage({ type: "GFM_SYNC_REQUEST" }));
}
