self.addEventListener('push', function(event) {
    if (event.data) {
        try {
            const data = event.data.json();
            const title = data.title || 'Notificare Nouă';
            const options = {
                body: data.body,
                icon: data.icon || '/img/icon.png',
                badge: '/img/icon.png',
                vibrate: [200, 100, 200, 100, 200],
                data: {
                    status: data.status
                },
                requireInteraction: true
            };
            
            event.waitUntil(self.registration.showNotification(title, options));
        } catch (e) {
            console.error("Eroare la parsarea notificării push", e);
        }
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});
