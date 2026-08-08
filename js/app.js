// ==========================================
// APP.JS — Interfața Client (Meniu + Comandă)
// Cu Geofencing + XSS Protection + Selecție Persoană
// ==========================================

let produse = [];
let cart = [];
let numarMasa = null;

let currentTab = 'restaurant';
let searchQuery = '';
let currentPersonClient = "Masa";

// Preluare număr masă din URL (ex: ?masa=5)
function getTableNumber() {
    const params = new URLSearchParams(window.location.search);
    let masa = params.get('masa');
    if (masa) {
        // Validăm că e un număr valid
        masa = String(masa).replace(/[^0-9a-zA-Z]/g, '').substring(0, 10);
        return masa;
    }
    return null;
}

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

// Inițializare pagină meniu.html
if (document.getElementById('produse-container')) {
    
    // Ascundem loader-ul automat pe mobil după 400ms (evită ecran blocat pe mobil)
    setTimeout(hideAppLoader, 400);

    numarMasa = getTableNumber();
    if (numarMasa) {
        const masaEl = document.getElementById('masa-id');
        if (masaEl) masaEl.innerText = escapeHTML(numarMasa);
    } else {
        const masaEl = document.getElementById('masa-id');
        if (masaEl) masaEl.innerText = "Necunoscută";
        setTimeout(() => {
            const qrModal = document.getElementById('qr-error-modal');
            if (qrModal) qrModal.classList.remove('hidden');
        }, 800);
    }

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

    // Ascultăm mesajele PUSH din Service Worker pentru a afișa modalul vizual în aplicație
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'PUSH_ORDER_STATUS') {
                const status = event.data.status;
                const message = event.data.body || event.data.title || "Comanda dumneavoastră a fost actualizată!";
                let iconClass = "fas fa-bell";
                let color = "#2ecc71";

                if (status === 'in_preparare') {
                    iconClass = "fas fa-fire";
                    color = "#f39c12";
                } else if (status === 'servita') {
                    iconClass = "fas fa-check-circle";
                    color = "#2ecc71";
                }

                showOrderStatusNotification(message, iconClass, color);
            }
        });
    }

    // Logică buton Instalare Aplicație (PWA) adaptată pentru iOS și Android (Google Chrome)
    const clientInstallBtn = document.getElementById('client-install-app-btn');

    // Verificăm dacă aplicația rulează deja ca PWA (Standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone && clientInstallBtn) {
        clientInstallBtn.style.display = 'none'; // Ascundem butonul dacă aplicația este deja instalată
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPromptClient = e;
        if (clientInstallBtn && !isStandalone) {
            clientInstallBtn.style.display = 'inline-flex';
        }
    });

    window.requestCameraPermissionAndSetup = async function() {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                console.log("Permisiune cameră obținută cu succes.");
            }
        } catch (err) {
            console.warn("Utilizatorul a refuzat permisiunea pentru cameră:", err);
        }
    };

    window.openPwaInstallModal = async function () {
        if (typeof window.requestNotificationPermissionAndSetup === 'function') {
            window.requestNotificationPermissionAndSetup();
        }
        await window.requestCameraPermissionAndSetup();

        if (window.deferredPromptClient) {
            window.deferredPromptClient.prompt();
            const { outcome } = await window.deferredPromptClient.userChoice;
            console.log("Status instalare Chrome:", outcome);
            window.deferredPromptClient = null;
        } else {
            const modal = document.getElementById('pwa-install-modal');
            if (modal) {
                modal.classList.remove('hidden');
            }
        }
    };

    if (clientInstallBtn) {
        clientInstallBtn.addEventListener('click', window.openPwaInstallModal);
    }
}

// Funcție globală pentru activare permisiuni Notificări ("Allow") și Sunete
window.requestNotificationPermissionAndSetup = async function () {
    try {
        if (!window.audioCtx) {
            window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (window.audioCtx && window.audioCtx.state === 'suspended') {
            await window.audioCtx.resume();
        }

        if ('Notification' in window && Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            console.log("Status permisiune notificări acordată:", permission);
        }

        if ('serviceWorker' in navigator) {
            await navigator.serviceWorker.register('/sw.js');
        }
    } catch (err) {
        console.warn("Nu s-au putut inițializa notificările automate:", err);
    }
};

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

window.selectPersonChip = function (btnElement, personValue) {
    currentPersonClient = personValue;

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
        console.error("Supabase client unavailable.");
        if (container) container.innerHTML = '<p style="text-align:center; width:100%; color:red;">Eroare la conexiunea cu baza de date. Reîncărcați pagina.</p>';
        return;
    }

    try {
        const { data, error } = await window.supabaseClient.from('meniu').select('*');

        if (error) {
            console.error("Eroare la preluarea meniului din Supabase:", error);
            if (container) container.innerHTML = '<p style="text-align:center; width:100%; color:red;">Eroare la încărcarea meniului. Încercați din nou.</p>';
            return;
        }

        produse = data || [];
        renderProducts();
    } catch (err) {
        console.error("Eroare neașteptată la încărcarea meniului:", err);
        if (container) container.innerHTML = '<p style="text-align:center; width:100%; color:red;">Eroare la încărcarea meniului.</p>';
    }
}

function getDefaultProductImage() {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80';
}

function renderProducts() {
    const container = document.getElementById('produse-container');
    if (!container) return;

    container.innerHTML = '';

    if (produse.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; color: #fff;">Meniul este momentan gol.</p>';
        return;
    }

    let renderedCount = 0;

    produse.forEach(p => {
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
            if (!p.nume.toLowerCase().includes(searchQuery) && !(p.descriere || '').toLowerCase().includes(searchQuery)) return;
        } else {
            if (currentTab === 'bar' && !isBautura) return;
            if (currentTab === 'restaurant' && isBautura) return;
        }

        const imageUrl = p.imagine_url || getDefaultProductImage();
        const div = document.createElement('div');
        div.className = 'product-card';

        const safeName = escapeHTML(p.nume);
        const safeDesc = escapeHTML(p.descriere || '');
        const safeImage = escapeHTML(imageUrl);
        
        let priceDisplay = `${escapeHTML(String(p.pret))} Lei`;
        const displayPersonTag = currentPersonClient === "Masa" ? "Împreună" : currentPersonClient;
        let actionButton = `<button class="btn-alegere" data-product-id="${parseInt(p.id)}" style="flex: 3;" onclick="addToCart(${parseInt(p.id)})">Alegerea mea (${escapeHTML(displayPersonTag)})</button>`;

        div.innerHTML = `
            <img src="${safeImage}" alt="${safeName}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 12px; margin-bottom: 15px;">
            <h3>${safeName}</h3>
            <p>${safeDesc}</p>
            <h4>${priceDisplay}</h4>
            <div style="display: flex; gap: 10px; margin-top: auto; padding-top: 15px;">
                <button class="btn-customize" style="flex: 1;" onclick="window.openCustomizeModal(${parseInt(p.id)}, '${safeName.replace(/'/g, "\\'")}')" title="Personalizează"><i class="fas fa-edit"></i> ✏️</button>
                ${actionButton}
            </div>
        `;

        container.appendChild(div);
        renderedCount++;
    });

    if (renderedCount === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; margin-top: 30px; color: #fff;">Niciun produs aici încă. 🤔</p>';
    }

    updateCartUI();
}

let currentCustomizeProductId = null;

window.openCustomizeModal = function (id, name) {
    currentCustomizeProductId = id;
    document.getElementById('customize-product-name').innerText = "Personalizează " + name;
    document.getElementById('customize-notes').value = "";
    document.getElementById('customize-modal').classList.remove('hidden');
};

window.closeCustomizeModal = function () {
    document.getElementById('customize-modal').classList.add('hidden');
    currentCustomizeProductId = null;
};

window.confirmCustomizeAndAdd = function () {
    const notes = document.getElementById('customize-notes').value.trim();
    if (notes.length > 200) {
        alert('Observațiile nu pot depăși 200 de caractere.');
        return;
    }
    if (currentCustomizeProductId) {
        addToCart(currentCustomizeProductId, notes);
    }
    window.closeCustomizeModal();
};

window.addToCart = function (productId, notes = '') {
    let product = produse.find(p => p.id === productId);
    if (!product) return;

    let currentCustomer = currentPersonClient || "Masa";

    const existingItem = cart.find(item => item.product.id === productId && item.notes === notes && item.customer_name === currentCustomer);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ product, quantity: 1, notes, customer_name: currentCustomer });
    }

    updateCartUI();
};

window.removeFromCart = function (index) {
    cart.splice(index, 1);
    updateCartUI();
};

function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total');
    const sendBtn = document.getElementById('btn-trimite-comanda');

    if (!cartContainer) return;

    cartContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">Nu ați adăugat niciun produs în coș.</p>';
        if (sendBtn) sendBtn.disabled = true;
        if (totalSpan) totalSpan.innerText = "0.00";
    } else {
        const groupedCart = {};
        cart.forEach((item, index) => {
            const cName = item.customer_name || "Masa";
            if (!groupedCart[cName]) groupedCart[cName] = [];
            groupedCart[cName].push({ ...item, originalIndex: index });
        });

        for (const [cName, items] of Object.entries(groupedCart)) {
            const headerDiv = document.createElement('div');
            headerDiv.style = "color: #f5b041; font-weight: bold; font-size: 0.95rem; margin: 12px 0 6px 0; border-bottom: 1px solid rgba(245, 176, 65, 0.3); padding-bottom: 4px; text-align: left;";
            headerDiv.innerHTML = `<i class="fas fa-user"></i> ${escapeHTML(cName === "Masa" ? "👥 Comandă Împreună (Plată la Comun)" : "👤 " + cName)}`;
            cartContainer.appendChild(headerDiv);

            items.forEach((item) => {
                total += item.product.pret * item.quantity;
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <div style="flex: 1; text-align: left;">
                        <strong>${escapeHTML(String(item.quantity))}x ${escapeHTML(item.product.nume)}</strong>
                        ${item.notes ? `<div style="font-size: 0.85rem; color: #f5b041; margin-top: 3px;"><em>* ${escapeHTML(item.notes)}</em></div>` : ''}
                    </div>
                    <div style="display: flex; align-items: center; justify-content: flex-end; min-width: 80px;">
                        <span style="font-weight: bold;">${(item.product.pret * item.quantity).toFixed(2)}</span>
                        <button class="btn-secondary" style="width: auto; padding: 5px 10px; margin-left: 10px;" onclick="removeFromCart(${item.originalIndex})">X</button>
                    </div>
                `;
                cartContainer.appendChild(div);
            });
        }
        if (sendBtn) sendBtn.disabled = false;
    }

    if (totalSpan) totalSpan.innerText = total.toFixed(2);

    // Sync button labels without wiping the selected person tag
    const displayPersonTag = currentPersonClient === "Masa" ? "Împreună" : currentPersonClient;
    const allButtons = document.querySelectorAll('.btn-alegere');
    allButtons.forEach(btn => {
        const pId = parseInt(btn.getAttribute('data-product-id'));
        const inCartForCurrent = cart.some(item => item.product.id === pId && item.customer_name === currentPersonClient);
        if (inCartForCurrent) {
            btn.classList.add('selected');
            btn.innerHTML = `✅ Adăugat (${escapeHTML(displayPersonTag)})`;
        } else {
            btn.classList.remove('selected');
            btn.innerHTML = `Alegerea mea (${escapeHTML(displayPersonTag)})`;
        }
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// ==========================================
// TRIMITERE COMANDĂ — cu GEOFENCING
// ==========================================

const btnTrimite = document.getElementById('btn-trimite-comanda');
if (btnTrimite) {
    btnTrimite.addEventListener('click', async () => {
        if (!numarMasa) {
            const qrModal = document.getElementById('qr-error-modal');
            if (qrModal) {
                qrModal.classList.remove('hidden');
            } else {
                alert("Nu am putut detecta numărul mesei. Scanează QR-ul din nou.");
            }
            return;
        }

        btnTrimite.disabled = true;
        btnTrimite.innerText = "Se procesează...";

        btnTrimite.innerText = "Se verifică locația...";
        const geoResult = await window.checkGeolocation();

        if (!geoResult.allowed) {
            const geoModal = document.getElementById('geo-error-modal');
            if (geoModal) {
                geoModal.classList.remove('hidden');
            } else {
                showOrderStatusNotification(
                    geoResult.error || "Nu poți comanda din această locație.",
                    "fas fa-map-marker-alt",
                    "#e74c3c"
                );
            }
            btnTrimite.disabled = false;
            btnTrimite.innerText = "Trimite Comanda";
            return;
        }

        btnTrimite.innerText = "Se trimite...";

        try {
            window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log("Audio init failed:", e);
        }

        let pushSubscription = null;
        try {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                const registration = await navigator.serviceWorker.register('/sw.js');
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const publicVapidKey = "BAxhEvzEuSTKNSIHcJIxoy3fEa31mbZJ6S3gLmo4lJLfbOfL_G0_5X6wVTKcJFw41nvzx5ay9LRnbLbFD0S8GKo";
                    if (publicVapidKey) {
                        pushSubscription = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                        });
                    }
                }
            }
        } catch (error) {
            console.log("Eroare la Push Notifications:", error);
        }

        const total = cart.reduce((sum, item) => sum + (item.product.pret * item.quantity), 0);

        if (typeof window.sendOrderToDatabase === 'function') {
            const placedOrder = await window.sendOrderToDatabase(
                numarMasa,
                cart,
                total,
                pushSubscription,
                geoResult.coords
            );

            if (placedOrder) {
                showOrderStatusNotification(
                    `Comanda trimisă cu succes! (${geoResult.distance}m de restaurant)`,
                    "fas fa-check-circle",
                    "#2ecc71"
                );
                cart = [];
                btnTrimite.disabled = false;
                btnTrimite.innerText = "Trimite Comanda";
                updateCartUI();

                if (typeof window.subscribeToOrderStatus === 'function') {
                    window.subscribeToOrderStatus(placedOrder.id, (newStatus) => {
                        if (newStatus === 'in_preparare') {
                            showOrderStatusNotification("Comanda dumneavoastră este în procesare!", "fas fa-fire", "#f39c12");
                        } else if (newStatus === 'servita') {
                            showOrderStatusNotification("Comanda dumneavoastră este gata!", "fas fa-bell", "#2ecc71");
                        }
                    });
                }
            } else {
                alert("Eroare la trimitere. Vă rugăm încercați din nou.");
                btnTrimite.disabled = false;
                btnTrimite.innerText = "Trimite Comanda";
            }
        } else {
            alert("Eroare de conexiune. Reîncărcați pagina și încercați din nou.");
            btnTrimite.disabled = false;
            btnTrimite.innerText = "Trimite Comanda";
        }
    });
}

function playNotificationSound() {
    try {
        const audioCtx = window.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
        console.log("Audio autoplay restrictionat.");
    }
}

function showOrderStatusNotification(message, iconClass, color) {
    playNotificationSound();

    const notif = document.createElement('div');
    notif.className = 'glass-panel';
    notif.style.position = 'fixed';
    notif.style.top = '20px';
    notif.style.left = '50%';
    notif.style.transform = 'translateX(-50%)';
    notif.style.zIndex = '9999';
    notif.style.padding = '15px 25px';
    notif.style.borderRadius = '15px';
    notif.style.display = 'flex';
    notif.style.alignItems = 'center';
    notif.style.gap = '15px';
    notif.style.boxShadow = '0 15px 35px rgba(0,0,0,0.5)';
    notif.style.border = `1px solid ${color}`;
    notif.style.background = 'rgba(15, 23, 42, 0.9)';
    notif.style.transition = 'all 0.5s ease';

    notif.innerHTML = `
        <i class="${escapeHTML(iconClass)}" style="font-size: 1.8rem; color: ${color};"></i>
        <span style="color: white; font-size: 1.1rem; font-weight: bold;">${escapeHTML(message)}</span>
    `;

    document.body.appendChild(notif);

    notif.animate([
        { top: '-100px', opacity: 0 },
        { top: '20px', opacity: 1 }
    ], { duration: 400, easing: 'ease-out' });

    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.top = '-100px';
        setTimeout(() => notif.remove(), 500);
    }, 6000);
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
