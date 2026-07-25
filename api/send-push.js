const webpush = require('web-push');

// Configurare VAPID Keys
webpush.setVapidDetails(
    'mailto:admin@bellalroma.ro',
    process.env.VITE_VAPID_PUBLIC_KEY || "BAxhEvzEuSTKNSIHcJIxoy3fEa31mbZJ6S3gLmo4lJLfbOfL_G0_5X6wVTKcJFw41nvzx5ay9LRnbLbFD0S8GKo",
    process.env.VAPID_PRIVATE_KEY || "UDk_DvXGtVAFH44o7KJXPR2nDHeK1vBi66zBUiYwsW4"
);

module.exports = async function handler(req, res) {
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
