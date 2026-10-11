const CACHE = "qx-pro-v4";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./index.html", "./manifest.json", "./icon-192.png"])));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await clients.claim();
  })());
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if(url.hostname === "raw.githubusercontent.com" || url.hostname === "api.counterapi.dev"){
    e.respondWith(fetch(e.request).catch(() => new Response(JSON.stringify({offline:true}), {headers:{"Content-Type":"application/json"}})));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
