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

    const tableInput = document.getElementById('input-numar-masa');
    if (tableInput) {
        tableInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                window.confirmTableInput();
            }
        });
    }

    // 5. Suport Tastatură Fizică (0-9, Numpad, Backspace, Enter, Esc) pentru PIN
    document.addEventListener('keydown', (e) => {
        const overlay = document.getElementById('waiter-login-overlay');
        const pinScreen = document.getElementById('waiter-remembered-pin-screen');
        if (!overlay || overlay.style.display === 'none') return;
        if (!pinScreen || pinScreen.style.display === 'none') return;

        if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            window.pressPinKey(e.key);
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            window.clearPinKey();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            window.submitRememberedPin();
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
            e.preventDefault();
            enteredPin = "";
            updatePinDots();
        }
    });
});

// ==========================================
// AUTENTIFICARE OSPĂTAR (PIN PAD & TURĂ)
// ==========================================

async function initWaiterAuth() {
    const active = localStorage.getItem('active_waiter');
    const savedName = localStorage.getItem('saved_waiter_name');

    const overlay = document.getElementById('waiter-login-overlay');
    const firstForm = document.getElementById('waiter-first-login-form');
    const pinScreen = document.getElementById('waiter-remembered-pin-screen');
    const remNameDisplay = document.getElementById('remembered-waiter-name');
    const headerName = document.getElementById('current-waiter-name');

    if (active) {
        try {
            currentWaiter = JSON.parse(active);
            if (overlay) overlay.style.display = 'none';
            if (headerName && currentWaiter.nume) headerName.innerText = currentWaiter.nume;
            return;
        } catch (e) {
            localStorage.removeItem('active_waiter');
        }
    }

    if (overlay) overlay.style.display = 'flex';

    if (savedName) {
        // Dispozitivul știe deja ospătarul -> arată direct ecranul de PIN
        if (firstForm) firstForm.style.display = 'none';
        if (pinScreen) pinScreen.style.display = 'block';
        if (remNameDisplay) remNameDisplay.innerText = savedName;
        enteredPin = "";
        updatePinDots();
    } else {
        // Prima oară pe acest telefon/tabletă -> cere Nume + PIN
        if (firstForm) firstForm.style.display = 'block';
        if (pinScreen) pinScreen.style.display = 'none';
    }

    // Atașăm handler pe formularul inițial
    if (firstForm && !firstForm.dataset.listenerAttached) {
        firstForm.dataset.listenerAttached = "true";
        firstForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('waiter-name-input').value.trim();
            const pin = document.getElementById('waiter-pin-input').value.trim();
            const err = document.getElementById('waiter-login-error');
            if (err) err.style.display = 'none';

            if (!name || pin.length < 4) {
                if (err) {
                    err.innerText = "Completați numele și un PIN de 4 cifre.";
                    err.style.display = 'block';
                }
                return;
            }

            const btn = document.getElementById('btn-start-first-shift');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se autentifică...';
            }

            const res = await window.loginOrCreateWaiterByName(name, pin);

            if (res.success) {
                currentWaiter = res.waiter || { nume: name };
                localStorage.setItem('saved_waiter_name', name);
                localStorage.setItem('active_waiter', JSON.stringify(currentWaiter));

                if (headerName) headerName.innerText = currentWaiter.nume;
                if (overlay) overlay.style.display = 'none';
                showNotification(`Bun venit, ${currentWaiter.nume}! Tură activă.`, 'fas fa-check-circle', '#2ecc71');
            } else {
                if (err) {
                    err.innerText = res.message || "PIN incorect.";
                    err.style.display = 'block';
                }
            }

            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Intră în Tură';
            }
        });
    }
}

window.switchWaiterAccount = function() {
    localStorage.removeItem('saved_waiter_name');
    localStorage.removeItem('saved_waiter_pin');
    localStorage.removeItem('active_waiter');
    currentWaiter = null;
    enteredPin = "";

    const firstForm = document.getElementById('waiter-first-login-form');
    const pinScreen = document.getElementById('waiter-remembered-pin-screen');
    const err = document.getElementById('waiter-login-error');

    if (err) err.style.display = 'none';
    if (firstForm) firstForm.style.display = 'block';
    if (pinScreen) pinScreen.style.display = 'none';

    const nameInput = document.getElementById('waiter-name-input');
    const pinInput = document.getElementById('waiter-pin-input');
    if (nameInput) {
        nameInput.value = '';
        setTimeout(() => nameInput.focus(), 50);
    }
    if (pinInput) pinInput.value = '';
};

window.pressPinKey = function(digit) {
    if (enteredPin.length >= 4) return;
    enteredPin += digit;
    updatePinDots();

    if (enteredPin.length === 4) {
        setTimeout(() => window.submitRememberedPin(), 100);
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

window.submitRememberedPin = async function() {
    const savedName = localStorage.getItem('saved_waiter_name');
    if (!savedName || enteredPin.length < 4) return;

    const err = document.getElementById('waiter-login-error');
    if (err) err.style.display = 'none';

    const result = await window.verifyOspatarPin(savedName, enteredPin);

    if (result.valid) {
        currentWaiter = result.waiter || { nume: savedName };
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
        enteredPin = "";
        
        initWaiterAuth();
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

            // Extragem persoanele care au produse în această comandă
            const personsInOrder = new Set();
            if (Array.isArray(order.detalii_comanda)) {
                order.detalii_comanda.forEach(item => {
                    const cName = item.customer_name || item.person;
                    if (cName && cName !== 'Masa') {
                        personsInOrder.add(cName);
                    }
                });
            }

            keysToSet.forEach(k => {
                if (!activeTableOrdersMap[k]) {
                    activeTableOrdersMap[k] = { count: 0, total: 0, orderIds: [], orderedPersons: new Set() };
                }
                activeTableOrdersMap[k].count += 1;
                activeTableOrdersMap[k].total += parseFloat(order.total || 0);
                activeTableOrdersMap[k].orderIds.push(order.id);
                personsInOrder.forEach(p => activeTableOrdersMap[k].orderedPersons.add(p));
            });
        });

        renderProducts();
        window.updateTableAndPersonUI();
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

// ==========================================
// GESTIUNE MASĂ & PERSOANE ACTIVE
// ==========================================

window.onTableInputChanged = function (val) {
    const clean = String(val || '').trim();
    selectedMasa = clean || "1";
    window.updateTableAndPersonUI();
    renderProducts();
};

window.selectMasa = function (masaStr) {
    selectedMasa = String(masaStr || '1').trim();
    const inp = document.getElementById('input-numar-masa');
    if (inp) inp.value = selectedMasa;
    window.updateTableAndPersonUI();
    renderProducts();
};

window.updateTableAndPersonUI = function () {
    // 1. Sincronizăm inputul dacă nu este în editare
    const inp = document.getElementById('input-numar-masa');
    if (inp && document.activeElement !== inp && inp.value !== selectedMasa) {
        inp.value = selectedMasa;
    }

    const currentClean = String(selectedMasa).replace(/^masa\s*/i, '').trim() || "1";
    const currentOccupied = activeTableOrdersMap[selectedMasa] || activeTableOrdersMap[currentClean];

    // 2. Generăm Pilulele pentru Mese Active / Selectate (Stil Foto 2: Fără cuvântul "OCUPATĂ", fără preț)
    const pillsContainer = document.getElementById('active-tables-pills-container');
    if (pillsContainer) {
        // Obținem toate mesele care au comenzi active în sistem
        const activeTableKeys = Object.keys(activeTableOrdersMap)
            .map(k => String(k).replace(/^masa\s*/i, '').trim())
            .filter(k => k !== '');

        const allVisibleTables = Array.from(new Set([currentClean, ...activeTableKeys]))
            .filter(Boolean)
            .sort((a, b) => {
                const na = parseInt(a), nb = parseInt(b);
                if (!isNaN(na) && !isNaN(nb)) return na - nb;
                return a.localeCompare(b);
            });

        let pillsHtml = '';
        allVisibleTables.forEach(t => {
            const isSelected = (String(t) === currentClean);
            const isOccupied = !!(activeTableOrdersMap[t] || activeTableOrdersMap[`Masa ${t}`]);

            let bg, color, border, shadow;

            if (isOccupied) {
                // Masă cu comenzi active (Portocaliu)
                if (isSelected) {
                    bg = 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)';
                    color = '#ffffff';
                    border = '2px solid #f39c12';
                    shadow = 'box-shadow: 0 0 12px rgba(230, 126, 34, 0.6);';
                } else {
                    bg = 'rgba(230, 126, 34, 0.25)';
                    color = '#f39c12';
                    border = '1px solid #e67e22';
                    shadow = '';
                }
            } else {
                // Masă Liberă (Verde)
                if (isSelected) {
                    bg = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
                    color = '#1e293b';
                    border = '2px solid #27ae60';
                    shadow = 'box-shadow: 0 0 12px rgba(46, 204, 113, 0.5);';
                } else {
                    bg = 'rgba(46, 204, 113, 0.15)';
                    color = '#2ecc71';
                    border = '1px solid rgba(46, 204, 113, 0.4)';
                    shadow = '';
                }
            }

            pillsHtml += `
                <button type="button" class="table-pill-chip" onclick="window.selectMasa('${escapeHTML(t)}')"
                    style="background: ${bg}; color: ${color}; border: ${border}; ${shadow}">
                    <i class="fas fa-utensils"></i> Masa ${escapeHTML(t)}
                </button>
            `;
        });

        pillsContainer.innerHTML = pillsHtml;
    }

    // 3. Calcul Număr Persoane care au comandat la această masă (din DB + Coș curent)
    const dbPersons = currentOccupied && currentOccupied.orderedPersons ? Array.from(currentOccupied.orderedPersons) : [];
    const cartPersons = [...new Set(cart.map(i => i.customer_name).filter(p => p && p !== 'Masa'))];
    
    // Lista unică cu toate persoanele care au comandat
    const allOrderedPersons = [...new Set([...dbPersons, ...cartPersons])];
    const hasMasaInCart = cart.some(i => i.customer_name === 'Masa');

    const personCountText = document.getElementById('table-person-count-text');
    if (personCountText) {
        if (allOrderedPersons.length > 0) {
            const count = allOrderedPersons.length;
            const shortNames = allOrderedPersons.map(p => p.replace(/^Persoana\s*/i, 'P')).join(', ');
            personCountText.innerHTML = `<b>${count} ${count === 1 ? 'Pers. a comandat' : 'Pers. au comandat'}</b> (${shortNames})`;
        } else if (hasMasaInCart) {
            personCountText.innerHTML = `<b>Comandă Împreună</b>`;
        } else {
            personCountText.innerHTML = `0 Pers. au comandat`;
        }
    }

    // 4. Actualizare Butoane Persoane (pastile)
    document.querySelectorAll('.person-chip').forEach(btn => {
        const pName = btn.dataset.person;
        if (!pName) return;

        // Numărăm preparatele adăugate în coș pentru această persoană
        const pQty = cart
            .filter(item => item.customer_name === pName)
            .reduce((sum, item) => sum + item.quantity, 0);

        const isOrderedInDB = dbPersons.includes(pName);
        const isCurrent = (pName === currentPerson);

        let icon = pName === 'Masa' ? '👥' : '👤';
        let shortTitle = pName === 'Masa' ? 'Împreună (Masa)' : pName.replace(/^Persoana\s*/i, 'Pers. ');
        let badgeHtml = '';

        if (pQty > 0) {
            badgeHtml = ` <span style="background: rgba(0,0,0,0.4); color: #fff; padding: 1px 6px; border-radius: 8px; font-size: 0.75rem; margin-left: 3px;">${pQty}</span>`;
        } else if (isOrderedInDB) {
            badgeHtml = ` <span style="font-size: 0.72rem; opacity: 0.85; margin-left: 2px;">✓</span>`;
        }

        btn.innerHTML = `${icon} ${shortTitle}${badgeHtml}`;

        if (isCurrent) {
            btn.style.background = '#f5b041';
            btn.style.color = '#1e293b';
            btn.style.border = '1.5px solid #f5b041';
            btn.style.fontWeight = 'bold';
        } else if (pQty > 0) {
            btn.style.background = 'rgba(46, 204, 113, 0.25)';
            btn.style.color = '#2ecc71';
            btn.style.border = '1px solid #2ecc71';
            btn.style.fontWeight = 'bold';
        } else if (isOrderedInDB) {
            btn.style.background = 'rgba(230, 126, 34, 0.2)';
            btn.style.color = '#f39c12';
            btn.style.border = '1px solid rgba(230, 126, 34, 0.4)';
            btn.style.fontWeight = '600';
        } else {
            btn.style.background = 'rgba(0,0,0,0.35)';
            btn.style.color = 'white';
            btn.style.border = '1px solid rgba(255,255,255,0.2)';
            btn.style.fontWeight = '600';
        }
    });

    const tableDisplay = document.getElementById('cart-table-display');
    if (tableDisplay) tableDisplay.innerText = `Masa ${selectedMasa}`;
};

window.selectPersonChip = function (btnElement, personValue) {
    currentPerson = personValue;
    window.updateTableAndPersonUI();
    renderProducts();
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
    if (typeof window.updateTableAndPersonUI === 'function') {
        window.updateTableAndPersonUI();
    }
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
