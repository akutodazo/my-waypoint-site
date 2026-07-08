// キャッシュ（倉庫）の名前。貯蔵方針を変えたらv2, v3...と上げると古い倉庫が捨てられる
const CACHE = 'waypoint-site-v1';

// インストール時: アプリの入口とKMZひな型を先に倉庫へ入れておく
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['./', 'template.kmz']))
      .then(() => self.skipWaiting()),
  );
});

// 更新時: 名前の違う古い倉庫を掃除する
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      ),
  );
});

// 通信のたび: まずネットワークへ。成功したら倉庫も更新。圏外なら倉庫から出す
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const res = await fetch(event.request);
        if (res.ok && new URL(event.request.url).origin === location.origin) {
          cache.put(event.request, res.clone());
        }
        return res;
      } catch {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        throw new Error('offline');
      }
    }),
  );
});
