// ==========================================
// APP.JS — Interfața Client (Meniu + Comandă)
// Cu Geofencing + XSS Protection
// ==========================================

let produse = [];
let cart = [];
let numarMasa = null;

let currentTab = 'restaurant';
let searchQuery = '';
let isWaiterMode = false;
let myDeviceId = localStorage.getItem('device_id');
if (!myDeviceId) {
    myDeviceId = 'DEV-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    localStorage.setItem('device_id', myDeviceId);
}

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
                // We got permission! Now stop the camera immediately so it doesn't stay on.
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                console.log("Permisiune cameră obținută cu succes pentru utilizare viitoare.");
            }
        } catch (err) {
            console.warn("Utilizatorul a refuzat permisiunea pentru cameră sau aceasta nu este disponibilă:", err);
        }
    };

    window.openPwaInstallModal = async function () {
        // Solicităm automat permisiunile pentru notificări
        if (typeof window.requestNotificationPermissionAndSetup === 'function') {
            window.requestNotificationPermissionAndSetup();
        }
        
        // Solicităm automat permisiunea pentru cameră (pentru a fluidiza scanările viitoare)
        await window.requestCameraPermissionAndSetup();

        if (window.deferredPromptClient) {
            // Pentru Google Chrome / Android: prompt nativ cu 1 click
            window.deferredPromptClient.prompt();
            const { outcome } = await window.deferredPromptClient.userChoice;
            console.log("Status instalare Chrome:", outcome);
            window.deferredPromptClient = null;
        } else {
            // Pentru iOS Safari / Chrome iOS / browsere fără prompt automat: modalul cu instrucțiuni
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
        // 1. Deblocăm contextul audio pentru redarea sunetului pe mobil
        if (!window.audioCtx) {
            window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (window.audioCtx && window.audioCtx.state === 'suspended') {
            await window.audioCtx.resume();
        }

        // 2. Solicităm permisiunea nativă de Notificări ("Allow / Permite")
        if ('Notification' in window && Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            console.log("Status permisiune notificări acordată:", permission);
        }

        // 3. Înregistrăm Service Worker-ul pentru notificări în fundal
        if ('serviceWorker' in navigator) {
            await navigator.serviceWorker.register('/sw.js');
        }
    } catch (err) {
        console.warn("Nu s-au putut inițializa notificările automates:", err);
    }
};

function setTab(tab) {
    currentTab = tab;
    const tabBar = document.getElementById('tab-bar');
    const tabRestaurant = document.getElementById('tab-restaurant');

    if (tab === 'bar') {
        tabBar.style.background = '#fff';
        tabBar.style.color = '#333';
        tabRestaurant.style.background = 'transparent';
        tabRestaurant.style.color = '#fff';
    } else {
        tabRestaurant.style.background = '#fff';
        tabRestaurant.style.color = '#333';
        tabBar.style.background = 'transparent';
        tabBar.style.color = '#fff';
    }
    renderProducts();
}

async function loadProductsFromSupabase() {
    const container = document.getElementById('produse-container');

    if (container) container.innerHTML = '<p style="text-align:center; width:100%;">Se încarcă meniul...</p>';

    // Așteptăm ca Supabase Client să se inițializeze complet (evită race condition)
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
        container.innerHTML = '<p style="text-align:center; width:100%;">Meniul este momentan gol.</p>';
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

        // XSS Protection — escapăm toate datele din DB
        const safeName = escapeHTML(p.nume);
        const safeDesc = escapeHTML(p.descriere || '');
        const safeImage = escapeHTML(imageUrl);
        
        let priceDisplay = `${escapeHTML(String(p.pret))} Lei`;
        let actionButton = `<button class="btn-alegere" data-product-id="${parseInt(p.id)}" style="flex: 3;" onclick="addToCart(${parseInt(p.id)})">Alegerea mea</button>`;

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
        container.innerHTML = '<p style="text-align:center; width:100%; margin-top: 30px;">Niciun produs aici încă. 🤔</p>';
    }
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
    // Limitare lungime observații
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

    let currentCustomer = "Masa";
    const selector = document.getElementById('current-customer-name');
    if (isWaiterMode && selector) {
        currentCustomer = selector.value;
    }

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
    const cartTitle = document.getElementById('cart-title');

    if (!cartContainer) return;

    cartContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        if (cartTitle) cartTitle.innerText = "Comanda mea";
        cartContainer.innerHTML = '<p class="empty-cart">Nu ati comandat inca nimic</p>';
        sendBtn.disabled = true;
    } else {
        if (cartTitle) cartTitle.innerText = "Comanda mea";
        
        // Group by customer_name
        const groupedCart = {};
        cart.forEach((item, index) => {
            const cName = item.customer_name || "Masa";
            if (!groupedCart[cName]) groupedCart[cName] = [];
            groupedCart[cName].push({ ...item, originalIndex: index });
        });

        for (const [cName, items] of Object.entries(groupedCart)) {
            if (cName !== "Masa") {
                const headerDiv = document.createElement('div');
                headerDiv.style = "color: #f5b041; font-weight: bold; font-size: 0.9rem; margin: 10px 0 5px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px;";
                headerDiv.innerText = cName;
                cartContainer.appendChild(headerDiv);
            }
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
        sendBtn.disabled = false;
    }

    totalSpan.innerText = total.toFixed(2);

    // Sync button states
    const allButtons = document.querySelectorAll('.btn-alegere');
    allButtons.forEach(btn => {
        const pId = parseInt(btn.getAttribute('data-product-id'));
        if (cart.some(item => (item.product.originalId || item.product.id) === pId)) {
            btn.classList.add('selected');
            btn.innerHTML = '✅ Selectat';
        } else {
            btn.classList.remove('selected');
            btn.innerHTML = 'Alegerea mea';
        }
    });
}

// Helper pentru conversia cheii VAPID
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
        // Dacă e client normal și nu are masă -> modal QR
        if (!numarMasa && !isWaiterMode) {
            const qrModal = document.getElementById('qr-error-modal');
            if (qrModal) {
                qrModal.classList.remove('hidden');
            } else {
                alert("Nu am putut detecta numărul mesei. Scanează QR-ul din nou.");
            }
            return;
        }

        // Dacă e ospătar și nu s-a setat numărul mesei încă -> cere numărul mesei
        if (isWaiterMode && !numarMasa) {
            let masaInput = prompt("Introduceți numărul mesei pentru această comandă (ex: 1, 2, 3...):", "1");
            if (!masaInput || masaInput.trim() === "") {
                return;
            }
            numarMasa = masaInput.trim();
            const masaEl = document.getElementById('masa-id');
            if (masaEl) masaEl.innerText = escapeHTML(numarMasa);
        }

        btnTrimite.disabled = true;
        btnTrimite.innerText = "Se procesează...";

        // ============================
        // GEOFENCING CHECK — Bypassed pentru Ospătar
        // ============================
        let geoResult = { allowed: true, coords: null, distance: 0 };
        if (!isWaiterMode) {
            btnTrimite.innerText = "Se verifică locația...";
            geoResult = await window.checkGeolocation();

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
        }

        btnTrimite.innerText = "Se trimite...";

        // Deblocăm contextul audio imediat pe click pentru iOS
        try {
            window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log("Audio init failed:", e);
        }

        // Cerem permisiuni Push Notifications
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
            console.log("Eroare la Push Notifications (probabil iOS fara PWA):", error);
        }

        // Calculăm totalul
        const total = cart.reduce((sum, item) => sum + (item.product.pret * item.quantity), 0);

        // Apelăm funcția din supabase.js — cu coordonatele clientului
        if (typeof window.sendOrderToDatabase === 'function') {
            const placedOrder = await window.sendOrderToDatabase(
                numarMasa,
                cart,
                total,
                pushSubscription,
                geoResult.coords  // Trimitem coordonatele pentru audit
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

                // Ascultăm schimbările de status pentru această comandă
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

// ==========================================
// NOTIFICĂRI VIZUALE
// ==========================================

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

// ==========================================
// IN-APP QR SCANNER
// ==========================================

let html5QrCode = null;

window.startQRScanner = function() {
    const scannerModal = document.getElementById('qr-scanner-modal');
    if (scannerModal) {
        scannerModal.classList.remove('hidden');
    }

    if (typeof Html5Qrcode === 'undefined') {
        alert("Modulul pentru scanare nu a putut fi încărcat.");
        return;
    }

    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("qr-reader");
    }

    const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

    html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
            // on success
            try {
                const url = new URL(decodedText);
                const masaParam = url.searchParams.get('masa');
                if (masaParam) {
                    const masaClean = String(masaParam).replace(/[^0-9a-zA-Z]/g, '').substring(0, 10);
                    numarMasa = masaClean;
                    
                    // Update UI
                    const masaIdElem = document.getElementById('masa-id');
                    if (masaIdElem) {
                        masaIdElem.innerText = escapeHTML(numarMasa);
                    }

                    // Close Scanner
                    window.stopQRScanner();

                    showOrderStatusNotification("Masa scanată cu succes! Poți trimite comanda.", "fas fa-check", "#2ecc71");
                } else {
                    alert("Codul QR scanat nu este valid pentru aplicația noastră.");
                }
            } catch (e) {
                alert("Cod QR invalid. Te rugăm scanează codul de pe masă.");
            }
        },
        (errorMessage) => {
            // background parse error, ignore
        }
    ).catch(err => {
        alert("Eroare la accesarea camerei. Te rugăm să permiți accesul la cameră din setările browserului. Detalii: " + err);
        if (scannerModal) {
            scannerModal.classList.add('hidden');
        }
    });
};

window.stopQRScanner = function() {
    if (html5QrCode) {
        try {
            html5QrCode.stop().then(() => {
                html5QrCode.clear();
            }).catch(error => {
                console.error("Failed to stop scanner. ", error);
            });
        } catch (e) {
            console.error("Error stopping scanner", e);
        }
    }
    const scannerModal = document.getElementById('qr-scanner-modal');
    if (scannerModal) {
        scannerModal.classList.add('hidden');
    }
};

// ==========================================
// STORE SCHEDULE & STATUS LOGIC
// ==========================================

let storeSettings = {
    openTime: '10:00',
    closeTime: '23:30',
    forceClose: false
};

async function checkStoreStatus() {
    if (!document.getElementById('produse-container')) return; // Doar pe meniu.html

    try {
        const { data, error } = await window.supabaseClient.from('setari').select('*');
        if (data) {
            data.forEach(item => {
                if (item.key === 'store_open_time') storeSettings.openTime = item.value;
                if (item.key === 'store_close_time') storeSettings.closeTime = item.value;
                if (item.key === 'store_force_close') storeSettings.forceClose = (item.value === 'true');
            });
        }
        evaluateStoreStatus();
        const appLoader = document.getElementById('app-loading');
        if (appLoader) appLoader.style.opacity = '0';
        setTimeout(() => { if (appLoader) appLoader.style.display = 'none'; }, 300);
    } catch (e) {
        console.error("Eroare la verificarea statusului magazinului:", e);
        const appLoader = document.getElementById('app-loading');
        if (appLoader) appLoader.style.display = 'none';
    }
}

function evaluateStoreStatus() {
    const overlay = document.getElementById('store-closed-overlay');
    if (!overlay) return;

    let isClosed = false;
    const msgEl = document.getElementById('store-closed-message');

    if (storeSettings.forceClose) {
        isClosed = true;
        if (msgEl) msgEl.innerText = "Ne pare rău, restaurantul s-a închis temporar. Nu putem prelua comenzi în acest moment.";
    } else if (storeSettings.openTime && storeSettings.closeTime) {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeInMinutes = currentHours * 60 + currentMinutes;

        const [openH, openM] = storeSettings.openTime.split(':').map(Number);
        const openTimeInMinutes = openH * 60 + openM;

        const [closeH, closeM] = storeSettings.closeTime.split(':').map(Number);
        let closeTimeInMinutes = closeH * 60 + closeM;

        // Dacă închiderea e a doua zi (ex: 02:00)
        let isOvernight = closeTimeInMinutes < openTimeInMinutes;

        if (isOvernight) {
            // E deschis dacă (ora > open) SAU (ora < close)
            if (!(currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes < closeTimeInMinutes)) {
                isClosed = true;
            }
        } else {
            // Program normal în aceeași zi
            if (currentTimeInMinutes < openTimeInMinutes || currentTimeInMinutes >= closeTimeInMinutes) {
                isClosed = true;
            }
        }

        if (isClosed && msgEl) {
            msgEl.innerText = `Ne pare rău, programul restaurantului (${storeSettings.openTime} - ${storeSettings.closeTime}) s-a încheiat. Vă așteptăm cu drag mâine!`;
        }
    }

    if (isClosed) {
        overlay.classList.remove('hidden');
        const cartBtn = document.getElementById('btn-trimite-comanda');
        if (cartBtn) {
            cartBtn.disabled = true;
            cartBtn.style.opacity = '0.5';
            cartBtn.innerText = "Restaurant Închis";
        }
        const qrModal = document.getElementById('qr-error-modal');
        if (qrModal) qrModal.classList.add('hidden');
    } else {
        overlay.classList.add('hidden');
        const cartBtn = document.getElementById('btn-trimite-comanda');
        if (cartBtn) {
            cartBtn.style.opacity = '1';
            cartBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Trimite Comanda';
        }
        updateCartUI(); // Restore original checkout button state based on cart empty/not empty
    }
}

function subscribeToStoreStatus() {
    if (!window.supabaseClient) return;
    
    window.supabaseClient.channel('store-status-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'setari' }, payload => {
            const row = payload.new;
            if (row.key === 'store_open_time') storeSettings.openTime = row.value;
            if (row.key === 'store_close_time') storeSettings.closeTime = row.value;
            if (row.key === 'store_force_close') storeSettings.forceClose = (row.value === 'true');
            evaluateStoreStatus();
        })
        .subscribe();
}

// Inițializare verificare program doar pe meniu.html
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('store-closed-overlay')) {
        checkStoreStatus();
        subscribeToStoreStatus();
        setInterval(evaluateStoreStatus, 60000); // Verificăm la fiecare minut dacă s-a schimbat ora
        
        // Re-verificăm programul și statusul imediat ce aplicația revine în prim-plan (iOS/Android PWA)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                checkStoreStatus();
            }
        });
    }
});

// ==========================================
// SELECȚIE PERSOANE (Pentru Comandă Defalcată Client)
// ==========================================

window.selectPersonChip = function (btnElement, personValue) {
    const sel = document.getElementById('current-customer-name');
    if (sel) sel.value = personValue;

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


