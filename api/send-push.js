const webpush = require('web-push');

// Configurare VAPID Keys
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@bellalroma.ro',
    process.env.VITE_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
    // Permitem CORS pentru a fi apelat din frontend sau Supabase
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { subscription, title, body, status } = req.body;

        if (!subscription) {
            return res.status(400).json({ error: 'No push subscription provided' });
        }

        const payload = JSON.stringify({
            title: title || 'Notificare Bella Roma',
            body: body || 'Comanda a fost actualizată.',
            icon: '/img/icon.png',
            status: status || 'update'
        });

        await webpush.sendNotification(subscription, payload);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Eroare la trimiterea notificării push:', error);
        res.status(500).json({ error: 'Failed to send push notification' });
    }
}
