const CACHE_NAME = 'pacemaker-v1';

// 브라우저가 서비스 워커를 설치할 때
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// 앱이 활성화될 때
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// 인터넷이 잠시 끊겨도 앱이 켜지게 돕는 최소한의 네트워크 가로채기
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});


