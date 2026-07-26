self.addEventListener('push', function(event) {
    if (event.data) {
        try {
            const data = event.data.json();
            const title = data.title || 'Pizzerie Bella Roma';
            const body = data.body || 'Statutul comenzii tale s-a schimbat!';
            const status = data.status || 'update';
            const iconUrl = data.icon || (location.origin + '/img/icon.png');

            const options = {
                body: body,
                icon: iconUrl,
                badge: iconUrl,
                vibrate: [200, 100, 200, 100, 200],
                data: {
                    status: status,
                    title: title,
                    body: body
                },
                requireInteraction: true,
                renotify: true,
                tag: 'bella-roma-order-' + Date.now()
            };
            
            event.waitUntil(
                Promise.all([
                    self.registration.showNotification(title, options),
                    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
                        clientList.forEach(function(client) {
                            client.postMessage({
                                type: 'PUSH_ORDER_STATUS',
                                title: title,
                                body: body,
                                status: status
                            });
                        });
                    })
                ])
            );
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
