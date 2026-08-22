/**
 * Bella Roma In-House Background Print Service (USB Direct)
 * Autonomous daemon bridging Supabase Realtime with local USB ESC/POS thermal printer.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { buildEscPosBuffer } = require('./escpos-builder');
const { printRawBuffer, resolveTargetPrinter, getWindowsPrinters } = require('./printer-driver-usb');

// 1. Încărcare Configurație (Caută în directorul executabilului, cwd și directorul scriptului)
const possibleConfigPaths = [
    path.join(path.dirname(process.execPath), 'config.json'),
    path.join(process.cwd(), 'config.json'),
    path.join(__dirname, 'config.json')
];

let config = {
    connection_type: "USB",
    printer_name: "POS-80",
    printer_name_regex: "(POS-80|OCPP|Thermal|Receipt|XP-80|POS80|Samsung|M2020|M2026)",
    supabase_url: "https://tzdtssvjsrhyocskivmm.supabase.co",
    supabase_key: "sb_publishable_JRIxO4MMjth3IkqfaOCPmw_e69T87UP",
    auto_cut: true,
    beep_on_order: true,
    beep_count: 2,
    http_port: 4000,
    poll_interval_seconds: 15,
    retry_delay_seconds: 3,
    max_retries: 5
};

for (const p of possibleConfigPaths) {
    if (fs.existsSync(p)) {
        try {
            const rawContent = fs.readFileSync(p, 'utf8');
            const cleanContent = rawContent.replace(/^\uFEFF/, '').trim();
            const userConfig = JSON.parse(cleanContent);
            config = { ...config, ...userConfig };
            console.log(`📁 Configurație încărcată cu succes din: ${p}`);
            break;
        } catch (e) {
            console.warn(`⚠️ Eroare parsare fișier config (${p}):`, e.message);
        }
    }
}

// 2. Inițializare Supabase Client cu WebSocket nativ pentru Node.js
const WebSocket = require('ws');
global.WebSocket = WebSocket;

const supabase = createClient(config.supabase_url, config.supabase_key, {
    realtime: {
        transport: WebSocket
    }
});

// Set în memorie pentru prevenirea printărilor duplicate
const printedOrderHistory = new Set();

/**
 * Procesează și trimite o comandă către imprimanta USB
 */
async function processOrder(order, isManual = false) {
    if (!order || !order.id) return { success: false, error: 'Comandă invalidă' };

    const orderKey = `${order.id}_${order.total}_${(order.detalii_comanda || []).length}`;

    // Verificare duplicat
    if (!isManual && printedOrderHistory.has(orderKey)) {
        console.log(`ℹ️ Comanda #${order.id} a fost deja printată recent. Se omite.`);
        return { success: true, duplicate: true };
    }

    try {
        console.log(`📄 Pregătire bon pentru Masa ${order.numar_masa} (Comanda #${order.id})...`);
        const buffer = buildEscPosBuffer(order, config);
        
        await printRawBuffer(buffer, config);
        
        printedOrderHistory.add(orderKey);

        // Actualizăm statusul în Supabase dacă este "noua"
        if (order.status === 'noua') {
            try {
                await supabase
                    .from('comenzi')
                    .update({ status: 'in_preparare' })
                    .eq('id', order.id);
                console.log(`🔄 Statusul comenzii #${order.id} actualizat în "in_preparare".`);
            } catch (dbErr) {
                console.warn(`⚠️ Nu s-a putut actualiza statusul comenzii #${order.id} în DB:`, dbErr.message);
            }
        }

        return { success: true, orderId: order.id };
    } catch (err) {
        console.error(`❌ Eroare la procesarea comenzii #${order.id}:`, err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Sincronizează comenzile neprintate la pornire (Recovery după downtime)
 */
async function syncUnprintedOrders() {
    console.log("🔍 Verificare comenzi neprintate în Supabase (Startup Recovery)...");
    try {
        const { data: orders, error } = await supabase
            .from('comenzi')
            .select('*')
            .eq('status', 'noua')
            .order('created_at', { ascending: true });

        if (error) {
            console.error("❌ Eroare la căutarea comenzilor neprintate:", error.message);
            return;
        }

        if (orders && orders.length > 0) {
            console.log(`📋 S-au găsit ${orders.length} comenzi neprintate. Se trimit spre imprimantă...`);
            for (const order of orders) {
                await processOrder(order);
                await new Promise(r => setTimeout(r, 800)); // Pauză scurtă între bonuri
            }
        } else {
            console.log("✅ Toate comenzile sunt la zi. Nicio comandă restantă.");
        }
    } catch (e) {
        console.error("❌ Eroare neașteptată la sincronizare:", e.message);
    }
}

/**
 * Ascultare Supabase Realtime
 */
function initRealtimeSubscription() {
    console.log("⚡ Conectare la Supabase Realtime pe canalul 'comenzi'...");
    
    supabase
        .channel('bella-print-channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comenzi' }, payload => {
            console.log("🔔 [REALTIME INSERT] Comandă nouă primită:", payload.new.id);
            processOrder(payload.new);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comenzi' }, payload => {
            if (payload.new && payload.new.status === 'noua') {
                console.log("🔔 [REALTIME UPDATE] Comandă suplimentată primită:", payload.new.id);
                processOrder(payload.new);
            }
        })
        .subscribe((status) => {
            console.log(`📡 Status canal Realtime: ${status}`);
        });
}

/**
 * Pornire Mini-Server HTTP Local (pentru comunicare directă cu receptie.html)
 */
function startLocalHttpServer() {
    const server = http.createServer(async (req, res) => {
        // Activare CORS pentru receptie.html
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

        // 1. Endpoint /status sau /health
        if (url.pathname === '/status' || url.pathname === '/health') {
            const printer = await resolveTargetPrinter(config);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'online',
                service: 'Bella Roma USB Print Service',
                version: '1.0.0',
                printer: printer,
                uptime: process.uptime()
            }));
            return;
        }

        // 2. Endpoint /test-print
        if (url.pathname === '/test-print') {
            const testOrder = {
                id: 999,
                numar_masa: "TEST",
                created_at: new Date().toISOString(),
                ospatar_nume: "Test Service",
                total: 55.00,
                detalii_comanda: [
                    { product: { nume: "Pizza Diavola", pret: 35.00 }, quantity: 1, notes: "Test Print Reusit", customer_name: "Masa" },
                    { product: { nume: "Coca-Cola 0.33L", pret: 10.00 }, quantity: 2, customer_name: "Masa" }
                ]
            };
            const result = await processOrder(testOrder, true);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
            return;
        }

        // 3. Endpoint /print (Recepție trimite comandă manual)
        if (url.pathname === '/print' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    const orderData = JSON.parse(body);
                    const result = await processOrder(orderData, true);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                } catch (err) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: err.message }));
                }
            });
            return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint inexistent' }));
    });

    server.listen(config.http_port, () => {
        console.log(`🌐 Server local HTTP activ pe http://localhost:${config.http_port}`);
    });
}

// 3. Lansare Serviciu
async function startService() {
    console.log("==================================================");
    console.log("🚀 BELLA ROMA - IN-HOUSE USB PRINT SERVICE v1.0");
    console.log("==================================================");

    const targetPrinter = await resolveTargetPrinter(config);
    console.log(`🎯 Imprimantă USB Țintă: "${targetPrinter}"\n`);

    if (process.argv.includes('--test')) {
        console.log("🧪 TESTARE DIRECTĂ A IMPRIMANTEI...");
        const testOrder = {
            id: 101,
            numar_masa: "4",
            created_at: new Date().toISOString(),
            ospatar_nume: "Maria (Test)",
            total: 118.00,
            detalii_comanda: [
                { product: { nume: "Pizza Diavola", pret: 35.00 }, quantity: 2, notes: "Fara ceapa, bine facuta", customer_name: "Masa" },
                { product: { nume: "Coca-Cola 0.33L", pret: 10.00 }, quantity: 1, customer_name: "Masa" },
                { product: { nume: "Paste Carbonara", pret: 38.00 }, quantity: 1, customer_name: "Persoana 1" }
            ]
        };
        const res = await processOrder(testOrder, true);
        if (res.success) {
            console.log("\n🎉 TEST REUȘIT! Bonul a fost trimis către imprimantă.");
        } else {
            console.error("\n❌ EȘEC TEST:", res.error);
        }
        return;
    }

    startLocalHttpServer();
    await syncUnprintedOrders();
    initRealtimeSubscription();

    // Polling de siguranță la fiecare X secunde
    if (config.poll_interval_seconds > 0) {
        setInterval(syncUnprintedOrders, config.poll_interval_seconds * 1000);
    }

    console.log("✨ Serviciul rulează în fundal și ascultă comenzi...");
}

startService().catch(err => {
    console.error("❌ Eroare fatală la pornirea serviciului:", err);
});
