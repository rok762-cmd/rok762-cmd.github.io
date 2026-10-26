// 셔틀 관제 앱 설치용 서비스 워커: 항상 인터넷에서 최신 화면을 받고, 끊겼을 때만 마지막 화면을 보여 준다
const CACHE = 'shuttle-shell-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return; // 서버 자료·지도는 건드리지 않음
  e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('shell', copy)); return res; })
    .catch(() => caches.open(CACHE).then((c) => c.match('shell')).then((r) => r || new Response('인터넷 연결을 확인해 주세요.', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }))));
});
