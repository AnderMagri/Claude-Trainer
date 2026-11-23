// sw.js: keeps the app shell available offline. Change VERSION every time you deploy.
const VERSION = "v1";
const SHELL = ["/", "/index.html", "/app.css", "/app.js", "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Pages: network first, so people see the newest version; the cached page is used when offline.
// Other files: cache first, for speed. Calls to /api/ are never cached.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).pathname.startsWith("/api/")) return;
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/index.html")));
    return;
  }
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
