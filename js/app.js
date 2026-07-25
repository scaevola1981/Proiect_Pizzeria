let produse = []; // Meniul se va încărca acum dinamic din Supabase
let cart = [];
let numarMasa = null;

let currentTab = 'restaurant';
let searchQuery = '';

// Preluare număr masă din URL (ex: ?masa=5)
function getTableNumber() {
    const params = new URLSearchParams(window.location.search);
    return params.get('masa');
}

// Inițializare pagină index.html
if (document.getElementById('produse-container')) {
    numarMasa = getTableNumber();
    if (numarMasa) {
        document.getElementById('masa-id').innerText = numarMasa;
    } else {
        document.getElementById('masa-id').innerText = "Necunoscută";
        alert("Te rugăm să scanezi codul QR de pe masă pentru a comanda.");
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
}

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
    
    if (!window.supabaseClient) {
        if (container) container.innerHTML = '<p style="text-align:center; width:100%; color:red;">Eroare: Clientul bazei de date nu este inițializat.</p>';
        return;
    }
    
    const { data, error } = await window.supabaseClient.from('meniu').select('*');
    
    if (error) {
        console.error("Eroare la preluarea meniului din Supabase:", error);
        if (container) container.innerHTML = '<p style="text-align:center; width:100%; color:red;">Eroare la încărcarea meniului.</p>';
        return;
    }
    
    produse = data || [];
    renderProducts();
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
        // Căutăm cuvinte cheie pentru a sorta ca băutură (în categorie sau în nume)
        const catStr = ((p.categorie || '') + ' ' + (p.nume || '')).toLowerCase();
        const isBautura = catStr.includes('bautur') || catStr.includes('băutur') || catStr.includes('suc') || catStr.includes('apa') || catStr.includes('apă') || catStr.includes('coca') || catStr.includes('cola') || catStr.includes('pepsi') || catStr.includes('fanta') || catStr.includes('sprite') || catStr.includes('cafea') || catStr.includes('bere') || catStr.includes('vin');
        
        // Search filtering (dacă utilizatorul caută ceva, căutăm global și ignorăm tab-urile)
        if (searchQuery) {
            if (!p.nume.toLowerCase().includes(searchQuery) && !(p.descriere || '').toLowerCase().includes(searchQuery)) return;
        } else {
            // Tab filtering (doar dacă nu caută)
            if (currentTab === 'bar' && !isBautura) return;
            if (currentTab === 'restaurant' && isBautura) return;
        }
        
        const imageUrl = p.imagine_url || getDefaultProductImage();
        const div = document.createElement('div');
        div.className = 'product-card';
        // Creăm o variantă de nume escaped pentru on-click
        const safeName = p.nume.replace(/'/g, "\\'");
        div.innerHTML = `
            <img src="${imageUrl}" alt="${p.nume}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 12px; margin-bottom: 15px;">
            <h3>${p.nume}</h3>
            <p>${p.descriere || ''}</p>
            <h4>${p.pret} Lei</h4>
            <div style="display: flex; gap: 10px; margin-top: auto; padding-top: 15px;">
                <button class="btn-secondary" style="flex: 1; padding: 10px 5px; font-size: 0.9rem;" onclick="window.openCustomizeModal(${p.id}, '${safeName}')" title="Personalizează"><i class="fas fa-pen"></i></button>
                <button style="flex: 3;" onclick="addToCart(${p.id})">Alegerea mea</button>
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

window.openCustomizeModal = function(id, name) {
    currentCustomizeProductId = id;
    document.getElementById('customize-product-name').innerText = "Personalizează " + name;
    document.getElementById('customize-notes').value = "";
    document.getElementById('customize-modal').classList.remove('hidden');
};

window.closeCustomizeModal = function() {
    document.getElementById('customize-modal').classList.add('hidden');
    currentCustomizeProductId = null;
};

window.confirmCustomizeAndAdd = function() {
    const notes = document.getElementById('customize-notes').value.trim();
    if (currentCustomizeProductId) {
        addToCart(currentCustomizeProductId, notes);
    }
    window.closeCustomizeModal();
};

window.addToCart = function(productId, notes = '') {
    const product = produse.find(p => p.id === productId);
    if (!product) return;
    
    // Verificăm dacă există deja acest produs cu EXACT aceleași observații
    const existingItem = cart.find(item => item.product.id === productId && item.notes === notes);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ product, quantity: 1, notes });
    }
    
    updateCartUI();
};

window.removeFromCart = function(index) {
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
        if (cartTitle) cartTitle.innerText = "Coșul meu";
        cartContainer.innerHTML = '<p class="empty-cart">Nu ati comandat inca nimic</p>';
        sendBtn.disabled = true;
    } else {
        if (cartTitle) cartTitle.innerText = "Ati facut o alegere perfecta!";
        cart.forEach((item, index) => {
            total += item.product.pret * item.quantity;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div style="flex: 1; text-align: left;">
                    <strong>${item.quantity}x ${item.product.nume}</strong>
                    ${item.notes ? `<div style="font-size: 0.85rem; color: #f5b041; margin-top: 3px;"><em>* ${item.notes}</em></div>` : ''}
                </div>
                <div style="display: flex; align-items: center; justify-content: flex-end; min-width: 80px;">
                    <span style="font-weight: bold;">${(item.product.pret * item.quantity).toFixed(2)}</span>
                    <button class="btn-secondary" style="width: auto; padding: 5px 10px; margin-left: 10px;" onclick="removeFromCart(${index})">X</button>
                </div>
            `;
            cartContainer.appendChild(div);
        });
        sendBtn.disabled = false;
    }
    
    totalSpan.innerText = total.toFixed(2);
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

// Handler pentru trimiterea comenzii (dacă există butonul pe pagină)
const btnTrimite = document.getElementById('btn-trimite-comanda');
if (btnTrimite) {
    btnTrimite.addEventListener('click', async () => {
        if (!numarMasa) {
            alert("Nu am putut detecta numărul mesei. Scanează QR-ul din nou.");
            return;
        }
        
        btnTrimite.disabled = true;
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
                    // Vite injectează cheia publică din .env
                    const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
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
        
        // Apelăm funcția din supabase.js
        if (typeof window.sendOrderToDatabase === 'function') {
            const placedOrder = await window.sendOrderToDatabase(numarMasa, cart, total, pushSubscription);
            if (placedOrder) {
                // Afișăm o notificare custom frumoasă în loc de alert standard
                showOrderStatusNotification("Comanda a fost trimisă cu succes!", "fas fa-check-circle", "#2ecc71");
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

// Funcție pentru generarea unui sunet plăcut de notificare (fără fișiere externe)
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
        
        // Un "ding" plăcut și scurt
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Frecvența de pornire
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1); 
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05); // Volum
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5); // Fade out
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
        console.log("Audio autoplay restrictionat.");
    }
}

// Funcție helper pentru afișarea unor notificări premium (Glassmorphism) clientului
function showOrderStatusNotification(message, iconClass, color) {
    // Redăm sunetul
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
    notif.style.background = 'rgba(15, 23, 42, 0.9)'; // Darker glass
    notif.style.transition = 'all 0.5s ease';
    
    notif.innerHTML = `
        <i class="${iconClass}" style="font-size: 1.8rem; color: ${color};"></i>
        <span style="color: white; font-size: 1.1rem; font-weight: bold;">${message}</span>
    `;
    
    document.body.appendChild(notif);
    
    // Animație de slide down
    notif.animate([
        { top: '-100px', opacity: 0 },
        { top: '20px', opacity: 1 }
    ], { duration: 400, easing: 'ease-out' });
    
    // Ascundere după 6 secunde
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.top = '-100px';
        setTimeout(() => notif.remove(), 500);
    }, 6000);
}
