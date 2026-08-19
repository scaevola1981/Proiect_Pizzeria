// ==========================================
// OSPATAR.JS — Interfață Dedicată Tablete Ospătari
// Cu Gestionare Status Mese (Liberă / Ocupată) în Realtime
// ==========================================

let produse = [];
let cart = [];
let selectedMasa = "1";
let currentPerson = "Masa";
let currentTab = 'restaurant';
let searchQuery = '';

// Autentificare Ospătar Curent
let currentWaiter = null;
let selectedWaiterForLogin = null;
let enteredPin = "";

// Hartă pentru stocarea meselor ocupate și totalul lor curent
let activeTableOrdersMap = {};

document.addEventListener('DOMContentLoaded', async () => {
    // 0. Verificăm autentificarea ospătarului (Start Tură)
    await initWaiterAuth();

    // 1. Încărcăm meniul din Supabase
    await loadMenuProducts();

    // 2. Încărcăm statusul meselor ocupate
    await loadActiveTableStatus();

    // 3. Inițializăm ascultarea în timp real (Realtime) pentru actualizare instant pe tablete
    subscribeToRealtimeTableStatus();

    // 4. Setăm event listeners pentru căutare
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

// ==========================================
// AUTENTIFICARE OSPĂTAR (PIN PAD & TURĂ)
// ==========================================

async function initWaiterAuth() {
    const saved = localStorage.getItem('active_waiter');
    if (saved) {
        try {
            currentWaiter = JSON.parse(saved);
            const overlay = document.getElementById('waiter-login-overlay');
            if (overlay) overlay.style.display = 'none';
            const nameEl = document.getElementById('current-waiter-name');
            if (nameEl && currentWaiter.nume) nameEl.innerText = currentWaiter.nume;
            return;
        } catch (e) {
            localStorage.removeItem('active_waiter');
        }
    }

    // Nu e logat -> afișăm overlay-ul de login
    const overlay = document.getElementById('waiter-login-overlay');
    if (overlay) overlay.style.display = 'flex';
    await loadWaitersForLogin();
}

async function loadWaitersForLogin() {
    const container = document.getElementById('waiter-list-container');
    if (!container) return;

    container.innerHTML = '<p style="color: #94a3b8;"><i class="fas fa-spinner fa-spin"></i> Se încarcă echipa...</p>';

    // Așteptăm ca funcțiile Supabase să fie disponibile
    let attempts = 0;
    while (typeof window.getOspatariList !== 'function' && attempts < 20) {
        await new Promise(r => setTimeout(r, 150));
        attempts++;
    }

    const list = typeof window.getOspatariList === 'function' ? await window.getOspatariList() : [];

    if (list.length === 0) {
        container.innerHTML = '<p style="color: #e74c3c;">Niciun ospătar activ găsit. Contactați administratorul.</p>';
        return;
    }

    container.innerHTML = '';
    list.forEach(w => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.style = 'background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.25); color: #fff; padding: 14px 18px; border-radius: 12px; font-weight: bold; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s;';
        btn.innerHTML = `<span><i class="fas fa-user-tie" style="color: #f5b041; margin-right: 10px;"></i> ${escapeHTML(w.nume)}</span> <i class="fas fa-chevron-right" style="color: #94a3b8; font-size: 0.9rem;"></i>`;
        
        btn.onclick = () => window.selectWaiterForPin(w);
        container.appendChild(btn);
    });
}

window.selectWaiterForPin = function(waiter) {
    selectedWaiterForLogin = waiter;
    enteredPin = "";
    updatePinDots();

    const err = document.getElementById('waiter-login-error');
    if (err) err.style.display = 'none';

    document.getElementById('waiter-step-select').style.display = 'none';
    document.getElementById('waiter-step-pin').style.display = 'block';
    
    const display = document.getElementById('selected-waiter-name-display');
    if (display) display.innerText = waiter.nume;
};

window.backToWaiterSelect = function() {
    selectedWaiterForLogin = null;
    enteredPin = "";
    updatePinDots();

    const err = document.getElementById('waiter-login-error');
    if (err) err.style.display = 'none';

    document.getElementById('waiter-step-pin').style.display = 'none';
    document.getElementById('waiter-step-select').style.display = 'block';
};

window.pressPinKey = function(digit) {
    if (enteredPin.length >= 4) return;
    enteredPin += digit;
    updatePinDots();

    if (enteredPin.length === 4) {
        setTimeout(() => window.submitWaiterPin(), 100);
    }
};

window.clearPinKey = function() {
    enteredPin = enteredPin.slice(0, -1);
    updatePinDots();
};

function updatePinDots() {
    for (let i = 0; i < 4; i++) {
        const dot = document.getElementById(`dot-${i}`);
        if (dot) {
            if (i < enteredPin.length) {
                dot.style.background = '#f5b041';
                dot.style.transform = 'scale(1.25)';
            } else {
                dot.style.background = 'transparent';
                dot.style.transform = 'scale(1)';
            }
        }
    }
}

window.submitWaiterPin = async function() {
    if (!selectedWaiterForLogin || enteredPin.length < 4) return;

    const err = document.getElementById('waiter-login-error');
    if (err) err.style.display = 'none';

    const result = await window.verifyOspatarPin(selectedWaiterForLogin.id, enteredPin);

    if (result.valid) {
        currentWaiter = result.waiter;
        localStorage.setItem('active_waiter', JSON.stringify(currentWaiter));
        
        const nameEl = document.getElementById('current-waiter-name');
        if (nameEl) nameEl.innerText = currentWaiter.nume;

        const overlay = document.getElementById('waiter-login-overlay');
        if (overlay) overlay.style.display = 'none';

        showNotification(`Bun venit, ${currentWaiter.nume}! Tură activă.`, 'fas fa-check-circle', '#2ecc71');
    } else {
        if (err) {
            err.innerText = result.message || 'PIN incorect.';
            err.style.display = 'block';
        }
        enteredPin = "";
        updatePinDots();
    }
};

window.logoutWaiter = function() {
    if (confirm("Doriți să ieșiți din tura de ospătar?")) {
        localStorage.removeItem('active_waiter');
        currentWaiter = null;
        selectedWaiterForLogin = null;
        enteredPin = "";
        
        window.backToWaiterSelect();
        const overlay = document.getElementById('waiter-login-overlay');
        if (overlay) overlay.style.display = 'flex';
        loadWaitersForLogin();
    }
};

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

async function loadActiveTableStatus() {
    // Așteptăm să avem clientul Supabase disponibil
    let attempts = 0;
    while (!window.supabaseClient && attempts < 30) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    if (!window.supabaseClient) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('comenzi')
            .select('*')
            .neq('status', 'finalizata');

        if (error) {
            console.error("Eroare la preluarea statusului meselor:", error);
            return;
        }

        activeTableOrdersMap = {};

        (data || []).forEach(order => {
            if (order.status === 'finalizata') return;

            const rawMasa = String(order.numar_masa || '').trim();
            if (!rawMasa) return;

            // Normalizăm "Masa 1" -> "1" pentru căutare exactă
            const cleanMasa = rawMasa.replace(/^masa\s*/i, '').trim();
            const keysToSet = [cleanMasa, rawMasa];

            keysToSet.forEach(k => {
                if (!activeTableOrdersMap[k]) {
                    activeTableOrdersMap[k] = { count: 0, total: 0, orderIds: [] };
                }
                activeTableOrdersMap[k].count += 1;
                activeTableOrdersMap[k].total += parseFloat(order.total || 0);
                activeTableOrdersMap[k].orderIds.push(order.id);
            });
        });

        renderTableChips();
    } catch (e) {
        console.error("Excepție verificare mese ocupate:", e);
    }
}

function subscribeToRealtimeTableStatus() {
    if (!window.supabaseClient) return;

    try {
        window.supabaseClient
            .channel('ospatar_table_status')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comenzi' }, () => {
                loadActiveTableStatus();
            })
            .subscribe();
    } catch (e) {
        console.log("Realtime subscription error:", e);
    }
}

function renderTableChips() {
    const container = document.getElementById('table-chips-grid');
    if (!container) return;

    let html = '';
    // Mesele 1-12 în grid cu 3 coloane pe width
    for (let i = 1; i <= 12; i++) {
        const masaStr = String(i);
        const isActive = (selectedMasa === masaStr);
        const occupiedInfo = activeTableOrdersMap[masaStr];
        const isOccupied = !!occupiedInfo;

        let bg, color, border, shadow, statusText;

        if (isOccupied) {
            // Masă Ocupată
            bg = isActive ? '#e67e22' : 'rgba(230, 126, 34, 0.25)';
            color = isActive ? '#ffffff' : '#f39c12';
            border = isActive ? '2px solid #e67e22' : '1px solid #e67e22';
            shadow = isActive ? 'box-shadow: 0 0 15px rgba(230, 126, 34, 0.6);' : '';
            statusText = `<br><small style="font-weight: 800; font-size: 0.8rem; color: ${isActive ? '#fff' : '#f5b041'};">🔴 Ocupată (${occupiedInfo.total.toFixed(0)} L)</small>`;
        } else {
            // Masă Liberă
            bg = isActive ? '#2ecc71' : 'rgba(46, 204, 113, 0.15)';
            color = isActive ? '#1e293b' : '#2ecc71';
            border = isActive ? '2px solid #2ecc71' : '1px solid rgba(46, 204, 113, 0.4)';
            shadow = isActive ? 'box-shadow: 0 0 12px rgba(46, 204, 113, 0.4);' : '';
            statusText = `<br><small style="font-size: 0.78rem; opacity: 0.9;">🟢 Liberă</small>`;
        }

        html += `
            <button type="button" onclick="window.selectMasa('${masaStr}')"
                style="padding: 12px 6px; border-radius: 12px; border: ${border}; background: ${bg}; color: ${color}; font-weight: bold; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; ${shadow} text-align: center;">
                <i class="fas fa-utensils"></i> Masa ${i}${statusText}
            </button>
        `;
    }

    // Buton masă personalizată
    const isCustomActive = isNaN(selectedMasa) || parseInt(selectedMasa) > 12;
    const customOccupied = activeTableOrdersMap[selectedMasa];
    const customBg = isCustomActive ? '#f5b041' : 'rgba(245, 176, 65, 0.15)';
    const customColor = isCustomActive ? '#1e293b' : '#f5b041';

    html += `
        <button type="button" onclick="window.customMasaPrompt()"
            style="grid-column: span 3; padding: 14px; border-radius: 12px; border: 1px solid #f5b041; background: ${customBg}; color: ${customColor}; font-weight: bold; font-size: 1rem; cursor: pointer; transition: all 0.2s; text-align: center;">
            <i class="fas fa-edit"></i> ${isCustomActive ? 'Masa Selectată: ' + selectedMasa + (customOccupied ? ` (🔴 Ocupată ${customOccupied.total.toFixed(0)} Lei)` : ' (🟢 Liberă)') : '+ Altă Masă (Scrie Numărul)'}
        </button>
    `;

    container.innerHTML = html;

    // Actualizăm etichetele și butonul de eliberare a mesei
    const currentOccupied = activeTableOrdersMap[selectedMasa];
    const badge = document.getElementById('ospatar-active-table-badge');
    const freeBtnContainer = document.getElementById('ospatar-free-table-btn-container');

    if (badge) {
        if (currentOccupied) {
            badge.style.background = '#e67e22';
            badge.style.color = '#fff';
            badge.style.boxShadow = '0 0 15px rgba(230, 126, 34, 0.5)';
            badge.innerHTML = `🔴 Masa ${escapeHTML(selectedMasa)} (Ocupată - ${currentOccupied.total.toFixed(2)} Lei)`;
        } else {
            badge.style.background = '#2ecc71';
            badge.style.color = '#1e293b';
            badge.style.boxShadow = '0 0 15px rgba(46, 204, 113, 0.4)';
            badge.innerHTML = `🟢 Masa ${escapeHTML(selectedMasa)} (Liberă)`;
        }
    }

    if (freeBtnContainer) {
        if (currentOccupied) {
            freeBtnContainer.innerHTML = `
                <button type="button" onclick="window.freeActiveTable('${escapeHTML(selectedMasa)}')"
                    style="background: #e74c3c; color: white; border: none; padding: 7px 16px; border-radius: 14px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);">
                    <i class="fas fa-broom"></i> Eliberează Masa ${escapeHTML(selectedMasa)}
                </button>
            `;
        } else {
            freeBtnContainer.innerHTML = '';
        }
    }

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

window.freeActiveTable = async function (masaStr) {
    if (!confirm(`Sunteți sigur că Masa ${masaStr} a fost eliberată și clienții au plecat?\nMasa va deveni LIBERĂ.`)) {
        return;
    }

    if (!window.supabaseClient) return;

    try {
        const targetClean = String(masaStr).replace(/[^0-9a-zA-Z]/g, '').replace(/^masa/i, '').trim();

        // Găsim toate comenzile nefinalizate pentru această masă
        const { data: activeOrders } = await window.supabaseClient
            .from('comenzi')
            .select('id, numar_masa')
            .neq('status', 'finalizata');

        if (activeOrders && activeOrders.length > 0) {
            const idsToFree = activeOrders.filter(o => {
                const oMasaClean = String(o.numar_masa || '').replace(/[^0-9a-zA-Z]/g, '').replace(/^masa/i, '').trim();
                return oMasaClean === targetClean || String(o.numar_masa) === String(masaStr);
            }).map(o => o.id);

            if (idsToFree.length > 0) {
                const { error } = await window.supabaseClient
                    .from('comenzi')
                    .update({ status: 'finalizata' })
                    .in('id', idsToFree);

                if (error) {
                    console.error("Eroare la eliberarea mesei:", error);
                    showNotification("Eroare la eliberarea mesei: " + error.message, "fas fa-exclamation-triangle", "#e74c3c");
                    return;
                }
            }
        }

        // Ștergem din harta locală imediat
        delete activeTableOrdersMap[masaStr];
        delete activeTableOrdersMap[targetClean];

        showNotification(`🧹 Masa ${masaStr} a fost eliberată cu succes!`, "fas fa-check-circle", "#2ecc71");
        await loadActiveTableStatus();
    } catch (e) {
        console.error("Excepție eliberare masă:", e);
        showNotification("Eroare de rețea.", "fas fa-exclamation-triangle", "#e74c3c");
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
    const navBar = document.getElementById('subcategory-nav');
    if (!container) return;

    container.innerHTML = '';
    if (navBar) {
        navBar.innerHTML = '';
        navBar.classList.add('hidden');
    }

    if (produse.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; color: #fff;">Meniul se încarcă sau este gol.</p>';
        return;
    }

    // 1. Filtrare produse
    let filteredProducts = produse.filter(p => {
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
            return p.nume.toLowerCase().includes(searchQuery) ||
                (p.descriere && p.descriere.toLowerCase().includes(searchQuery));
        } else {
            return currentTab === 'bar' ? isBautura : !isBautura;
        }
    });

    if (filteredProducts.length === 0) {
        container.innerHTML = `<p style="text-align:center; width:100%; margin-top: 30px; color: #fff;">Niciun produs găsit în secțiunea <strong>${currentTab === 'bar' ? 'Bar' : 'Restaurant'}</strong>.</p>`;
        return;
    }

    // 2. Grupare pe subcategorii
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

    // 3. Generare Navigatie Orizontală Subcategorii (doar dacă nu este căutare activă)
    if (navBar && !searchQuery && sortedSubcats.length > 1) {
        navBar.classList.remove('hidden');

        sortedSubcats.forEach(cat => {
            const btn = document.createElement('a');
            btn.href = `#ospatar-cat-${escapeHTML(cat.replace(/\s+/g, '-'))}`;
            btn.className = 'subcategory-btn';
            btn.innerText = cat;

            btn.addEventListener('click', (e) => {
                navBar.querySelectorAll('.subcategory-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });

            navBar.appendChild(btn);
        });

        if (navBar.firstChild) navBar.firstChild.classList.add('active');
    }

    // 4. Randare pe sectiuni de categorii
    for (const catName of sortedSubcats) {
        const prods = grouped[catName];
        const sectionId = `ospatar-cat-${escapeHTML(catName.replace(/\s+/g, '-'))}`;

        const section = document.createElement('div');
        section.className = 'category-section';
        section.id = sectionId;

        const sectionTitle = document.createElement('h2');
        sectionTitle.style.color = '#f5b041';
        sectionTitle.style.borderBottom = '1px solid rgba(245,176,65,0.3)';
        sectionTitle.style.paddingBottom = '5px';
        sectionTitle.style.marginBottom = '15px';
        sectionTitle.innerText = catName;
        section.appendChild(sectionTitle);

        const grid = document.createElement('div');
        grid.className = 'products-grid';

        prods.forEach(p => {
            const safeName = escapeHTML(p.nume);
            const safePrice = escapeHTML(String(p.pret));
            const safeImage = escapeHTML(p.imagine_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60');

            const isDrink = currentTab === 'bar' || (p.categorie && p.categorie.toLowerCase() === 'bar');
            const imgStyle = isDrink ?
                'width: 100%; height: 160px; object-fit: contain; background: #ffffff; border-radius: 10px; padding: 6px; margin-bottom: 12px; box-sizing: border-box;' :
                'width: 100%; height: 140px; object-fit: cover; border-radius: 10px; margin-bottom: 12px;';

            const div = document.createElement('div');
            div.className = 'product-card glass-panel';
            div.style.padding = '15px';
            div.style.display = 'flex';
            div.style.flexDirection = 'column';

            const qtyInCart = cart
                .filter(item => String(item.product.id) === String(p.id))
                .reduce((sum, item) => sum + item.quantity, 0);

            let btnBg = 'background: #4284DB; background: -webkit-linear-gradient(to right, #29EAC4, #4284DB); background: linear-gradient(to right, #29EAC4, #4284DB); box-shadow: 0 4px 12px rgba(41, 234, 196, 0.35);';
            let btnContent = `<i class="fas fa-plus"></i> Adaugă (${escapeHTML(currentPerson)})`;

            if (qtyInCart > 0) {
                btnBg = 'background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); box-shadow: 0 4px 15px rgba(46, 204, 113, 0.45); transform: scale(1.02);';
                btnContent = `<i class="fas fa-check-circle"></i> Adăugat (${qtyInCart}) — ${escapeHTML(currentPerson)}`;
            }

            div.innerHTML = `
                <img src="${safeImage}" alt="${safeName}" style="${imgStyle}">
                <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 5px;">${safeName}</h3>
                <p style="color: #cbd5e1; font-size: 0.85rem; flex: 1; margin-bottom: 10px;">${p.displayDesc || '-'}</p>
                <h4 style="color: #f5b041; font-size: 1.15rem; margin-bottom: 12px;">${safePrice} Lei</h4>
                <button id="add-btn-${p.id}" onclick="window.addToCartOspatar(${parseInt(p.id)})"
                    style="width: 100%; padding: 12px; ${btnBg} color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.95rem; transition: all 0.2s;">
                    ${btnContent}
                </button>
            `;
            grid.appendChild(div);
        });

        section.appendChild(grid);
        container.appendChild(section);
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

    showNotification(`🛒 ${escapeHTML(product.nume)} adăugat pentru ${escapeHTML(currentPerson)}!`, "fas fa-check-circle", "#2ecc71");
    updateCartUI();
};

window.removeFromCartOspatar = function (index) {
    cart.splice(index, 1);
    updateCartUI();
};

window.openCartModal = function () {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'flex';
        updateCartUI();
    }
};

window.closeCartModal = function () {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Închidere modal la click pe fundal
document.addEventListener('click', (e) => {
    const modal = document.getElementById('cart-modal');
    if (modal && e.target === modal) {
        window.closeCartModal();
    }
});

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const btnSubmit = document.getElementById('btn-trimite-comanda-ospatar');

    // Elemente Quick Floating Bar
    const quickMasa = document.getElementById('quick-bar-masa');
    const quickCount = document.getElementById('quick-bar-count');
    const quickTotal = document.getElementById('quick-bar-total');
    const quickBtnSubmit = document.getElementById('quick-btn-trimite');

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + (item.product.pret * item.quantity), 0);

    if (quickMasa) quickMasa.innerText = selectedMasa;
    if (quickCount) quickCount.innerText = String(totalCount);
    if (quickTotal) quickTotal.innerText = total.toFixed(2);

    if (cart.length === 0) {
        if (container) container.innerHTML = `<p class="empty-cart">Comanda pentru <strong>Masa ${escapeHTML(selectedMasa)}</strong> este goală.</p>`;
        if (btnSubmit) btnSubmit.disabled = true;
        if (quickBtnSubmit) quickBtnSubmit.disabled = true;
        if (totalEl) totalEl.innerText = "0.00";
        updateAllProductButtons();
        return;
    }

    if (btnSubmit) btnSubmit.disabled = false;
    if (quickBtnSubmit) quickBtnSubmit.disabled = false;

    if (container) {
        container.innerHTML = '';
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
    }

    if (totalEl) totalEl.innerText = total.toFixed(2);
    updateAllProductButtons();
}

function updateAllProductButtons() {
    produse.forEach(p => {
        const btn = document.getElementById(`add-btn-${p.id}`);
        if (!btn) return;

        const qtyInCart = cart
            .filter(item => String(item.product.id) === String(p.id))
            .reduce((sum, item) => sum + item.quantity, 0);

        if (qtyInCart > 0) {
            btn.style.background = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
            btn.style.boxShadow = '0 4px 15px rgba(46, 204, 113, 0.45)';
            btn.innerHTML = `<i class="fas fa-check-circle"></i> Adăugat (${qtyInCart}) — ${escapeHTML(currentPerson)}`;
        } else {
            btn.style.background = 'linear-gradient(to right, #29EAC4, #4284DB)';
            btn.style.boxShadow = '0 4px 12px rgba(41, 234, 196, 0.35)';
            btn.innerHTML = `<i class="fas fa-plus"></i> Adaugă (${escapeHTML(currentPerson)})`;
        }
    });
}

window.sendWaiterOrder = async function () {
    if (cart.length === 0) return;

    const btnSubmit = document.getElementById('btn-trimite-comanda-ospatar');
    const quickBtnSubmit = document.getElementById('quick-btn-trimite');

    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se trimite comanda...';
    }
    if (quickBtnSubmit) {
        quickBtnSubmit.disabled = true;
        quickBtnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se trimite...';
    }

    const total = cart.reduce((sum, item) => sum + (item.product.pret * item.quantity), 0);

    try {
        if (typeof window.sendOrderToDatabase === 'function') {
            const waiterName = currentWaiter ? currentWaiter.nume : null;
            const placedOrder = await window.sendOrderToDatabase(selectedMasa, cart, total, null, null, waiterName);
            if (placedOrder) {
                showNotification(`Comandă trimisă de ${waiterName || 'Ospătar'} pentru Masa ${selectedMasa}!`, "fas fa-check-circle", "#2ecc71");
                cart = [];
                window.closeCartModal();
                updateCartUI();
                await loadActiveTableStatus();
            } else {
                showNotification("Eroare la salvare comandă.", "fas fa-exclamation-triangle", "#e74c3c");
            }
        } else {
            console.error("sendOrderToDatabase nu este definită.");
            showNotification("Eroare de configurare.", "fas fa-exclamation-triangle", "#e74c3c");
        }
    } catch (e) {
        console.error("Excepție trimitere comandă:", e);
        showNotification("Eroare de conexiune.", "fas fa-exclamation-triangle", "#e74c3c");
    }

    if (btnSubmit) {
        btnSubmit.disabled = cart.length === 0;
        btnSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Trimite Comanda la Recepție';
    }
    if (quickBtnSubmit) {
        quickBtnSubmit.disabled = cart.length === 0;
        quickBtnSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Trimite la Recepție';
    }
};

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
