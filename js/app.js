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
        "Vinuri", "Cocktailuri", "Vodcă", "Whisky", "Gin", "Rom", "Tequila", "Brandy / Cognac",
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
        "Vinuri", "Vin Alb", "Vin Rosé", "Vin Roșu", "Spumante", "Cocktailuri", "Vodcă", "Whisky", "Gin", "Rom", "Tequila", "Brandy / Cognac",
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

            card.innerHTML = `
                <img src="${escapeHTML(imageUrl)}" alt="${safeName}" style="${imgStyle}">
                <h3>${safeName}</h3>
                <p>${p.displayDesc}</p>
                <h4 style="margin-top: auto; padding-top: 15px; font-size: 1.1rem; color: #f5b041;">${priceDisplay}</h4>
            `;

            grid.appendChild(card);
        });

        section.appendChild(grid);
        container.appendChild(section);
    }
}
