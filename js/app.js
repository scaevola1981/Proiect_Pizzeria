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

function renderProducts() {
    const container = document.getElementById('produse-container');
    container.innerHTML = '';
    
    if (produse.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%;">Meniul este momentan gol.</p>';
        return;
    }
    
    produse.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <h3>${p.nume}</h3>
            <p>${p.descriere || ''}</p>
            <h4>${p.pret} Lei</h4>
            <button onclick="addToCart(${p.id})">Adaugă în coș</button>
        `;
        container.appendChild(div);
    });
}

window.addToCart = function(productId) {
    const product = produse.find(p => p.id === productId);
    const existingItem = cart.find(item => item.product.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ product, quantity: 1 });
    }
    
    updateCartUI();
};

window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.product.id !== productId);
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
        cart.forEach(item => {
            total += item.product.pret * item.quantity;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div>
                    <strong>${item.quantity}x ${item.product.nume}</strong>
                </div>
                <div>
                    <span>${item.product.pret * item.quantity} Lei</span>
                    <button class="btn-secondary" style="width: auto; padding: 5px 10px; margin-left: 10px;" onclick="removeFromCart(${item.product.id})">X</button>
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
