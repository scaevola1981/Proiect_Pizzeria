const webpush = require('web-push');

// Configurare VAPID Keys — DOAR din variabile de mediu, fără fallback hardcodat
const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@bellalroma.ro';

if (!vapidPublicKey || !vapidPrivateKey) {
    console.error('⚠️ VAPID keys lipsesc! Setați VITE_VAPID_PUBLIC_KEY și VAPID_PRIVATE_KEY în variabilele de mediu.');
} else {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

// Origini permise (adaugă domeniul final când e disponibil)
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000',
    // Adaugă aici domeniul de producție când e disponibil:
    // 'https://bella-roma.vercel.app',
    // 'https://bellalroma.ro',
];

module.exports = async function handler(req, res) {
    // CORS restricționat — doar originile permise
    const origin = req.headers.origin || '';
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Verificăm că VAPID keys sunt configurate
    if (!vapidPublicKey || !vapidPrivateKey) {
        return res.status(500).json({ error: 'VAPID keys not configured' });
    }

    try {
        let subscription, title, body, status;

        // Check if this is a Supabase Webhook payload
        if (req.body && req.body.record) {
            const record = req.body.record;
            const oldRecord = req.body.old_record || {};

            // Daca statusul nu s-a schimbat, ignoram
            if (record.status === oldRecord.status) {
                return res.status(200).json({ message: 'Status nemodificat' });
            }

            subscription = record.push_subscription;
            status = record.status;

            if (status === 'in_preparare') {
                title = 'Comanda a fost acceptată!';
                body = 'Bucătarii noștri au început prepararea comenzii tale. 🍕';
            } else if (status === 'servita') {
                title = 'Comanda este gata!';
                body = 'Va fi servită la masă. Poftă bună! 🛎️';
            } else {
                return res.status(200).json({ message: 'Status ignorat' });
            }
        } else {
            // Fallback
            subscription = req.body.subscription;
            title = req.body.title;
            body = req.body.body;
            status = req.body.status;
        }

        if (!subscription) {
            return res.status(200).json({ message: 'Fără abonament push' });
        }

        // Validare structura subscription
        if (!subscription.endpoint || !subscription.keys) {
            return res.status(400).json({ error: 'Subscription invalidă' });
        }

        const payload = JSON.stringify({
            title: title || 'Notificare Bella Roma',
            body: body || 'Comanda a fost actualizată.',
            icon: req.body && req.body.icon ? req.body.icon : '/img/icon.png',
            status: status || 'update'
        });

        await webpush.sendNotification(subscription, payload);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Eroare la trimiterea notificării push:', error);
        // Nu expunem detalii interne
        res.status(500).json({ error: 'Eroare la trimiterea notificării' });
    }
}
