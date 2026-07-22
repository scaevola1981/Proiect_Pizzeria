// ==========================================
// INTEGRARE SUPABASE (STRUCTURĂ)
// ==========================================
/* 
Decomentează și folosește acest cod după ce creezi proiectul în Supabase:
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
*/

// ==========================================
// MOCK REALTIME (PENTRU TESTARE LOCALĂ MVP)
// Pentru a testa, deschide cele 3 fișiere HTML în 3 tab-uri diferite ale aceluiași browser.
// LocalStorage și evenimentul 'storage' simulează perfect Supabase Realtime!
// ==========================================

// --- FUNCȚIE PENTRU INDEX.HTML (Trimite comanda) ---
window.sendOrderToDatabase = async function(masa, cart, total) {
    const order = {
        id: Date.now().toString(),
        numar_masa: masa,
        detalii_comanda: cart,
        total: total,
        status: 'noua',
        created_at: new Date().toISOString(),
        timp_asteptare: null
    };

    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Declanșează actualizarea în celelalte tab-uri
    window.dispatchEvent(new Event('storage'));
    
    return true;
};

// --- LOGICA PENTRU KITCHEN.HTML ---
function renderKitchenOrders() {
    const container = document.getElementById('comenzi-active-container');
    if (!container) return;
    
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    let activeOrders = orders.filter(o => o.status === 'noua' || o.status === 'in_preparare');
    
    if (activeOrders.length === 0) {
        container.innerHTML = '<p>Fără comenzi active momentan.</p>';
        return;
    }
    
    container.innerHTML = '';
    activeOrders.forEach(o => {
        const div = document.createElement('div');
        div.className = 'order-card glass-panel';
        
        let itemsHtml = o.detalii_comanda.map(item => `<li>${item.quantity}x ${item.product.nume}</li>`).join('');
        
        div.innerHTML = `
            <h3>Masa ${o.numar_masa}</h3>
            <ul>${itemsHtml}</ul>
            <p style="margin-top:10px;"><strong>Total:</strong> ${o.total} Lei</p>
            <p><strong>Status:</strong> ${o.status === 'noua' ? 'Nouă' : 'În preparare'}</p>
        `;
        
        const actionDiv = document.createElement('div');
        actionDiv.className = 'order-actions';

        if (o.status === 'noua') {
            const btn = document.createElement('button');
            btn.innerText = 'Acceptă & Setează Timp';
            btn.onclick = () => openAcceptModal(o.id);
            actionDiv.appendChild(btn);
        } else if (o.status === 'in_preparare') {
            const btn = document.createElement('button');
            btn.innerText = 'Marchează ca Finalizată';
            btn.className = 'btn-secondary';
            btn.onclick = () => updateOrderStatus(o.id, 'finalizata');
            actionDiv.appendChild(btn);
        }
        
        div.appendChild(actionDiv);
        container.appendChild(div);
    });
}

// Logica Modal Kitchen
let currentOrderIdToAccept = null;
function openAcceptModal(orderId) {
    currentOrderIdToAccept = orderId;
    document.getElementById('accept-modal').classList.remove('hidden');
}

if (document.getElementById('btn-cancel-accept')) {
    document.getElementById('btn-cancel-accept').addEventListener('click', () => {
        document.getElementById('accept-modal').classList.add('hidden');
    });
}

if (document.getElementById('btn-confirm-accept')) {
    document.getElementById('btn-confirm-accept').addEventListener('click', () => {
        const timeInput = document.getElementById('timp-estimat').value;
        if (currentOrderIdToAccept) {
            updateOrderStatus(currentOrderIdToAccept, 'in_preparare', timeInput);
            document.getElementById('accept-modal').classList.add('hidden');
        }
    });
}

function updateOrderStatus(orderId, newStatus, timpAsteptare = null) {
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    let orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
        orders[orderIndex].status = newStatus;
        if (timpAsteptare !== null) {
            orders[orderIndex].timp_asteptare = timpAsteptare;
        }
        localStorage.setItem('orders', JSON.stringify(orders));
        window.dispatchEvent(new Event('storage'));
        renderKitchenOrders();
        
        // Dacă suntem fix pe pagina de bucătărie și updatăm, apelăm manual renderul Customer, 
        // deși storage event ar trebui să facă asta pentru celelalte tab-uri.
    }
}

// --- LOGICA PENTRU CUSTOMER-DISPLAY.HTML ---
function renderCustomerDisplay() {
    const inPrepContainer = document.getElementById('in-preparare-container');
    const finalizateContainer = document.getElementById('finalizate-container');
    
    if (!inPrepContainer || !finalizateContainer) return;
    
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    let inPrep = orders.filter(o => o.status === 'in_preparare');
    let finalizate = orders.filter(o => o.status === 'finalizata');
    
    inPrepContainer.innerHTML = inPrep.length === 0 ? '<p>Momentan nu sunt comenzi în preparare.</p>' : '';
    inPrep.forEach(o => {
        inPrepContainer.innerHTML += `
            <div class="display-order-card">
                <span>Masa ${o.numar_masa}</span>
                <span class="time-badge">~ ${o.timp_asteptare} min</span>
            </div>
        `;
    });
    
    finalizateContainer.innerHTML = finalizate.length === 0 ? '<p>Momentan nu sunt comenzi gata.</p>' : '';
    finalizate.forEach(o => {
        finalizateContainer.innerHTML += `
            <div class="display-order-card ready">
                <span>Masa ${o.numar_masa}</span>
                <span class="time-badge" style="background:#2ecc71;">Gata de preluare</span>
            </div>
        `;
    });
}

// --- SIMULARE EVENIMENTE REALTIME ---
window.addEventListener('storage', () => {
    if (document.getElementById('comenzi-active-container')) renderKitchenOrders();
    if (document.getElementById('in-preparare-container')) renderCustomerDisplay();
});

// Inițializare la load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('comenzi-active-container')) renderKitchenOrders();
    if (document.getElementById('in-preparare-container')) renderCustomerDisplay();
});
