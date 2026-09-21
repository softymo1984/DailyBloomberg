// 更新するときは必ずこの VERSION の数字を上げてからアップロードする。
// 上げ忘れると、端末に古い画面がキャッシュされたままになる。
const VERSION = 'flashcards-v12';

const ASSETS = [
  './',
  './index.html',
  './bloomberg.html',
  './bep.html',
  './repeat.html',
  './speak.html',
  './manifest.json',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())   // 1つでも取得失敗したら諦めて進む
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ネット優先・失敗したらキャッシュ。こうしておくと更新が反映されやすい。
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
