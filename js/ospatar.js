// ==========================================
// OSPATAR.JS — Interfață Dedicată Tablete Ospătari
// ==========================================

let produse = [];
let cart = [];
let selectedMasa = "1";
let currentPerson = "Masa";
let currentTab = 'restaurant';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inițializăm mesele (3 pe latime)
    renderTableChips();

    // 2. Încărcăm meniul din Supabase
    await loadMenuProducts();

    // 3. Setăm event listeners pentru căutare
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderProducts();
        });
    }

    const btnSubmit = document.getElementById('btn-trimite-comanda-ospatar');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', sendWaiterOrder);
    }
});

window.setTab = function (tab) {
    currentTab = tab;
    const tabRestaurant = document.getElementById('tab-restaurant');
    const tabBar = document.getElementById('tab-bar');

    if (tab === 'restaurant') {
        if (tabRestaurant) {
            tabRestaurant.className = 'tab-btn active';
            tabRestaurant.style.background = '#fff';
            tabRestaurant.style.color = '#333';
        }
        if (tabBar) {
            tabBar.className = 'tab-btn';
            tabBar.style.background = 'transparent';
            tabBar.style.color = '#fff';
        }
    } else {
        if (tabBar) {
            tabBar.className = 'tab-btn active';
            tabBar.style.background = '#fff';
            tabBar.style.color = '#333';
        }
        if (tabRestaurant) {
            tabRestaurant.className = 'tab-btn';
            tabRestaurant.style.background = 'transparent';
            tabRestaurant.style.color = '#fff';
        }
    }
    renderProducts();
};

function renderTableChips() {
    const container = document.getElementById('table-chips-grid');
    if (!container) return;

    let html = '';
    // Mesele 1-12 în grid cu 3 coloane pe width
    for (let i = 1; i <= 12; i++) {
        const masaStr = String(i);
        const isActive = (selectedMasa === masaStr);
        const bg = isActive ? '#2ecc71' : 'rgba(255,255,255,0.1)';
        const color = isActive ? '#1e293b' : '#fff';
        const border = isActive ? '2px solid #2ecc71' : '1px solid rgba(255,255,255,0.2)';
        const shadow = isActive ? 'box-shadow: 0 0 12px rgba(46, 204, 113, 0.4);' : '';
        
        html += `
            <button type="button" onclick="window.selectMasa('${masaStr}')"
                style="padding: 14px 10px; border-radius: 12px; border: ${border}; background: ${bg}; color: ${color}; font-weight: bold; font-size: 1rem; cursor: pointer; transition: all 0.2s; ${shadow}">
                <i class="fas fa-utensils"></i> Masa ${i}
            </button>
        `;
    }

    // Buton masă personalizată
    const isCustomActive = isNaN(selectedMasa) || parseInt(selectedMasa) > 12;
    const customBg = isCustomActive ? '#f5b041' : 'rgba(245, 176, 65, 0.15)';
    const customColor = isCustomActive ? '#1e293b' : '#f5b041';
    
    html += `
        <button type="button" onclick="window.customMasaPrompt()"
            style="grid-column: span 3; padding: 14px; border-radius: 12px; border: 1px solid #f5b041; background: ${customBg}; color: ${customColor}; font-weight: bold; font-size: 1rem; cursor: pointer; transition: all 0.2s;">
            <i class="fas fa-edit"></i> ${isCustomActive ? 'Masa Selectată: ' + selectedMasa : '+ Altă Masă (Scrie Numărul)'}
        </button>
    `;
    
    container.innerHTML = html;

    // Actualizăm etichetele cu masa selectată
    const badge = document.getElementById('ospatar-active-table-badge');
    if (badge) badge.innerText = `Masa ${selectedMasa}`;

    const tableDisplay = document.getElementById('cart-table-display');
    if (tableDisplay) tableDisplay.innerText = `Masa ${selectedMasa}`;
}

window.selectMasa = function (masaStr) {
    selectedMasa = masaStr;
    renderTableChips();
};

window.customMasaPrompt = function () {
    const val = prompt("Introduceți numărul sau numele mesei (ex: 15, Terasa 2):", selectedMasa);
    if (val && val.trim() !== '') {
        selectedMasa = val.trim();
        renderTableChips();
    }
};

window.selectPersonChip = function (btnElement, personValue) {
    currentPerson = personValue;

    document.querySelectorAll('.person-chip').forEach(btn => {
        btn.style.background = 'rgba(0,0,0,0.3)';
        btn.style.color = 'white';
        btn.style.border = '1px solid rgba(255,255,255,0.2)';
        btn.style.fontWeight = '500';
    });

    if (btnElement) {
        btnElement.style.background = '#f5b041';
        btnElement.style.color = '#1e293b';
        btnElement.style.border = '1px solid #f5b041';
        btnElement.style.fontWeight = 'bold';
    }
};

async function loadMenuProducts() {
    if (!window.supabaseClient) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('meniu')
            .select('*')
            .order('nume', { ascending: true });

        if (error) {
            console.error("Eroare la încărcare meniu:", error);
            return;
        }

        produse = data || [];
        renderProducts();
    } catch (e) {
        console.error("Eroare DB:", e);
    }
}

function renderProducts() {
    const container = document.getElementById('produse-container');
    if (!container) return;

    container.innerHTML = '';

    if (produse.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; color: #fff;">Meniul se încarcă sau este gol.</p>';
        return;
    }

    let count = 0;

    produse.forEach(p => {
        // Filtrare inteligentă Meniu Bar vs Meniu Restaurant
        const pCat = (p.categorie || '').toLowerCase().trim();
        let isBautura = false;
        if (pCat === 'bar' || pCat === 'bautura' || pCat === 'bauturi') {
            isBautura = true;
        } else if (pCat === 'restaurant' || pCat === 'mancare') {
            isBautura = false;
        } else {
            const nameAndCat = ((p.nume || '') + ' ' + (p.categorie || '')).toLowerCase();
            isBautura = /\b(bautura|bauturi|băutură|băuturi|suc|apa|apă|coca|cola|fanta|sprite|pepsi|cafea|bere|vin|fresh|limonada|cocktail|shot)\b/i.test(nameAndCat);
        }

        if (searchQuery) {
            const matchesSearch = p.nume.toLowerCase().includes(searchQuery) ||
                (p.descriere && p.descriere.toLowerCase().includes(searchQuery));
            if (!matchesSearch) return;
        } else {
            if (currentTab === 'bar' && !isBautura) return;
            if (currentTab === 'restaurant' && isBautura) return;
        }

        const safeName = escapeHTML(p.nume);
        const safeDesc = escapeHTML(p.descriere || '');
        const safePrice = escapeHTML(String(p.pret));
        const safeImage = escapeHTML(p.imagine_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60');

        const div = document.createElement('div');
        div.className = 'product-card glass-panel';
        div.style.padding = '15px';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';

        div.innerHTML = `
            <img src="${safeImage}" alt="${safeName}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 10px; margin-bottom: 12px;">
            <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 5px;">${safeName}</h3>
            <p style="color: #cbd5e1; font-size: 0.85rem; flex: 1; margin-bottom: 10px;">${safeDesc}</p>
            <h4 style="color: #f5b041; font-size: 1.15rem; margin-bottom: 12px;">${safePrice} Lei</h4>
            <button onclick="window.addToCartOspatar(${parseInt(p.id)})"
                style="width: 100%; padding: 12px; background: #3498db; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: background 0.2s;">
                <i class="fas fa-plus"></i> Adaugă (${escapeHTML(currentPerson)})
            </button>
        `;
        container.appendChild(div);
        count++;
    });

    if (count === 0) {
        container.innerHTML = `<p style="text-align:center; width:100%; margin-top: 30px; color: #fff;">Niciun produs găsit în secțiunea <strong>${currentTab === 'bar' ? 'Bar' : 'Restaurant'}</strong>.</p>`;
    }
}

window.addToCartOspatar = function (productId) {
    const product = produse.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.product.id === productId && item.customer_name === currentPerson);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ product, quantity: 1, notes: '', customer_name: currentPerson });
    }

    updateCartUI();
};

window.removeFromCartOspatar = function (index) {
    cart.splice(index, 1);
    updateCartUI();
};

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const btnSubmit = document.getElementById('btn-trimite-comanda-ospatar');

    if (!container) return;

    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = `<p class="empty-cart">Comanda pentru <strong>Masa ${escapeHTML(selectedMasa)}</strong> este goală.</p>`;
        if (btnSubmit) btnSubmit.disabled = true;
        if (totalEl) totalEl.innerText = "0.00";
        return;
    }

    if (btnSubmit) btnSubmit.disabled = false;

    // Grupare pe persoane
    const grouped = {};
    cart.forEach((item, index) => {
        const cName = item.customer_name || "Masa";
        if (!grouped[cName]) grouped[cName] = [];
        grouped[cName].push({ ...item, originalIndex: index });
    });

    for (const [cName, items] of Object.entries(grouped)) {
        const header = document.createElement('div');
        header.style = "color: #f5b041; font-weight: bold; font-size: 0.95rem; margin: 12px 0 6px 0; border-bottom: 1px solid rgba(245, 176, 65, 0.3); padding-bottom: 4px; text-align: left;";
        header.innerHTML = `<i class="fas fa-user"></i> ${escapeHTML(cName === "Masa" ? "👥 Comandă Împreună" : cName)}`;
        container.appendChild(header);

        items.forEach((item) => {
            total += item.product.pret * item.quantity;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.style = "display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.08); padding: 10px 12px; border-radius: 8px; margin-bottom: 6px;";
            div.innerHTML = `
                <div style="flex: 1; text-align: left;">
                    <strong style="color: #fff; font-size: 0.95rem;">${item.quantity}x ${escapeHTML(item.product.nume)}</strong>
                    <div style="color: #f5b041; font-size: 0.85rem; font-weight: bold;">${(item.product.pret * item.quantity).toFixed(2)} Lei</div>
                </div>
                <button onclick="window.removeFromCartOspatar(${item.originalIndex})"
                    style="background: #e74c3c; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(div);
        });
    }

    if (totalEl) totalEl.innerText = total.toFixed(2);
}

async function sendWaiterOrder() {
    if (cart.length === 0) return;

    const btnSubmit = document.getElementById('btn-trimite-comanda-ospatar');
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Se trimite comanda...";
    }

    const total = cart.reduce((sum, item) => sum + (item.product.pret * item.quantity), 0);

    try {
        const orderData = {
            numar_masa: selectedMasa,
            detalii_comanda: cart,
            total: total,
            status: 'noua'
        };

        const { data, error } = await window.supabaseClient
            .from('comenzi')
            .insert([orderData])
            .select();

        if (error) {
            console.error("Eroare la salvare comandă ospătar:", error);
            showNotification("Eroare la trimitere: " + error.message, "fas fa-exclamation-triangle", "#e74c3c");
        } else {
            showNotification(`Comandă trimisă cu succes pentru Masa ${selectedMasa}!`, "fas fa-check-circle", "#2ecc71");
            cart = [];
            updateCartUI();
        }
    } catch (e) {
        console.error("Excepție trimitere comandă:", e);
        showNotification("Eroare de conexiune.", "fas fa-exclamation-triangle", "#e74c3c");
    }

    if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Trimite Comanda la Recepție';
    }
}

function showNotification(msg, icon, color) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const div = document.createElement('div');
    div.style = `background: rgba(15, 23, 42, 0.98); border-left: 4px solid ${color}; color: white; padding: 14px 22px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); font-weight: bold; font-size: 1.05rem; display: flex; align-items: center; gap: 12px; z-index: 99999; animation: fadeIn 0.3s ease;`;
    div.innerHTML = `<i class="${icon}" style="color: ${color}; font-size: 1.4rem;"></i> <span>${escapeHTML(msg)}</span>`;

    container.appendChild(div);
    setTimeout(() => {
        div.style.opacity = '0';
        setTimeout(() => div.remove(), 300);
    }, 4000);
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
