// ==========================================
// APP.JS — Interfața Client (Doar Meniu Digital)
// ==========================================

let produse = [];
let currentTab = 'restaurant';
let searchQuery = '';

// Funcție sigură pentru ascunderea ecranului de încărcare pe mobil
function hideAppLoader() {
    const appLoader = document.getElementById('app-loading');
    if (appLoader) {
        appLoader.style.opacity = '0';
        setTimeout(() => {
            if (appLoader) appLoader.style.display = 'none';
        }, 300);
    }
}
window.hideAppLoader = hideAppLoader;

if (document.getElementById('produse-container')) {
    setTimeout(hideAppLoader, 400);

    const tabBar = document.getElementById('tab-bar');
    const tabRestaurant = document.getElementById('tab-restaurant');
    const searchInput = document.getElementById('search-input');

    if (tabBar && tabRestaurant) {
        tabBar.addEventListener('click', () => setTab('bar'));
        tabRestaurant.addEventListener('click', () => setTab('restaurant'));
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            renderProducts();
        });
    }

    loadProductsFromSupabase();
}

window.setTab = function (tab) {
    currentTab = tab;
    const tabBar = document.getElementById('tab-bar');
    const tabRestaurant = document.getElementById('tab-restaurant');

    if (tab === 'bar') {
        if (tabBar) {
            tabBar.style.background = '#fff';
            tabBar.style.color = '#333';
        }
        if (tabRestaurant) {
            tabRestaurant.style.background = 'transparent';
            tabRestaurant.style.color = '#fff';
        }
    } else {
        if (tabRestaurant) {
            tabRestaurant.style.background = '#fff';
            tabRestaurant.style.color = '#333';
        }
        if (tabBar) {
            tabBar.style.background = 'transparent';
            tabBar.style.color = '#fff';
        }
    }
    renderProducts();
};

async function loadProductsFromSupabase() {
    const container = document.getElementById('produse-container');
    if (container) container.innerHTML = '<p style="text-align:center; width:100%; color: #fff;">Se încarcă meniul...</p>';

    let attempts = 0;
    while (!window.supabaseClient && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (!window.supabaseClient) {
        if (container) container.innerHTML = '<p style="text-align:center; width:100%; color:red;">Eroare la conexiunea cu baza de date.</p>';
        return;
    }

    try {
        const { data, error } = await window.supabaseClient.from('meniu').select('*');
        if (error) {
            if (container) container.innerHTML = '<p style="text-align:center; width:100%; color:red;">Eroare la preluarea meniului.</p>';
            return;
        }

        produse = data || [];
        renderProducts();
    } catch (err) {
        if (container) container.innerHTML = '<p style="text-align:center; width:100%; color:red;">Eroare neașteptată.</p>';
    }
}

function getDefaultProductImage() {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80';
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function renderProducts() {
    const container = document.getElementById('produse-container');
    const navBar = document.getElementById('subcategory-nav');
    if (!container || !navBar) return;

    container.innerHTML = '';
    navBar.innerHTML = '';
    navBar.classList.add('hidden');

    if (produse.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; color: #fff;">Meniul este momentan gol.</p>';
        return;
    }

    // Filtrare pe tab și search
    let filteredProducts = produse.filter(p => {
        const isBautura = (p.categorie || '').toLowerCase().trim() === 'bar';
        
        if (searchQuery) {
            return p.nume.toLowerCase().includes(searchQuery) || (p.descriere || '').toLowerCase().includes(searchQuery);
        } else {
            return currentTab === 'bar' ? isBautura : !isBautura;
        }
    });

    if (filteredProducts.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; margin-top: 30px; color: #fff;">Niciun produs aici încă. 🤔</p>';
        return;
    }

    // Grupare pe subcategorii
    const knownSubcats = [
        "Pizza", "Focaccia", "Paste", "Antipasti", "Fel Principal", "Desert", "Înghețată",
        "Vin Alb", "Vin Rosé", "Vin Roșu", "Spumante", "Cocktailuri", "Vodcă", "Whisky", "Gin", "Rom", "Tequila", "Brandy / Cognac",
        "Bitter / Lichior", "Cafea", "Răcoritoare", "Apă", "Energizant", "Bere Draft", "Bere", "Special"
    ];

    const grouped = {};
    filteredProducts.forEach(p => {
        let subcat = "Altele";
        let displayDesc = escapeHTML(p.descriere || '');
        
        if (p.descriere && p.descriere.includes('|')) {
            const parts = p.descriere.split('|');
            subcat = parts[0].trim();
            displayDesc = escapeHTML(parts.slice(1).join('|').trim());
        } else if (p.descriere && knownSubcats.some(k => k.toLowerCase() === p.descriere.trim().toLowerCase())) {
            const match = knownSubcats.find(k => k.toLowerCase() === p.descriere.trim().toLowerCase());
            subcat = match || p.descriere.trim();
            displayDesc = '';
        } else if (p.categorie && p.categorie.toLowerCase() !== 'restaurant' && p.categorie.toLowerCase() !== 'bar') {
            subcat = p.categorie.trim();
        }

        if (!grouped[subcat]) grouped[subcat] = [];
        grouped[subcat].push({ ...p, displayDesc });
    });

    // Ordonare logică a subcategoriilor
    const preferredOrder = [
        "Pizza", "Focaccia", "Paste", "Antipasti", "Fel Principal", "Desert", "Înghețată",
        "Vin Alb", "Vin Rosé", "Vin Roșu", "Spumante", "Cocktailuri", "Vodcă", "Whisky", "Gin", "Rom", "Tequila", "Brandy / Cognac",
        "Bitter / Lichior", "Cafea", "Răcoritoare", "Apă", "Energizant", "Bere Draft", "Bere", "Special", "Altele"
    ];

    const sortedSubcats = Object.keys(grouped).sort((a, b) => {
        const indexA = preferredOrder.findIndex(k => k.toLowerCase() === a.toLowerCase());
        const indexB = preferredOrder.findIndex(k => k.toLowerCase() === b.toLowerCase());
        const posA = indexA !== -1 ? indexA : 999;
        const posB = indexB !== -1 ? indexB : 999;
        return posA - posB;
    });

    // Generăm butoanele orizontale doar dacă nu e search
    if (!searchQuery && sortedSubcats.length > 1) {
        navBar.classList.remove('hidden');
        
        sortedSubcats.forEach(cat => {
            const btn = document.createElement('a');
            btn.href = `#cat-${escapeHTML(cat.replace(/\s+/g, '-'))}`;
            btn.className = 'subcategory-btn';
            btn.innerText = cat;
            
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.subcategory-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });

            navBar.appendChild(btn);
        });
        
        if(navBar.firstChild) navBar.firstChild.classList.add('active');
    }

let clientCart = [];
let selectedMasa = '1';

// Citiți masa din URL (ex: meniu.html?masa=5)
const urlParams = new URLSearchParams(window.location.search);
const masaParam = urlParams.get('masa');
if (masaParam && masaParam.trim() !== '') {
    selectedMasa = masaParam.trim();
}

window.changeMasaPrompt = function () {
    const val = prompt("Introduceți numărul mesei la care vă aflați (ex: 1, 5, Terasa 2):", selectedMasa);
    if (val && val.trim() !== '') {
        selectedMasa = val.trim();
        updateMasaDisplay();
        updateCartUI();
    }
};

function updateMasaDisplay() {
    const el = document.getElementById('client-masa-display');
    const modalEl = document.getElementById('cart-modal-masa-text');
    if (el) el.innerText = selectedMasa;
    if (modalEl) modalEl.innerText = `Masa ${selectedMasa}`;
}

window.addToCartClient = function (productId) {
    const prod = produse.find(p => String(p.id) === String(productId));
    if (!prod) return;

    const existingIndex = clientCart.findIndex(item => String(item.product.id) === String(productId));
    if (existingIndex > -1) {
        clientCart[existingIndex].quantity += 1;
    } else {
        clientCart.push({ product: prod, quantity: 1, customer_name: "Client Meniu" });
    }

    showNotification(`🛒 ${escapeHTML(prod.nume)} adăugat în coș!`, "fas fa-check-circle", "#2ecc71");
    updateCartUI();
};

window.removeFromCartClient = function (index) {
    clientCart.splice(index, 1);
    updateCartUI();
};

window.updateQuantityClient = function (index, delta) {
    if (!clientCart[index]) return;
    clientCart[index].quantity += delta;
    if (clientCart[index].quantity <= 0) {
        clientCart.splice(index, 1);
    }
    updateCartUI();
};

window.toggleCartModal = function () {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
        updateCartUI();
    }
};

function updateCartUI() {
    updateMasaDisplay();

    const countBadge = document.getElementById('cart-count-badge');
    const totalBadge = document.getElementById('cart-total-badge');
    const modalContainer = document.getElementById('client-cart-items');
    const modalTotal = document.getElementById('client-cart-total');
    const btnSubmit = document.getElementById('btn-trimite-comanda-client');

    const totalCount = clientCart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = clientCart.reduce((sum, item) => sum + (item.product.pret * item.quantity), 0);

    if (countBadge) countBadge.innerText = String(totalCount);
    if (totalBadge) totalBadge.innerText = `${totalPrice.toFixed(2)} Lei`;
    if (modalTotal) modalTotal.innerText = `${totalPrice.toFixed(2)} Lei`;

    if (!modalContainer) return;

    modalContainer.innerHTML = '';

    if (clientCart.length === 0) {
        modalContainer.innerHTML = `<p style="text-align: center; color: #cbd5e1; padding: 20px 0;">Coșul tău este gol. Alege preparate delicioase din meniu!</p>`;
        if (btnSubmit) btnSubmit.disabled = true;
        updateAllClientProductButtons();
        return;
    }

    if (btnSubmit) btnSubmit.disabled = false;

    clientCart.forEach((item, index) => {
        const itemTotal = (item.product.pret * item.quantity).toFixed(2);
        const div = document.createElement('div');
        div.style = "display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.08); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);";
        div.innerHTML = `
            <div style="flex: 1; text-align: left;">
                <strong style="color: #fff; font-size: 1rem;">${escapeHTML(item.product.nume)}</strong>
                <div style="color: #f5b041; font-weight: bold; font-size: 0.9rem;">${itemTotal} Lei (${escapeHTML(String(item.product.pret))} Lei / buc)</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button onclick="window.updateQuantityClient(${index}, -1)" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold;">-</button>
                <span style="color: #fff; font-weight: bold; font-size: 1rem; width: 20px; text-align: center;">${item.quantity}</span>
                <button onclick="window.updateQuantityClient(${index}, 1)" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold;">+</button>
                <button onclick="window.removeFromCartClient(${index})" style="background: #e74c3c; color: white; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; margin-left: 6px;"><i class="fas fa-trash"></i></button>
            </div>
        `;
        modalContainer.appendChild(div);
    });

    updateAllClientProductButtons();
}

window.sendClientOrder = async function () {
    if (clientCart.length === 0) return;

    const btnSubmit = document.getElementById('btn-trimite-comanda-client');
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se trimite comanda...';
    }

    const total = clientCart.reduce((sum, item) => sum + (item.product.pret * item.quantity), 0);

    try {
        if (typeof window.sendOrderToDatabase === 'function') {
            const result = await window.sendOrderToDatabase(selectedMasa, clientCart, total);
            if (result) {
                showNotification(`🎉 Comanda pentru Masa ${selectedMasa} a fost trimisă cu succes la recepție!`, "fas fa-check-circle", "#2ecc71");
                clientCart = [];
                updateCartUI();
                const modal = document.getElementById('cart-modal');
                if (modal) modal.style.display = 'none';
            } else {
                showNotification("Eroare la trimiterea comenzii. Vă rugăm reîncercați.", "fas fa-exclamation-triangle", "#e74c3c");
            }
        } else {
            showNotification("Conexiunea la baza de date nu este gata.", "fas fa-exclamation-triangle", "#e74c3c");
        }
    } catch (err) {
        console.error("Eroare trimitere comandă client:", err);
        showNotification("Eroare de conexiune.", "fas fa-exclamation-triangle", "#e74c3c");
    }

    if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Trimite Comanda la Recepție';
    }
};

function showNotification(msg, icon = 'fas fa-info-circle', bg = '#3498db') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.style = `background: ${bg}; color: white; padding: 14px 20px; border-radius: 12px; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 10px; font-size: 0.95rem; opacity: 0; transform: translateY(-10px); transition: all 0.3s ease;`;
    toast.innerHTML = `<i class="${icon}" style="font-size: 1.2rem;"></i> <span>${msg}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

    // Randare grupuri de produse
    for (const catName of sortedSubcats) {
        const prods = grouped[catName];
        const sectionId = `cat-${escapeHTML(catName.replace(/\s+/g, '-'))}`;
        
        const section = document.createElement('div');
        section.className = 'category-section';
        section.id = sectionId;

        const sectionTitle = document.createElement('h2');
        sectionTitle.innerText = catName;
        section.appendChild(sectionTitle);

        const grid = document.createElement('div');
        grid.className = 'products-grid';

        prods.forEach(p => {
            const imageUrl = p.imagine_url || getDefaultProductImage();
            const safeName = escapeHTML(p.nume);
            const priceDisplay = `${escapeHTML(String(p.pret))} Lei`;

            const card = document.createElement('div');
            card.className = 'product-card';

            const isDrink = currentTab === 'bar' || (p.categorie && p.categorie.toLowerCase() === 'bar');
            const imgStyle = isDrink ?
                'width: 100%; height: 180px; object-fit: contain; background: #ffffff; border-radius: 12px; padding: 8px; margin-bottom: 15px; box-sizing: border-box;' :
                'width: 100%; height: 160px; object-fit: cover; border-radius: 12px; margin-bottom: 15px;';

            const qtyInCart = clientCart
                .filter(item => String(item.product.id) === String(p.id))
                .reduce((sum, item) => sum + item.quantity, 0);

            let btnBg = 'background: #4284DB; background: -webkit-linear-gradient(to right, #29EAC4, #4284DB); background: linear-gradient(to right, #29EAC4, #4284DB); box-shadow: 0 4px 12px rgba(41, 234, 196, 0.35);';
            let btnContent = `<i class="fas fa-plus"></i> Adaugă în Coș`;

            if (qtyInCart > 0) {
                btnBg = 'background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); box-shadow: 0 4px 15px rgba(46, 204, 113, 0.45); transform: scale(1.02);';
                btnContent = `<i class="fas fa-check-circle"></i> În coș (${qtyInCart})`;
            }

            card.innerHTML = `
                <img src="${escapeHTML(imageUrl)}" alt="${safeName}" style="${imgStyle}">
                <h3>${safeName}</h3>
                <p>${p.displayDesc}</p>
                <h4 style="margin-top: auto; padding-top: 15px; font-size: 1.1rem; color: #f5b041;">${priceDisplay}</h4>
                <button id="client-add-btn-${p.id}" onclick="window.addToCartClient(${parseInt(p.id)})"
                    style="width: 100%; padding: 11px; ${btnBg} color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
                    ${btnContent}
                </button>
            `;

            grid.appendChild(card);
        });

        section.appendChild(grid);
        container.appendChild(section);
    }

    updateCartUI();
}

function updateAllClientProductButtons() {
    produse.forEach(p => {
        const btn = document.getElementById(`client-add-btn-${p.id}`);
        if (!btn) return;

        const qtyInCart = clientCart
            .filter(item => String(item.product.id) === String(p.id))
            .reduce((sum, item) => sum + item.quantity, 0);

        if (qtyInCart > 0) {
            btn.style.background = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
            btn.style.boxShadow = '0 4px 15px rgba(46, 204, 113, 0.45)';
            btn.innerHTML = `<i class="fas fa-check-circle"></i> În coș (${qtyInCart})`;
        } else {
            btn.style.background = 'linear-gradient(to right, #29EAC4, #4284DB)';
            btn.style.boxShadow = '0 4px 12px rgba(41, 234, 196, 0.35)';
            btn.innerHTML = `<i class="fas fa-plus"></i> Adaugă în Coș`;
        }
    });
}
