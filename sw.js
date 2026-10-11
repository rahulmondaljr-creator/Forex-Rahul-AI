const CACHE = "qx-pro-v5";
const CORE = ["./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
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
  if(e.request.mode === "navigate" || url.pathname.endsWith("index.html") || url.pathname.endsWith("/")){
    // network-first: app page always fresh
    e.respondWith(fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
