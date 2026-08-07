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
    // 1. Inițializăm mesele 1-12
    renderTableChips();

    // 2. Încărcăm meniul din Supabase
    await loadMenuProducts();

    // 3. Setăm event listeners
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
    for (let i = 1; i <= 12; i++) {
        const masaStr = String(i);
        const isActive = selectedMasa === masaStr;
        const bg = isActive ? '#2ecc71' : 'rgba(255,255,255,0.1)';
        const color = isActive ? '#1e293b' : '#fff';
        const border = isActive ? '1px solid #2ecc71' : '1px solid rgba(255,255,255,0.2)';
        
        html += `
            <button type="button" onclick="window.selectMasa('${masaStr}')"
                style="padding: 10px 16px; border-radius: 12px; border: ${border}; background: ${bg}; color: ${color}; font-weight: bold; font-size: 0.95rem; cursor: pointer; transition: all 0.2s;">
                Masa ${i}
            </button>
        `;
    }
    html += `
        <button type="button" onclick="window.customMasaPrompt()"
            style="padding: 10px 16px; border-radius: 12px; border: 1px solid #f5b041; background: rgba(245, 176, 65, 0.2); color: #f5b041; font-weight: bold; font-size: 0.95rem; cursor: pointer;">
            + Altă Masă
        </button>
    `;
    container.innerHTML = html;

    const badge = document.getElementById('ospatar-active-table-badge');
    if (badge) badge.innerText = `Masa ${selectedMasa}`;
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

    const filtered = produse.filter(p => {
        const matchesCategory = (currentTab === 'bar')
            ? (p.categorie && p.categorie.toLowerCase() === 'bar')
            : (!p.categorie || p.categorie.toLowerCase() !== 'bar');

        const matchesSearch = !searchQuery ||
            p.nume.toLowerCase().includes(searchQuery) ||
            (p.descriere && p.descriere.toLowerCase().includes(searchQuery));

        return matchesCategory && matchesSearch;
    });

    let count = 0;
    filtered.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-card glass-panel';
        div.style.padding = '15px';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';

        const safeName = escapeHTML(p.nume);
        const safeDesc = escapeHTML(p.descriere || '');
        const safePrice = escapeHTML(String(p.pret));
        const safeImage = escapeHTML(p.imagine_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60');

        div.innerHTML = `
            <img src="${safeImage}" alt="${safeName}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 10px; margin-bottom: 12px;">
            <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 5px;">${safeName}</h3>
            <p style="color: #cbd5e1; font-size: 0.85rem; flex: 1; margin-bottom: 10px;">${safeDesc}</p>
            <h4 style="color: #f5b041; font-size: 1.1rem; margin-bottom: 12px;">${safePrice} Lei</h4>
            <button onclick="window.addToCartOspatar(${parseInt(p.id)})"
                style="width: 100%; padding: 10px; background: #3498db; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.95rem;">
                <i class="fas fa-plus"></i> Adaugă
            </button>
        `;
        container.appendChild(div);
        count++;
    });

    if (count === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; margin-top: 30px; color: #fff;">Niciun produs găsit.</p>';
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
        container.innerHTML = '<p class="empty-cart">Alegeți preparatele pentru masa selectată.</p>';
        if (btnSubmit) btnSubmit.disabled = true;
        if (totalEl) totalEl.innerText = "0.00";
        return;
    }

    if (btnSubmit) btnSubmit.disabled = false;

    // Group by customer_name
    const grouped = {};
    cart.forEach((item, index) => {
        const cName = item.customer_name || "Masa";
        if (!grouped[cName]) grouped[cName] = [];
        grouped[cName].push({ ...item, originalIndex: index });
    });

    for (const [cName, items] of Object.entries(grouped)) {
        if (cName !== "Masa") {
            const header = document.createElement('div');
            header.style = "color: #f5b041; font-weight: bold; font-size: 0.9rem; margin: 10px 0 5px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;";
            header.innerText = cName;
            container.appendChild(header);
        }

        items.forEach((item) => {
            total += item.product.pret * item.quantity;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.style = "display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; margin-bottom: 6px;";
            div.innerHTML = `
                <div style="flex: 1; text-align: left;">
                    <strong style="color: #fff;">${item.quantity}x ${escapeHTML(item.product.nume)}</strong>
                    <div style="color: #f5b041; font-size: 0.85rem;">${(item.product.pret * item.quantity).toFixed(2)} Lei</div>
                </div>
                <button onclick="window.removeFromCartOspatar(${item.originalIndex})"
                    style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">
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
        btnSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Trimite la Recepție';
    }
}

function showNotification(msg, icon, color) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const div = document.createElement('div');
    div.style = `background: rgba(15, 23, 42, 0.95); border-left: 4px solid ${color}; color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); font-weight: bold; display: flex; align-items: center; gap: 10px; z-index: 99999; animation: fadeIn 0.3s ease;`;
    div.innerHTML = `<i class="${icon}" style="color: ${color}; font-size: 1.2rem;"></i> <span>${escapeHTML(msg)}</span>`;

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
