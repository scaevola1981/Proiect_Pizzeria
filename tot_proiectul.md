# Proiect Pizzerie - Toate Fișierele

## `index.html`
```html
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pizzerie - Comandă Online</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header class="bella-roma-hero">
        <div class="hero-overlay">
            <h1 class="hero-title">BELLA ROMA</h1>
            <p class="hero-subtitle">PUB & PIZZERIE</p>
        </div>
    </header>

    <div class="table-info-bar">
        <div id="table-info">Masa: <span id="masa-id" style="font-weight: 800;">Scanați QR</span></div>
    </div>

    <div class="content-wrapper">
        <main class="glass-panel products-area">
            <div id="produse-container" class="products-grid">
                <!-- Produsele vor fi generate aici din JavaScript -->
                <p>Meniul se încarcă...</p>
            </div>
        </main>

        <aside class="glass-panel cart-area">
            <h2>Coșul meu</h2>
            <div id="cart-items">
                <p class="empty-cart">Coșul este gol.</p>
            </div>
            <div class="cart-summary">
                <h3>Total: <span id="cart-total">0.00</span> Lei</h3>
                <button id="btn-trimite-comanda" disabled>Trimite Comanda</button>
            </div>
        </aside>
    </div>

    <!-- Modal Personalizare Produs -->
    <div id="customize-modal" class="modal hidden">
        <div class="modal-content glass-panel" style="max-width: 500px; color: #333; border: 1px solid rgba(255,255,255,0.8);">
            <h2 id="customize-product-name" style="color: #2c3e50; margin-bottom: 10px;">Personalizează</h2>
            <p style="color: #666; margin-bottom: 20px;">Dorești să scoți un ingredient sau ai vreo alergie? Scrie mai jos:</p>
            <textarea id="customize-notes" rows="3" placeholder="ex: fără ceapă, extra sos, alergic la alune..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc; font-size: 1rem; margin-bottom: 20px; resize: none;"></textarea>
            <div style="display: flex; gap: 10px;">
                <button class="btn-secondary" onclick="window.closeCustomizeModal()">Anulează</button>
                <button onclick="window.confirmCustomizeAndAdd()">Adaugă în coș</button>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script type="module" src="js/supabase.js"></script>
    <script type="module" src="js/app.js"></script>
</body>
</html>

```

## `owner.html`
```html
<!DOCTYPE html>
<html lang="ro">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panou Receptie - Pizzerie</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/style.css">
</head>

<body>
    <main class="glass-panel" id="receptie-panel" style="margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div style="display: flex; flex-direction: column;">
                <h1 style="margin: 0;">Panou Receptie</h1>
                <span style="font-family: 'Georgia', serif; color: #d35400; font-weight: bold; font-size: 1.1rem; letter-spacing: 2px; margin-top: 5px;">BELLA ROMA - PUB &amp; PIZZERIE</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="window.location.href='admin.html'" style="background: #2c3e50; color: white; width: auto; padding: 10px 20px; border-radius: 8px; font-size: 1rem;"><i class="fas fa-cogs"></i> Admin Meniu</button>
                <button onclick="window.toggleHistory(true)" class="btn-secondary" style="width: auto; padding: 10px 20px; border-radius: 8px; font-size: 1rem;"><i class="fas fa-history"></i> Vezi Istoric</button>
            </div>
        </div>
        <div id="comenzi-container">
            <!-- Comenzile noi vor apărea aici în timp real -->
            <p>Așteptare comenzi noi...</p>
        </div>
    </main>

    <main class="glass-panel" id="istoric-panel" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0;">Istoric Comenzi (Ultimele 7 Zile)</h2>
            <button onclick="window.toggleHistory(false)" class="btn-secondary" style="width: auto; padding: 10px 20px; border-radius: 8px; font-size: 1rem;"><i class="fas fa-arrow-left"></i> Înapoi la Recepție</button>
        </div>
        <div id="history-content"></div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script type="module" src="js/supabase.js"></script>
    <script type="module" src="js/app.js"></script>
    <script type="module" src="js/owner.js"></script>
</body>

</html>
```

## `admin.html`
```html
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panou Administrare Meniu - BELLA ROMA</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Login Overlay -->
    <div id="login-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #0f172a; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div class="glass-panel" style="max-width: 400px; width: 90%; text-align: center;">
            <h2 style="color: #f5b041; margin-bottom: 20px;"><i class="fas fa-lock"></i> Acces Securizat</h2>
            <p style="color: #cbd5e1; margin-bottom: 20px;">Introduceți parola pentru panoul de administrare.</p>
            <input type="password" id="admin-password" placeholder="Parola" style="width: 100%; margin-bottom: 15px; text-align: center;">
            <button onclick="window.checkAdminPassword()" style="width: 100%;"><i class="fas fa-sign-in-alt"></i> Autentificare</button>
            <p id="login-error" style="color: #e74c3c; margin-top: 15px; display: none;">Parolă incorectă!</p>
        </div>
    </div>
    <header class="bella-roma-hero" style="height: 150px; margin-bottom: 30px;">
        <div class="hero-overlay" style="position: relative;">
            <button onclick="window.logoutAdmin()" style="position: absolute; top: 15px; right: 15px; width: auto; background: #e74c3c; color: white; padding: 8px 15px; font-size: 0.9rem; border-radius: 8px;"><i class="fas fa-sign-out-alt"></i> Ieșire</button>
            <h1 class="hero-title" style="font-size: 2.5rem;">ADMINISTRARE MENIU</h1>
            <p class="hero-subtitle" style="font-size: 1.2rem;">BELLA ROMA - PUB & PIZZERIE</p>
        </div>
    </header>

    <div class="content-wrapper" style="flex-direction: column;">
        <main class="glass-panel" style="margin-bottom: 30px;">
            <h2 style="color: #f5b041;"><i class="fas fa-plus-circle"></i> Adaugă Produs Nou</h2>
            <form id="add-product-form" style="display: flex; flex-direction: column; gap: 15px; max-width: 600px;">
                <div>
                    <label for="nume" style="display: block; margin-bottom: 5px; font-weight: bold; color: #cbd5e1;">Nume Produs *</label>
                    <input type="text" id="nume" required placeholder="ex: Pizza Margherita" style="width: 100%; color: #333;">
                </div>
                <div>
                    <label for="descriere" style="display: block; margin-bottom: 5px; font-weight: bold; color: #cbd5e1;">Descriere (opțional)</label>
                    <input type="text" id="descriere" placeholder="ex: sos roșii, mozzarella..." style="width: 100%; color: #333;">
                </div>
                <div>
                    <label for="pret" style="display: block; margin-bottom: 5px; font-weight: bold; color: #cbd5e1;">Preț (Lei) *</label>
                    <input type="number" id="pret" required min="1" step="0.5" placeholder="ex: 35" style="width: 100%; color: #333;">
                </div>
                <div>
                    <label for="imagine_upload" style="display: block; margin-bottom: 5px; font-weight: bold; color: #cbd5e1;">Alege Poză (opțional)</label>
                    <input type="file" id="imagine_upload" accept="image/*" style="width: 100%; color: #333; background: white; padding: 5px; border-radius: 4px;">
                </div>
                <button type="submit" style="margin-top: 10px;"><i class="fas fa-save"></i> Adaugă în Meniu</button>
            </form>
        </main>

        <main class="glass-panel">
            <h2 style="color: #f5b041;"><i class="fas fa-list"></i> Produse Curente în Meniu</h2>
            <div id="admin-products-container" class="products-grid">
                <p>Se încarcă meniul...</p>
            </div>
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script type="module" src="js/supabase.js"></script>
    <script type="module" src="js/admin.js"></script>
</body>
</html>

```

## `css/style.css`
```css
/* Reset de bază și setări font */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

body {
    background: #0f172a; /* Deep Navy Slate din tema Sera la Roma */
    min-height: 100vh;
    padding: 20px;
    color: #e2e8f0;
}

h1, h2, h3 {
    margin-bottom: 20px;
    color: #f8fafc;
}

/* Efectul principal de Glassmorphism (Sticlă mată - stil iOS) */
.glass-panel {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

/* Header */
.main-header {
    text-align: center;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.main-header h1 {
    margin-bottom: 0;
}

#table-info {
    font-size: 1.2rem;
    font-weight: bold;
    background: rgba(255,255,255,0.4);
    padding: 10px 20px;
    border-radius: 10px;
}

/* Layout index.html: Produse și Coș */
.content-wrapper {
    display: flex;
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.products-area {
    flex: 2;
}

.cart-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-height: 80vh;
    position: sticky;
    top: 20px;
}

/* Grid Produse */
.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
}

.product-card {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 15px;
    text-align: center;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
}

.product-card:hover {
    transform: translateY(-5px);
}

.product-card h3 {
    font-size: 1.2rem;
    margin-bottom: 10px;
}

.product-card p {
    font-size: 0.9rem;
    margin-bottom: 15px;
}

/* Cart Items */
#cart-items {
    flex-grow: 1;
    overflow-y: auto;
    margin-bottom: 20px;
}

.cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.3);
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 10px;
}

.cart-summary {
    border-top: 1px solid rgba(255,255,255,0.3);
    padding-top: 15px;
}

/* Form inputs & buttons */
input, select, button {
    padding: 10px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.5);
    font-size: 1rem;
    transition: background 0.3s ease, border-color 0.3s ease;
}

input:focus, select:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.9);
    border-color: #ff7e67;
}

button {
    background: #f5b041; /* Auriu/Chihlimbar */
    color: #1e293b; /* Text închis pe auriu */
    font-weight: bold;
    cursor: pointer;
    border: none;
    width: 100%;
}

button:hover:not(:disabled) {
    background: #e67e22; /* Portocaliu la hover */
    color: white;
}

button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

button.btn-secondary {
    background: #95a5a6;
}

button.btn-secondary:hover {
    background: #7f8c8d;
}

/* Kitchen & Orders */
.kitchen-area {
    max-width: 1000px;
    margin: 0 auto;
}

.orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.order-card {
    background: rgba(255, 255, 255, 0.3);
    padding: 15px;
    border-radius: 12px;
}

.order-card h3 {
    margin-bottom: 10px;
}

.order-actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
}

/* Modal */
.modal {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal.hidden {
    display: none;
}

.modal-content {
    background: rgba(255,255,255,0.9);
    padding: 30px;
    max-width: 400px;
    width: 100%;
    text-align: center;
}

.modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

/* Customer Display */
.customer-display-body {
    background: #1a1a2e;
    color: white;
}

.customer-display-body .glass-panel {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
}

.customer-display-body h1, 
.customer-display-body h2, 
.customer-display-body h3 {
    color: white;
}

.display-columns {
    display: flex;
    gap: 30px;
}

.column {
    flex: 1;
}

.display-order-card {
    background: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.5rem;
}

.display-order-card.ready {
    background: rgba(46, 204, 113, 0.2);
    border: 1px solid #2ecc71;
}

.time-badge {
    background: #ff7e67;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 1.2rem;
    font-weight: bold;
}

/* =========================================
   MEDIA QUERIES PENTRU MOBILE (RESPONSIVE)
   ========================================= */
@media (max-width: 768px) {
    .content-wrapper {
        flex-direction: column;
    }
    
    .cart-area {
        /* Pe mobil, coșul se așază sub produse. Oprim sticky pentru a nu ocupa abuziv ecranul */
        position: static;
        max-height: none;
        margin-top: 20px;
    }
    
    .main-header {
        flex-direction: column;
        gap: 15px;
    }
    
    /* Și ecranul clienților se aliniază pe coloană pe display-uri mici */
    .display-columns {
        flex-direction: column;
        gap: 20px;
    }
    
    .products-grid {
        /* Asigură-te că pe mobil, cardurile iau toată lățimea sau măcar sunt frumos centrate */
        grid-template-columns: 1fr;
    }
}

/* =========================================
   HERO BANNER - BELLA ROMA
   ========================================= */
.bella-roma-hero {
    height: 300px;
    background: url('/img/bella-roma.jpg') center center/cover no-repeat;
    background-color: #2c3e50; /* Fallback color */
    border-radius: 16px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.hero-overlay {
    background: rgba(0, 0, 0, 0.4);
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.hero-title {
    color: #fff;
    font-size: 4rem;
    font-family: 'Georgia', serif;
    letter-spacing: 4px;
    margin: 0;
    text-transform: uppercase;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.8);
    border-bottom: 2px solid #f1c40f;
    padding-bottom: 10px;
    margin-bottom: 10px;
}

.hero-subtitle {
    color: #f1c40f;
    font-size: 1.5rem;
    letter-spacing: 6px;
    margin: 0;
    text-transform: uppercase;
    font-weight: 600;
    text-shadow: 1px 1px 5px rgba(0,0,0,0.8);
}

.table-info-bar {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 15px 30px;
    margin-bottom: 30px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

#table-info {
    font-size: 1.4rem;
    color: #2c3e50;
    margin: 0;
    background: transparent;
    padding: 0;
}

/* =========================================
   MODERN CARDS (OWNER / HISTORY)
   ========================================= */
#comenzi-container, #history-content {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.modern-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    color: #333;
    border: 1px solid rgba(255,255,255,0.4);
    text-align: left;
}

.modern-card-header {
    height: 120px;
    background: linear-gradient(135deg, #f5b041 0%, #e67e22 100%);
    position: relative;
}

.modern-card.history-card .modern-card-header {
    background: linear-gradient(135deg, #475569 0%, #1e293b 100%); /* Slate grey premium pentru istoric */
}

.modern-card-tab {
    position: absolute;
    top: 0;
    left: 0;
    background: #ffffff;
    padding: 8px 16px;
    font-weight: 700;
    font-size: 0.9rem;
    color: #666;
    border-bottom-right-radius: 16px;
    box-shadow: 2px 2px 5px rgba(0,0,0,0.05);
}

.modern-card-body {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.modern-card-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.modern-card-title-row h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #2c3e50;
    font-weight: 700;
}

.modern-card-price {
    background: #e74c3c;
    color: white;
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
}

.modern-card-desc {
    font-size: 0.95rem;
    color: #34495e;
    line-height: 1.5;
    margin-bottom: 15px;
    flex: 1;
}

.modern-card-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 15px;
    flex-wrap: wrap;
}

.modern-tag {
    background: #7ed6df;
    color: #2c3e50;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.modern-card-btn {
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 0;
    background: #e74c3c;
    color: white;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;
    text-transform: uppercase;
}

.modern-card-btn:hover {
    background: #c0392b;
}

.modern-card-btn.success {
    background: #2ecc71;
}

.modern-card-btn.success:hover {
    background: #27ae60;
}

.modern-card-btn.disabled {
    background: #bdc3c7;
    cursor: default;
    color: #7f8c8d;
}

```

## `js/app.js`
```javascript
let produse = []; // Meniul se va încărca acum dinamic din Supabase
let cart = [];
let numarMasa = null;

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
    loadProductsFromSupabase();
}

async function loadProductsFromSupabase() {
    const container = document.getElementById('produse-container');
    container.innerHTML = '<p style="text-align:center; width:100%;">Se încarcă meniul...</p>';
    
    if (!window.supabaseClient) {
        container.innerHTML = '<p style="text-align:center; width:100%; color:red;">Eroare: Clientul bazei de date nu este inițializat.</p>';
        return;
    }
    
    const { data, error } = await window.supabaseClient.from('meniu').select('*');
    
    if (error) {
        console.error("Eroare la preluarea meniului din Supabase:", error);
        container.innerHTML = '<p style="text-align:center; width:100%; color:red;">Eroare la încărcarea meniului.</p>';
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
    container.innerHTML = '';
    
    if (produse.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%;">Meniul este momentan gol.</p>';
        return;
    }
    
    produse.forEach(p => {
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
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="btn-secondary" style="flex: 1; padding: 10px 5px; font-size: 0.9rem;" onclick="window.openCustomizeModal(${p.id}, '${safeName}')"><i class="fas fa-cog"></i></button>
                <button style="flex: 3;" onclick="addToCart(${p.id})">Adaugă în coș</button>
            </div>
        `;
        container.appendChild(div);
    });
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
    
    if (!cartContainer) return;
    
    cartContainer.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">Coșul este gol.</p>';
        sendBtn.disabled = true;
    } else {
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
        
        // Calculăm totalul
        const total = cart.reduce((sum, item) => sum + (item.product.pret * item.quantity), 0);
        
        // Apelăm funcția din supabase.js
        if (typeof window.sendOrderToDatabase === 'function') {
            const success = await window.sendOrderToDatabase(numarMasa, cart, total);
            if (success) {
                alert("Comanda a fost trimisă spre bucătărie!");
                cart = [];
                updateCartUI();
                btnTrimite.innerText = "Trimite Comanda";
            } else {
                alert("Eroare la trimitere. Supabase nu este configurat.");
                btnTrimite.disabled = false;
                btnTrimite.innerText = "Trimite Comanda";
            }
        }
    });
}

```

## `js/owner.js`
```javascript
let allOrders = [];

async function loadOwnerOrders() {
    if (!window.supabaseClient) return;

    const { data, error } = await window.supabaseClient
        .from('comenzi')
        .select('*')
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error("Eroare:", error);
        return;
    }
    
    allOrders = data || [];
    renderOwnerOrders();
    
    window.supabaseClient.channel('owner_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comenzi' }, (payload) => {
            if (payload.eventType === 'INSERT') {
                allOrders.unshift(payload.new);
            } else if (payload.eventType === 'UPDATE') {
                const idx = allOrders.findIndex(o => o.id === payload.new.id);
                if (idx > -1) allOrders[idx] = payload.new;
            } else if (payload.eventType === 'DELETE') {
                allOrders = allOrders.filter(o => o.id !== payload.old.id);
            }
            renderOwnerOrders();
        }).subscribe();
}

window.renderOwnerOrders = function() {
    const container = document.getElementById('comenzi-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    let totalRevenue = 0;
    
    if (allOrders.length === 0) {
        container.innerHTML = '<p>Nicio comandă înregistrată.</p>';
        return;
    }
    
    allOrders.forEach(order => {
        totalRevenue += parseFloat(order.total) || 0;
        
        // Ascundem comenzile finalizate de pe display, dar le păstrăm la încasări
        if (order.status === 'finalizata' || order.status === 'preluata') {
            return;
        }

        const div = document.createElement('div');
        div.className = 'modern-card';
        
        let headerGradient = "linear-gradient(135deg, #f5b041 0%, #e67e22 100%)";
        if (order.status === 'in_preparare') headerGradient = "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)";

        let itemsStr = order.detalii_comanda && Array.isArray(order.detalii_comanda) ? order.detalii_comanda.map(i => {
            let noteHtml = i.notes ? `<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${i.notes}</small>` : '';
            return `<b>${i.quantity}x</b> ${i.product.nume}${noteHtml}`;
        }).join('<br><br>') : 'Fără detalii';
        const dateStr = new Date(order.created_at).toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' });
        const timeStr = new Date(order.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute:'2-digit' });

        let buttonHtml = '';
        if (order.status === 'noua') {
            buttonHtml = `<button class="modern-card-btn" onclick="window.updateOrderStatus(${order.id}, 'in_preparare')"><i class="fas fa-check"></i> Acceptă Comanda</button>`;
        } else if (order.status === 'in_preparare') {
            buttonHtml = `<button class="modern-card-btn success" onclick="window.updateOrderStatus(${order.id}, 'finalizata')"><i class="fas fa-flag-checkered"></i> Încheiere Comandă</button>`;
        }

        div.innerHTML = `
            <div class="modern-card-header" style="background: ${headerGradient};">
                <div class="modern-card-tab">Masa ${order.numar_masa}</div>
            </div>
            <div class="modern-card-body">
                <div class="modern-card-title-row">
                    <h3>Comanda #${order.id}</h3>
                    <span class="modern-card-price">${order.total} Lei</span>
                </div>
                <div class="modern-card-desc">
                    ${itemsStr}
                </div>
                <div class="modern-card-tags">
                    <span class="modern-tag">Ora ${timeStr}</span>
                    <span class="modern-tag">${dateStr}</span>
                    <span class="modern-tag" style="background: #f39c12; color: white;">${order.status.toUpperCase()}</span>
                </div>
            </div>
            ${buttonHtml}
        `;
        container.appendChild(div);
    });
    
    const revDiv = document.createElement('div');
    revDiv.innerHTML = `<h2 style="margin-bottom:20px; color:#2ecc71; text-align: center;">Încasări Totale: ${totalRevenue.toFixed(2)} Lei</h2>`;
    container.insertBefore(revDiv, container.firstChild);
    
    window.renderHistory();
};

window.renderHistory = function() {
    const content = document.getElementById('history-content');
    if (!content) return;
    
    // Filtrare ultimele 7 zile
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = allOrders.filter(order => new Date(order.created_at) >= sevenDaysAgo);
    
    let html = '';
    
    if (recentOrders.length === 0) {
        html = '<p style="text-align:center; margin-top:20px;">Nu există comenzi în ultimele 7 zile.</p>';
    } else {
        recentOrders.forEach(o => {
            const orderDate = new Date(o.created_at);
            const dateStr = orderDate.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' });
            const timeStr = orderDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute:'2-digit' });
            
            let itemsStr = o.detalii_comanda && Array.isArray(o.detalii_comanda) ? o.detalii_comanda.map(i => {
                let noteHtml = i.notes ? `<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${i.notes}</small>` : '';
                return `<b>${i.quantity}x</b> ${i.product.nume}${noteHtml}`;
            }).join('<br><br>') : 'Fără detalii';

            html += `
                <div class="modern-card history-card">
                    <div class="modern-card-header">
                        <div class="modern-card-tab">Masa ${o.numar_masa}</div>
                    </div>
                    <div class="modern-card-body">
                        <div class="modern-card-title-row">
                            <h3>Comanda #${o.id}</h3>
                            <span class="modern-card-price">${o.total} Lei</span>
                        </div>
                        <div class="modern-card-desc">
                            ${itemsStr}
                        </div>
                        <div class="modern-card-tags">
                            <span class="modern-tag">Ora ${timeStr}</span>
                            <span class="modern-tag">${dateStr}</span>
                        </div>
                    </div>
                    <button class="modern-card-btn disabled" disabled>Finalizată</button>
                </div>
            `;
        });
    }
    
    content.innerHTML = html;
};

loadOwnerOrders();

window.toggleHistory = (show) => {
    const receptie = document.getElementById('receptie-panel');
    const istoric = document.getElementById('istoric-panel');
    if (show) {
        receptie.style.display = 'none';
        istoric.style.display = 'block';
    } else {
        receptie.style.display = 'block';
        istoric.style.display = 'none';
    }
};

```

## `js/admin.js`
```javascript
// Funcții pentru administrarea meniului
async function loadAdminProducts() {
    const container = document.getElementById('admin-products-container');
    container.innerHTML = '<p style="text-align:center; width:100%;">Se încarcă meniul...</p>';

    if (!window.supabaseClient) {
        container.innerHTML = '<p style="text-align:center; width:100%; color:red;">Eroare: Clientul bazei de date nu este inițializat.</p>';
        return;
    }

    const { data, error } = await window.supabaseClient.from('meniu').select('*').order('id', { ascending: false });

    if (error) {
        console.error("Eroare la preluarea meniului din Supabase:", error);
        container.innerHTML = '<p style="text-align:center; width:100%; color:red;">Eroare la încărcarea meniului.</p>';
        return;
    }

    renderAdminProducts(data || []);
}

function getDefaultProductImage() {
    // Imagine generică cu o pizza pentru produsele care nu au primit poză de la Admin
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80';
}

function renderAdminProducts(produse) {
    const container = document.getElementById('admin-products-container');
    container.innerHTML = '';

    if (produse.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%;">Meniul este momentan gol.</p>';
        return;
    }

    produse.forEach(p => {
        const imageUrl = p.imagine_url || getDefaultProductImage();
        const div = document.createElement('div');
        div.className = 'product-card';
        // Suprascriem fundalul cu glass-panel light pt contrast
        div.style.background = 'rgba(255, 255, 255, 0.1)';
        div.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        
        div.innerHTML = `
            <img src="${imageUrl}" alt="${p.nume}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 12px; margin-bottom: 15px;">
            <h3 style="color: #fff;">${p.nume}</h3>
            <p style="color: #cbd5e1; flex-grow: 1; margin-bottom: 15px;">${p.descriere || '-'}</p>
            <h4 style="color: #f5b041; margin-bottom: 15px;">${p.pret} Lei</h4>
            <button onclick="window.deleteProduct(${p.id})" style="margin-top:auto; background:#e74c3c; color:white;"><i class="fas fa-trash"></i> Șterge Produs</button>
        `;
        container.appendChild(div);
    });
}

const form = document.getElementById('add-product-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nume = document.getElementById('nume').value;
        const descriere = document.getElementById('descriere').value;
        const pret = parseFloat(document.getElementById('pret').value);
        const fileInput = document.getElementById('imagine_upload');

        if (!nume || !pret) {
            alert("Completați numele și prețul!");
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se salvează...';

        let imagine_url = null;

        // Dacă utilizatorul a selectat un fișier, îl uploadăm
        if (fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
                .from('imagini_produse')
                .upload(fileName, file);

            if (uploadError) {
                console.error("Eroare la upload poză:", uploadError);
                alert("Nu s-a putut încărca poza. Se va salva produsul fără poză.");
            } else {
                // Obținem URL-ul public
                const { data: publicUrlData } = window.supabaseClient.storage
                    .from('imagini_produse')
                    .getPublicUrl(fileName);
                
                imagine_url = publicUrlData.publicUrl;
            }
        }

        const { error } = await window.supabaseClient
            .from('meniu')
            .insert([{ nume, descriere, pret, imagine_url }]);

        if (error) {
            console.error("Eroare la adăugare:", error);
            alert("Eroare la adăugarea produsului: " + error.message);
        } else {
            form.reset();
            loadAdminProducts(); // reîncărcăm lista
        }
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Adaugă în Meniu';
    });
}

// Expunem funcția global pentru a fi apelată de onclick
window.deleteProduct = async (id) => {
    if (!confirm("Sigur doriți să ștergeți acest produs?")) return;

    const { error } = await window.supabaseClient
        .from('meniu')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Eroare la ștergere:", error);
        alert("Nu s-a putut șterge produsul: " + error.message);
    } else {
        loadAdminProducts();
    }
};

const ADMIN_PWD = "bella"; // Parola pentru panoul Admin

document.addEventListener('DOMContentLoaded', () => {
    // Verificăm dacă e deja logat în sesiune
    if (sessionStorage.getItem('admin_logged_in') === 'true') {
        const overlay = document.getElementById('login-overlay');
        if (overlay) overlay.style.display = 'none';
        if (document.getElementById('admin-products-container')) {
            loadAdminProducts();
        }
    }

    // Permitem login și cu tasta Enter
    const pwdInput = document.getElementById('admin-password');
    if (pwdInput) {
        pwdInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                window.checkAdminPassword();
            }
        });
    }
});

window.checkAdminPassword = function() {
    const pwd = document.getElementById('admin-password').value;
    const err = document.getElementById('login-error');
    if (pwd === ADMIN_PWD) {
        sessionStorage.setItem('admin_logged_in', 'true');
        document.getElementById('login-overlay').style.display = 'none';
        if (document.getElementById('admin-products-container')) {
            loadAdminProducts();
        }
    } else {
        err.style.display = 'block';
    }
};

window.logoutAdmin = function() {
    // Ștergem sesiunea
    sessionStorage.removeItem('admin_logged_in');
    // Redirecționăm către meniul clienților (sau se reîncarcă admin.html ca să ceară parola)
    window.location.href = 'index.html';
};

```

## `js/supabase.js`
```javascript
// ==========================================
// SKELETON SUPABASE - Așteaptă conectarea
// ==========================================

const supabaseUrl = 'https://tzdtssvjsrhyocskivmm.supabase.co';
const supabaseKey = 'sb_publishable_JRIxO4MMjth3IkqfaOCPmw_e69T87UP';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
window.supabaseClient = supabase; // Facem clientul disponibil pentru preluarea meniului în app.js

// Trimitere comandă nouă
window.sendOrderToDatabase = async function (masa, cart, total) {
    const order = {
        numar_masa: masa,
        detalii_comanda: cart, // JSON
        total: total,
        status: 'noua'
    };
    const { data, error } = await supabase.from('comenzi').insert([order]);
    if (error) {
        console.error("Eroare la inserare:", error);
        return false;
    }
    return true;
};

// Actualizare status comandă
window.updateOrderStatus = async function (orderId, newStatus, timestampFinalizare = null) {
    const updateData = { status: newStatus };
    if (timestampFinalizare !== null) {
        updateData.timp_asteptare = timestampFinalizare; // Salvăm timestamp-ul
    }
    const { data, error } = await supabase.from('comenzi').update(updateData).eq('id', orderId);
    if (error) {
        console.error("Eroare la update:", error);
    }
};

// Abonare pentru Kitchen (ascultă comenzi noi)
window.subscribeToKitchenOrders = function (callback) {
    console.log("Abonat cu succes la comenzile de bucatarie.");
    supabase.channel('kitchen_orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comenzi' }, callback)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comenzi' }, callback)
        .subscribe();
};

// Abonare pentru Customer Display (ascultă comenzi în preparare/finalizate)
window.subscribeToCustomerDisplay = function (callback) {
    console.log("Abonat cu succes la display-ul clienților.");
    supabase.channel('customer_display')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comenzi' }, callback)
        .subscribe();
};

```

## `package.json`
```json
{
  "name": "proiect-pizzerie-mvp",
  "version": "1.0.0",
  "description": "MVP pentru Pizzerie",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}

```

## `vite.config.js`
```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        owner: resolve(__dirname, 'owner.html'),
        admin: resolve(__dirname, 'admin.html')
      }
    }
  }
});

```

## `prompt.md`
```markdown
Obiectiv: Refactorizarea logicii MVP-ului pentru a elimina mock-ul de localStorage, a pregăti terenul pentru Supabase și a repara sistemul de gestionare a timpului.

Fișiere vizate: `js/app.js`, `js/supabase.js`, `kitchen.html`, `customer-display.html`.

Sarcini stricte de execuție:
1. Eliminarea Mock-ului: În `js/supabase.js` și `js/app.js`, șterge absolut toată logica bazată pe `localStorage` și `window.dispatchEvent('storage')`. Lasă în `supabase.js` doar scheletul gol pregătit pentru inițializarea clientului Supabase real (variabilele de URL și Key).
2. Logica de Timp (Timestamp Absolut): Modifică modalul din `kitchen.html` și logica asociată din JavaScript. Bucătarul nu trebuie să mai introducă "minute" (ex: 15 min). Modifică input-ul astfel încât să genereze un Timestamp (o oră viitoare). 
3. Regula Intervalelor: Orice timp estimat setat de bucătărie trebuie restricționat și rotunjit automat pentru a fi afișat exclusiv în ore întregi sau în intervale de 30 de minute (ex. 14:00, 14:30, 15:00). Nicio altă valoare intermediară nu este permisă în interfață sau în baza de date.
4. Display-ul Clientului: Actualizează scriptul din `customer-display.html`. În loc să scadă un număr fix de minute, scriptul trebuie să primească Timestamp-ul (ex: 14:30) și să calculeze dinamic diferența față de ora curentă (`Date.now()`) pentru a afișa timpul rămas.
5. Stilizare: Asigură-te că orice element UI nou generat (cum ar fi noile selectoare de timp) primește automat clasa `.glass-panel` pentru a păstra coerența vizuală.
```

## `Proiect_MVP_Pizzerie.md`
```markdown

Conversația cu Gemini
Chat proiect Pizzerie!!

Să dăm drumul proiectului Pizzerie! 🍕
Acesta sună ca un proiect excelent pentru a construi ceva util și interactiv. Pentru a face interfața vizuală să iasă cu adevărat în evidență, putem implementa acel efect elegant de glassmorphism (stilul de sticlă mată din iOS) pentru navigare, meniuri și cardurile cu oferte. Acest detaliu va oferi întregii aplicații un aspect premium, curat și modern.

Pe partea de funcționalitate, dacă vom adăuga un modul pentru rezervări de mese sau pentru estimarea timpului de preluare a comenzilor, vom structura selectorul de timp astfel încât să afișeze opțiunile direct în ore întregi sau în intervale de 30 de minute, menținând experiența de utilizare fluidă și intuitivă.

Cu ce secțiune a proiectului ai prefera să începem: definirea bazei de date, schițarea interfeței (în JavaScript) sau logica din spate (în Python)?

pe baza a ceea ce am discutat doresc pasii principali din ce trebuie sa fie alcatuit PROIECTUL

Iată pașii principali pentru structurarea și dezvoltarea aplicației pentru pizzerie, urmărind un flux logic de la zero până la un proiect funcțional.

1
Setarea Arhitecturii și a Mediului de Lucru
Alegerea tehnologiilor de bază
Structurăm proiectul separând clar logica din spate de interfața vizuală. Vom folosi Python pentru partea de backend (un framework ușor precum FastAPI sau Flask pentru a gestiona cererile) și JavaScript alături de HTML/CSS pentru frontend.

2
Implementarea Interfeței cu Utilizatorul (UI)
Aplicarea stilizării vizuale de tip glassmorphism
Aici construim scheletul paginilor. Vom integra efectul de sticlă mată (glassmorphism) pe componentele principale: bara de navigare, meniul lateral și cardurile individuale pentru fiecare tip de pizza. Acest lucru va fi realizat folosind proprietatea CSS backdrop-filter: blur() cu un fundal semi-transparent.

3
Meniul Dinamic și Coșul de Cumpărături
Logica de adăugare a produselor
Construim structura de date pentru pizza (nume, ingrediente, preț). Cu ajutorul JavaScript, vom face ca apăsarea butonului de "Adaugă în coș" să actualizeze instantaneu suma totală și lista de produse, fără a reîncărca pagina.

4
Modulul de Preluare Comenzi și Rezervări
Gestionarea timpului
Crearea formularului final de comandă. Aici implementăm selectorul de timp pentru ridicarea comenzii sau rezervarea mesei. Vom restricționa opțiunile astfel încât utilizatorul să poată alege exclusiv ore fixe sau intervale de 30 de minute (ex. 18:00, 18:30, 19:00), păstrând interfața aerisită.

5
Baza de Date și API-ul
Salvarea comenzilor pe server
Conectăm frontend-ul la backend-ul de Python. Când clientul finalizează comanda, datele (produsele, ora selectată) sunt trimise către server și salvate într-o bază de date (precum SQLite pentru început) pentru a putea fi gestionate de personalul pizzeriei.

6
Testare și Finalizare
Verificarea fluxului complet
Rulăm un scenariu cap-coadă: deschidem aplicația cu designul de sticlă, selectăm o pizza, setăm ridicarea comenzii la o treime de oră fixă și verificăm dacă backend-ul primește și validează corect informația.


Cu care parte tehnică vrei să dăm startul?

Setarea arhitecturii Python & JS

Stilizarea UI (Glassmorphism)

ok trecem la scenarii posibile 1-proprietarul are doar un telefon de ex:APPLe ,clientii au diverse telefoane .2-cum fac serverul ,poate nu vrea sa plateasca nimic extra 'ex: abomanete '

Acestea sunt scenarii excelente, desprinse exact din lumea reală. Când construiești o aplicație pentru o afacere mică, reducerea costurilor lunare și accesibilitatea universală sunt de obicei cerințele numărul unu.

Iată cum putem rezolva ambele provocări folosind cunoștințele tale de JavaScript și Python:

1. Proprietarul are doar iPhone, iar clienții au telefoane diverse
Soluția ideală aici nu este să construiești o aplicație nativă separată pentru iOS și alta pentru Android (ceea ce ar necesita limbaje diferite și aprobări în magazinele de aplicații).

Soluția este o Aplicație Web Progresivă (PWA - Progressive Web App).

Pentru clienți: Vor accesa pizzeria printr-un simplu link web (din browser). Interfața web, construită cu JavaScript și acel design glassmorphism, se va adapta perfect pe orice ecran, indiferent dacă au Android, iOS sau un laptop.

Pentru proprietar: O PWA permite ca site-ul web să fie "salvat" pe ecranul principal al iPhone-ului. Se va deschide pe tot ecranul, exact ca o aplicație descărcată din App Store, și de acolo va putea gestiona comenzile. Nu are nevoie de nimic altceva decât de browserul Safari pe care îl are deja.

2. Server complet gratuit (Fără abonamente lunare)
Este perfect realizabil să ridici acest proiect fără să plătești absolut nimic pentru găzduire, folosind planurile "Free Tier" (gratuite permanent) oferite de marile platforme pentru dezvoltatori.

Putem împărți proiectul în trei piese găzduite gratuit:

Componentă	Tehnologie	Platformă gratuită recomandată
Frontend (Interfața vizuală)	HTML, CSS, JavaScript	Netlify sau Vercel (Găzduire gratuită pentru fișiere statice, viteză mare).
Backend (Logica/Serverul)	Python (Flask sau FastAPI)	PythonAnywhere sau Render (Oferă servere de bază gratuite, perfecte pentru traficul unei pizzerii locale).
Baza de date (Comenzile)	SQLite sau PostgreSQL	SQLite (fișier local pe serverul Python - 0 costuri) sau Supabase (plan gratuit generos).
Alternativa "Hardware":
Dacă proprietarul are un laptop sau un PC mai vechi care stă mereu pornit în pizzerie (de exemplu, cel pe care rulează muzica sau casa de marcat), poți rula serverul Python direct pe acel calculator. Folosind un serviciu gratuit precum Cloudflare Tunnels, poți face acel calculator vizibil pe internet în mod securizat, fără să plătești nimic pentru găzduire în cloud.

Cum vrem să abordăm serverul?

Da

daca partea de frontend nu are nevoi speciale ,ramane partea de backend .Asta inasemna doua parti de frontend una la client alta la owner ,si cahir una care sa faca diplay la comanda in timp real ?

Ai intuit perfect. Exact așa se gândește arhitectura unei aplicații moderne! Backend-ul devine "creierul" central (API-ul), iar în jurul lui poți atașa oricâte interfețe dorești, fără să modifici serverul.

Practic, vei scrie un singur backend în Python, cu care vor comunica trei interfețe frontend distincte (în JavaScript/HTML/CSS):

Interfața Clientului: Pagina publică. Aici implementăm designul glassmorphism, meniul și selecția timpului de livrare/rezervare (în intervale fixe de 30 de minute).

Panoul Proprietarului (Dashboard): Optimizat pentru a fi salvat pe iPhone. Aici proprietarul vede comenzile noi, le acceptă și le schimbă statusul (ex: "În lucru", "Gata").

Display-ul Live (Bucătărie): Un ecran simplu (poate rula pe un monitor conectat la un laptop vechi sau o tabletă) care afișează comenzile mari, în ordinea sosirii, pentru ca bucătarul să știe exact ce are de pregătit.

Toate aceste trei frontend-uri pot fi găzduite gratuit pe aceeași platformă (de ex. Netlify), fiind doar pagini web diferite care "vorbesc" cu același server Python.

Cum rezolvăm actualizarea în "Timp Real"?
Aici intervine o mică provocare tehnică: cum facem ca telefonul proprietarului sau ecranul din bucătărie să afișeze o comandă instantaneu, fără ca cineva să apese pe "Refresh"? Ca dezvoltator junior, ai două opțiuni excelente pe care le poți implementa:

Metoda	Cum funcționează	Avantaje / Dezavantaje
Polling (Interogare periodică)	JavaScript-ul face o cerere către Python la fiecare 10 secunde: "A mai apărut ceva nou?".	Cel mai simplu de scris (folosești un simplu setInterval). Dezavantaj: Consumă resurse inutile dacă nu există comenzi.
WebSockets (Timp real veritabil)	Se deschide un "tub de comunicare" permanent. Când clientul dă comanda, Python trimite direct notificarea către panoul proprietarului.	Elegant și instantaneu. Necesită integrarea unei biblioteci suplimentare (cum ar fi Socket.IO în Python și JS).
Deoarece lucrezi deja cu JavaScript și Python, implementarea WebSockets folosind Socket.IO ar fi un exercițiu fantastic de logică, perfect pentru a face aplicația să se simtă premium și reactivă.

Cum vrei să structurăm mai departe?

Construim API-ul în Python

Logica pentru WebSockets

eu pe Netifly sau Vercel am proeictele mele si nu prea mai am loc ,iar daca tot priemsc mesaje de suspedare mereu de la ei

Este o situație des întâlnită. În ultimul timp, platformele de tip Netlify sau Vercel au devenit mult mai stricte cu conturile gratuite, iar pentru o afacere reală precum o pizzerie, ultimul lucru pe care ți-l dorești este ca site-ul să fie suspendat fix în timpul programului.

Ca dezvoltator junior, ai la dispoziție câteva alternative mult mai sigure și mai puțin restrictive pentru a găzdui gratuit acest proiect:

1. Cloudflare Pages (Pentru Frontend)
În acest moment, este cea mai bună alternativă la Vercel/Netlify. Planul gratuit este extrem de generos, nu blochează conturile ușor, iar viteza de încărcare este excelentă. Poți găzdui aici fără emoții cele trei interfețe web cu designul tău glassmorphism.

2. Firebase Hosting (Ecosistemul Google Cloud)
O altă opțiune foarte robustă și sigură este ecosistemul Google Cloud. Având în vedere familiaritatea ta cu acest mediu din implementările de integrări precum OAuth2, Firebase Hosting va fi foarte ușor de configurat. Planul lor „Spark” (gratuit) este construit exact pentru aplicații de genul acesta, iar limitele sunt clare și rar duc la suspendări bruște.

3. Serverul Local (Fără Cloud, Control 100%)
Dacă vrei să eviți complet platformele de găzduire externe și ai în plan să lucrezi și cu aplicații sau asistenți care rulează strict pe o mașinărie fizică, poți aplica aceeași logică pentru pizzerie.

Cum funcționează: Iei un laptop sau un PC mai vechi care stă pornit în pizzerie. Instalezi Python pe el și rulezi tot backend-ul și frontend-ul direct de acolo.

Expunerea pe internet: Folosești Cloudflare Tunnels (este complet gratuit). Acesta creează un "tunel" securizat de la calculatorul din pizzerie direct pe internet.

Avantajul: Clienții intră pe un link normal, dar pagina și comenzile se încarcă fizic de pe calculatorul proprietarului. Nu mai există limite de stocare, nu există conturi suspendate, iar comunicarea este directă.

Pentru backend, dacă alegi să îl ții în cloud, Render.com sau PythonAnywhere rămân opțiuni valide și nu sunt la fel de agresive cu suspendările precum platformele de frontend.

Ce direcție ți se pare mai interesantă de explorat pentru acest proiect: să mutăm frontend-ul pe Cloudflare/Firebase sau să mergem pe ideea curajoasă a unui server local chiar în incinta pizzeriei?

ok luam asa ,pentru inceput doresc un MVP cu totul pe tehnologiile care le folosesc ADica Vervel si SupaBase ,pana fac prezentarea si in functie de ce doreste clientul ma adaptez? este ok ?

Este o decizie excelentă. Aceasta este, de fapt, cea mai profesionistă abordare atunci când dezvolți un produs de la zero: construiești rapid un MVP (Minimum Viable Product) folosind uneltele pe care le stăpânești cel mai bine, demonstrezi funcționalitatea, iar apoi optimizezi infrastructura doar dacă proiectul merge mai departe.

Combinarea Vercel cu Supabase este fantastică pentru acest scenariu de prezentare, din câteva motive foarte clare:

Viteză maximă de dezvoltare: Nu pierzi timp configurând servere locale sau rute complexe. Te poți concentra direct pe implementarea interfeței elegante cu glassmorphism și pe logica de selecție a timpului în intervale de 30 de minute.

Supabase rezolvă "Timpul Real": Supabase are funcționalitatea de Realtime (WebSockets) integrată direct în baza de date. Când un client trimite o comandă de pe interfața lui (găzduită pe Vercel), rândul adăugat în baza de date Supabase va declanșa instantaneu o actualizare pe telefonul proprietarului, fără să fie nevoie să scrii tu manual un server Python complex cu Socket.IO pentru acest MVP.

Prezentare profesională: Clientul va putea accesa direct link-urile de pe Vercel de pe propriul telefon în timpul întâlnirii, având o experiență tactilă reală cu produsul.

Pentru acest MVP, arhitectura ta se simplifică astfel:
Tot codul tău va fi în JavaScript (Frontend), comunicând direct cu baza de date Supabase (Backend-as-a-Service) prin API-ul lor. Python-ul poate fi lăsat deoparte momentan sau introdus mai târziu dacă vei avea nevoie de automatizări mai complexe în fundal.

Pentru a pune lucrurile în mișcare pentru MVP, cu ce ai prefera să începem?
Putem defini structura tabelelor în Supabase (ex: produse, comenzi) sau putem schița baza proiectului de frontend pentru a testa designul vizual?

ok,dores sa trec in Editorul ANTIGRAVITY de la google gemini ,doresc sa creez fisierelee necesare si am nevoie de u fisier .md pentru tot proiectul

4. Structura Bazei de Date (Supabase)
Tabelul produse
id (UUID, Primary Key)

nume (Text)

descriere (Text, ingredientele)

pret (Numeric)

imagine_url (Text)

Tabelul comenzi
id (UUID, Primary Key)

client_nume (Text)

client_telefon (Text)

detalii_comanda (JSON - va conține produsele și cantitățile)

ora_ridicare (Text - ex: "18:30")

total (Numeric)

status (Text - ex: "noua", "in_preparare", "finalizata")

created_at (Timestamp)

5. Pașii Următori pentru Dezvoltare
Configurare Supabase: Crearea proiectului, a celor două tabele și activarea politicilor RLS (Row Level Security) pentru testare.

Inițializare Vercel: Crearea proiectului frontend local și conectarea repository-ului la Vercel pentru deployment continuu.

Dezvoltare UI Client: Construirea meniului HTML/CSS și implementarea logicii JavaScript pentru coșul de cumpărături.

Integrare Supabase JS: Scrierea funcției JavaScript care inserează comanda finală în tabelul comenzi.

Abonare la Evenimente Realtime: Construirea fișierului owner.html care "ascultă" (listen) inserările noi din Supabase și le afișează instant.
"""

file_path = "Proiect_MVP_Pizzerie.md"
with open(file_path, "w", encoding="utf-8") as f:
f.write(md_content)

print(f"File generated successfully: {file_path}")


```text?code_stdout&code_event_index=1
File generated successfully: Proiect_MVP_Pizzerie.md

Fișierul Markdown a fost generat cu succes și conține întreaga arhitectură a proiectului.
pictograma MD
Proiect_MVP_Pizzerie
 MD 
Deschide

Documentul .md acoperă:

Arhitectura bazată pe Vercel (Frontend) și Supabase (Backend/Realtime).

Structura celor trei interfețe (Client, Proprietar, Bucătărie).

Clasa CSS de bază pentru efectul de glassmorphism.

Schema inițială a tabelelor pentru baza de date (produse și comenzi).

Pașii logici pentru dezvoltare.

Acesta poate servi drept "harta" principală a proiectului. Următorul pas practic ar fi fie să creăm fișierele de cod pentru interfața web (HTML/CSS) ca să vizualizăm designul, fie să scriem scripturile de JavaScript necesare conectării la baza de date. Cu care dintre acestea ai dori să continuăm?

ok ,sunt aici ,care sunt pasii de urmat ?

Văd că ai deschis spațiul de lucru în Antigravity IDE și totul este pregătit! Panoul din stânga (Explorer) este gol momentan, așa că trebuie să construim fundația proiectului direct în acest spațiu.

Iată pașii exacți pentru a popula acest workspace cu structura MVP-ului:

Pasul 1: Adaugă Documentația
În panoul din stânga (Explorer), chiar sub numele Proiect Pizzerie, dă click pe iconița de New File (prima iconiță cu un fișier și un "+").

Numește fișierul Proiect_MVP_Pizzerie.md.

Copiază tot conținutul Markdown pe care l-am generat la pasul anterior și adaugă-l acolo. Astfel, vei avea arhitectura și detaliile tabelelor de bază mereu la îndemână direct în editor.  
MD
+ 1

Pasul 2: Crearea Structurii de Fișiere Frontend
Deoarece vom găzdui MVP-ul pe Vercel ca o aplicație bazată pe HTML/JS/CSS, avem nevoie de o structură standard. Folosește butoanele de New File și New Folder pentru a crea următoarele:  
MD

📄 index.html (Interfața principală pentru clienți, unde vom avea meniul și selectorul de timp).  
MD

📄 owner.html (Panoul pentru gestionarea comenzilor de pe telefon).  
MD

📄 kitchen.html (Ecranul simplificat pentru bucătărie).  
MD

📁 css (folder)

📄 style.css (Aici vom adăuga clasa .glass-panel și restul stilurilor).  
MD

📁 js (folder)

📄 app.js (Aici vom scrie logica pentru coșul de cumpărături).  
MD

📄 supabase.js (Acesta va conține codul pentru conectarea la baza de date).  
MD

Pasul 3: Pregătirea Scheletului HTML
Deschide fișierul index.html pe care tocmai l-ai creat. Poți scrie ! și să apeși Tab pentru a genera automat structura de bază HTML5, sau poți lipi acest cod de pornire care leagă deja fișierele CSS și JS:

HTML
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pizzerie - Comandă Online</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Containerul principal cu efectul vizual dorit -->
    <main class="glass-panel">
        <h1>Meniu Pizzerie</h1>
        <div id="produse-container"></div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="js/supabase.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
După ce creezi aceste fișiere în Explorer, cu ce parte ai vrea să începem să scriem codul efectiv: populăm style.css pentru a implementa vizual efectul de glassmorphism sau structurăm cardurile produselor direct în index.html?




Gemini este un AI și poate să facă greșeli, inclusiv în legătură cu persoane. Confidențialitatea ta și GeminiSe deschide într-o fereastră nouă

# Documentație Proiect Pizzerie - MVP 🍕

Acest document descrie arhitectura și planul de dezvoltare pentru Minimum Viable Product (MVP) al aplicației web destinate unei pizzerii, folosind stiva tehnologică bazată pe Vercel și Supabase.

## 1. Arhitectura Tehnologică
- **Frontend (Interfața utilizatorilor):** HTML, CSS (stilizare Glassmorphism) și JavaScript. Găzduire pe **Vercel**.
- **Backend / Baza de date:** **Supabase** (PostgreSQL). Va gestiona stocarea produselor, a comenzilor și va oferi funcționalitatea de **Realtime** (WebSockets) pentru actualizări instantanee pe dispozitivele proprietarului și ale bucătăriei.

## 2. Structura Interfețelor (Frontend)
Aplicația va fi împărțită în trei secțiuni logice, accesibile din browser (PWA):

1. **Aplicația Clientului (index.html):**
   - Meniul digital cu produse (carduri cu efect de sticlă mată).
   - Coșul de cumpărături dinamic.
   - Formular de finalizare comandă cu selector de timp restricționat la **ore fixe sau intervale de 30 de minute** (ex. 18:00, 18:30).

2. **Panoul Proprietarului (owner.html):**
   - Interfață optimizată pentru mobil (iOS/Safari).
   - Afișează comenzile noi în timp real folosind `Supabase Realtime`.
   - Butoane pentru acceptarea comenzilor sau modificarea statusului.

3. **Display Bucătărie (kitchen.html):**
   - Interfață simplificată, vizibilă de la distanță.
   - Listează doar comenzile active și produsele necesare a fi preparate.

## 3. Stilizare Vizuală - Glassmorphism
Toate elementele de interfață majore vor folosi designul inspirat din iOS, bazat pe transparență, blur de fundal și margini subtile. 

**Exemplu clasă CSS de bază:**
```css
.glass-panel {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}
```

## 4. Structura Bazei de Date (Supabase)

### Tabelul `produse`
- `id` (UUID, Primary Key)
- `nume` (Text)
- `descriere` (Text, ingredientele)
- `pret` (Numeric)
- `imagine_url` (Text)

### Tabelul `comenzi`
- `id` (UUID, Primary Key)
- `client_nume` (Text)
- `client_telefon` (Text)
- `detalii_comanda` (JSON - va conține produsele și cantitățile)
- `ora_ridicare` (Text - ex: "18:30")
- `total` (Numeric)
- `status` (Text - ex: "noua", "in_preparare", "finalizata")
- `created_at` (Timestamp)

## 5. Pașii Următori pentru Dezvoltare
1. **Configurare Supabase:** Crearea proiectului, a celor două tabele și activarea politicilor RLS (Row Level Security) pentru testare.
2. **Inițializare Vercel:** Crearea proiectului frontend local și conectarea repository-ului la Vercel pentru deployment continuu.
3. **Dezvoltare UI Client:** Construirea meniului HTML/CSS și implementarea logicii JavaScript pentru coșul de cumpărături.
4. **Integrare Supabase JS:** Scrierea funcției JavaScript care inserează comanda finală în tabelul `comenzi`.
5. **Abonare la Evenimente Realtime:** Construirea fișierului `owner.html` care "ascultă" (listen) inserările noi din Supabase și le afișează instant.
Proiect_MVP_Pizzerie.md
Se afișează Proiect_MVP_Pizzerie.md.
```

## `.env`
```env
# Coduri de autentificare / recuperare Vercel
VERCEL_AUTH_1=fd8858e7-2825f004
VERCEL_AUTH_2=4ffe630f-1c8834d1
VERCEL_AUTH_3=4eaa7654-a0250612
VERCEL_AUTH_4=01b0f38f-b8f95fd0
VERCEL_AUTH_5=310af3c6-62c2eeff
VERCEL_AUTH_6=c17cbba7-4ad45b4e

# Configurații Supabase
SUPABASE_DB_PASSWORD=Parola-Supabase

```

## `.gitignore`
```gitignore
node_modules/
.env
.DS_Store

```

