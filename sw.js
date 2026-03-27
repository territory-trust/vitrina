// Встановлення Service Worker
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('Service Worker: Installed');
});

// Активація Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    console.log('Service Worker: Activated');
});

// Обробка кліку по push-увідомленню у шторці телефону
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
