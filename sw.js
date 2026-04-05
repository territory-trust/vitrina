const CACHE_NAME = 'ai-pilot-cache-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/landing.html',
    '/cabinet.html', // Додав кабінет у кеш для швидкодії
    '/manifest.json',
    '/app-icon-v2.jpg',
    '/1000007790.jpg',
    '/config.js'
];

// 1. Встановлення Service Worker та кешування (Для Google Play)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Кеш відкрито');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
    self.skipWaiting();
    console.log('Service Worker: Installed');
});

// 2. Активація та очищення старого кешу
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Очищення старого кешу');
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
    console.log('Service Worker: Activated');
});

// 3. Стратегія "Мережа спочатку" (ОБОВ'ЯЗКОВО ДЛЯ GOOGLE PLAY)
self.addEventListener('fetch', (event) => {
    // Пропускаємо запити до Supabase та зовнішніх API
    if (event.request.url.includes('supabase.co')) {
        return;
    }
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// =========================================================================
// 4. ТВІЙ КОД: Обробка кліку по push-увідомленню у шторці телефону
// =========================================================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Закриваємо увідомлення при кліку

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Перевіряємо, чи вже відкрита вкладка з кабінетом
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url.includes('cabinet.html') && 'focus' in client) {
                    return client.focus(); // Перемикаємось на неї
                }
            }
            // Якщо вкладка закрита - відкриваємо нову
            if (clients.openWindow) {
                return clients.openWindow('cabinet.html');
            }
        })
    );
});
