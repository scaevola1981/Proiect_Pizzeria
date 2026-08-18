// ==========================================
// ADMIN.JS — Panou Administrare Meniu
// Autentificare cu Supabase Auth + Securitate
// ==========================================

// ==========================================
// AUTENTIFICARE ADMIN
// ==========================================

window.handleAdminLogin = async function () {
    const pinInput = document.getElementById('admin-pin');
    const pin = pinInput ? pinInput.value.trim() : '';
    const err = document.getElementById('login-error');
    const btn = document.getElementById('btn-login');

    if (!pin) {
        err.style.display = 'block';
        err.innerText = 'Introduceți PIN-ul Admin (4 cifre).';
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se deblochează...';

    // Verificăm dacă există deja o sesiune Supabase (de pe receptie.html)
    let { authenticated } = await window.getAuthSession();

    // Dacă nu este autentificat deloc, cerem email + parolă
    if (!authenticated) {
        const credentialsFields = document.getElementById('credentials-fields');
        if (credentialsFields) credentialsFields.style.display = 'block';

        const email = document.getElementById('admin-email').value.trim();
        const pwd = document.getElementById('admin-password').value;

        if (!email || !pwd) {
            err.style.display = 'block';
            err.innerText = 'Autentificați-vă cu Email și Parolă mai sus, apoi puneți PIN-ul.';
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-unlock"></i> Deblochează Meniu';
            return;
        }

        const loginResult = await window.loginAdmin(email, pwd);
        if (!loginResult.success) {
            err.style.display = 'block';
            err.innerText = 'Email sau parolă incorectă: ' + (loginResult.error || 'Verificați datele.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-unlock"></i> Deblochează Meniu';
            return;
        }
        authenticated = true;
    }

    // Verificare PIN admin
    try {
        const pinResult = await window.verifyAdminPin(pin);

        if (pinResult.valid) {
            // Curățăm orice blocare veche din localStorage
            if (typeof window.resetLoginAttempts === 'function') {
                window.resetLoginAttempts();
            }

            sessionStorage.setItem('admin_pin_verified', 'true');
            err.style.display = 'none';
            document.getElementById('login-overlay').style.display = 'none';
            loadAdminProducts();
            window.loadStoreSchedule();
        } else {
            err.style.display = 'block';
            err.innerText = 'PIN Admin incorect. Încercați din nou (sau folosiți parola veche "bella").';
        }
    } catch (e) {
        console.error('Eroare la verificare PIN:', e);
        err.style.display = 'block';
        err.innerText = 'Eroare la verificarea PIN-ului. Încercați din nou.';
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-unlock"></i> Deblochează Meniu';
};

// ==========================================
// ÎNCĂRCARE PRODUSE
// ==========================================

let allAdminProducts = [];
let adminCurrentTab = 'restaurant';

window.loadAdminProducts = async function loadAdminProducts() {
    const container = document.getElementById('admin-products-container');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center; width:100%;"><i class="fas fa-spinner fa-spin"></i> Se încarcă meniul...</p>';

    // Așteptăm inițializarea clientului Supabase dacă e necesar
    let retries = 0;
    while (!window.supabaseClient && retries < 15) {
        await new Promise(r => setTimeout(r, 200));
        retries++;
    }

    if (!window.supabaseClient) {
        container.innerHTML = '<p style="text-align:center; width:100%; color:red;">Eroare: Conexiunea la baza de date nu a putut fi inițializată. Reîncărcați pagina.</p>';
        return;
    }

    const { data, error } = await window.supabaseClient.from('meniu').select('*').order('id', { ascending: false });

    if (error) {
        console.error("Eroare la preluarea meniului din Supabase:", error);
        container.innerHTML = '<p style="text-align:center; width:100%; color:red;">Eroare la încărcarea meniului: ' + escapeHTML(error.message || '') + '</p>';
        return;
    }

    allAdminProducts = data || [];
    renderAdminProducts();
};

async function loadAdminProducts() {
    return window.loadAdminProducts();
}

function getDefaultProductImage() {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80';
}

function renderAdminProducts() {
    const container = document.getElementById('admin-products-container');
    const navBar = document.getElementById('admin-subcategory-nav');
    if (!container) return;

    container.innerHTML = '';
    if (navBar) {
        navBar.innerHTML = '';
        navBar.classList.add('hidden');
    }

    if (allAdminProducts.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%;">Meniul este momentan gol.</p>';
        return;
    }

    // 1. Filtrare pe tab curent (Restaurant vs Bar)
    let filteredProducts = allAdminProducts.filter(p => {
        const pCat = (p.categorie || '').toLowerCase().trim();
        let isBautura = false;
        if (pCat === 'bar' || pCat === 'bautura' || pCat === 'bauturi') {
            isBautura = true;
        } else if (pCat === 'restaurant' || pCat === 'mancare') {
            isBautura = false;
        } else {
            const catStr = ((p.categorie || '') + ' ' + (p.nume || '') + ' ' + (p.descriere || '')).toLowerCase();
            isBautura = /\b(bautura|bauturi|băutură|băuturi|suc|apa|apă|coca|cola|fanta|sprite|pepsi|cafea|bere|vin|fresh|limonada|cocktail|shot|energizant|vodca|vodcă|whisky|gin|rom|tequila|cognac|brandy|lichior|bitter|prosecco|spumant)\b/i.test(catStr);
        }

        return adminCurrentTab === 'bar' ? isBautura : !isBautura;
    });

    if (filteredProducts.length === 0) {
        container.innerHTML = `<p style="text-align:center; width:100%; margin-top: 20px;">Niciun produs în secțiunea <strong>${adminCurrentTab === 'bar' ? 'Bar' : 'Restaurant'}</strong>.</p>`;
        return;
    }

    // 2. Grupare pe subcategorii (extrase din descriere "Subcategorie | detalii" sau potrivire directă)
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

    // 3. Generare Navigație Orizontală Subcategorii
    if (navBar && sortedSubcats.length > 1) {
        navBar.classList.remove('hidden');

        sortedSubcats.forEach(cat => {
            const btn = document.createElement('a');
            btn.href = `#admin-cat-${escapeHTML(cat.replace(/\s+/g, '-'))}`;
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

    // 4. Randare grupuri de produse (pe categorii cu titluri clare)
    for (const catName of sortedSubcats) {
        const prods = grouped[catName];
        const sectionId = `admin-cat-${escapeHTML(catName.replace(/\s+/g, '-'))}`;

        const section = document.createElement('div');
        section.className = 'category-section';
        section.id = sectionId;

        const sectionTitle = document.createElement('h2');
        sectionTitle.style.color = '#f5b041';
        sectionTitle.style.borderBottom = '1px solid rgba(245,176,65,0.3)';
        sectionTitle.style.paddingBottom = '5px';
        sectionTitle.style.marginBottom = '15px';
        sectionTitle.innerHTML = `<i class="fas fa-layer-group"></i> ${escapeHTML(catName)}`;
        section.appendChild(sectionTitle);

        const grid = document.createElement('div');
        grid.className = 'products-grid';

        prods.forEach(p => {
            const imageUrl = p.imagine_url || getDefaultProductImage();
            const isBautura = adminCurrentTab === 'bar' || (p.categorie && p.categorie.toLowerCase() === 'bar');
            const priceHTML = `<h4 style="color: #f5b041; margin-bottom: 15px;">${escapeHTML(String(p.pret))} Lei <small style="font-size:0.8rem; opacity:0.7;">(${isBautura ? 'Bar' : 'Restaurant'})</small></h4>`;

            const imgStyle = isBautura ?
                'width: 100%; height: 180px; object-fit: contain; background: #ffffff; border-radius: 12px; padding: 8px; margin-bottom: 15px; box-sizing: border-box;' :
                'width: 100%; height: 160px; object-fit: cover; border-radius: 12px; margin-bottom: 15px;';

            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.background = 'rgba(255, 255, 255, 0.1)';
            card.style.border = '1px solid rgba(255, 255, 255, 0.2)';

            card.innerHTML = `
                <img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(p.nume)}" style="${imgStyle}">
                <h3 style="color: #fff;">${escapeHTML(p.nume)}</h3>
                <p style="color: #cbd5e1; flex-grow: 1; margin-bottom: 15px; font-size: 0.9rem;">${p.displayDesc || '-'}</p>
                ${priceHTML}
                <div style="display: flex; gap: 10px; margin-top: auto;">
                    <button onclick="window.openEditModal('${p.id}')" style="flex: 1; background: #4284DB; background: -webkit-linear-gradient(to right, #29EAC4, #4284DB); background: linear-gradient(to right, #29EAC4, #4284DB); color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.3); border: none; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 12px rgba(41, 234, 196, 0.35);"><i class="fas fa-edit"></i> Editează</button>
                    <button onclick="window.deleteProduct(${parseInt(p.id)})" style="flex: 1; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; border: none; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;"><i class="fas fa-trash"></i> Șterge</button>
                </div>
            `;
            grid.appendChild(card);
        });

        section.appendChild(grid);
        container.appendChild(section);
    }
}

// ==========================================
// FORMULAR ADĂUGARE PRODUS
// ==========================================

const form = document.getElementById('add-product-form');
const imageInput = document.getElementById('imagine_upload');
const imagePreview = document.getElementById('image-preview');
const previewPlaceholder = document.getElementById('preview-placeholder');

if (imageInput) {
    imageInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            // Validare fișier înainte de preview
            const validation = window.validateFileUpload(file);
            if (!validation.valid) {
                alert(validation.error);
                imageInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (evt) {
                imagePreview.src = evt.target.result;
                imagePreview.style.display = 'block';
                previewPlaceholder.style.display = 'none';
            }
            reader.readAsDataURL(file);
        } else {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
            previewPlaceholder.style.display = 'block';
        }
    });
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Verificăm autentificarea la fiecare operațiune
        const { authenticated } = await window.getAuthSession();
        if (!authenticated) {
            alert('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
            window.location.reload();
            return;
        }

        const nume = document.getElementById('nume').value.trim();
        const descriere = document.getElementById('descriere').value.trim();
        const categorieSelect = document.getElementById('categorie');
        const categorie = categorieSelect ? categorieSelect.value : 'restaurant';
        const fileInput = document.getElementById('imagine_upload');

        const pret = parseFloat(document.getElementById('pret').value);
        if (!pret || pret <= 0 || pret > 9999) {
            alert("Prețul trebuie să fie între 1 și 9999 Lei.");
            return;
        }

        if (!nume) {
            alert("Completați numele!");
            return;
        }

        // Validare lungime
        if (nume.length > 100) {
            alert("Numele produsului nu poate depăși 100 de caractere.");
            return;
        }
        if (descriere.length > 500) {
            alert("Descrierea nu poate depăși 500 de caractere.");
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se salvează...';

        let imagine_url = null;

        if (fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];

            // Validare fișier
            const validation = window.validateFileUpload(file);
            if (!validation.valid) {
                alert(validation.error);
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Adaugă în Meniu';
                return;
            }

            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
                .from('imagini_produse')
                .upload(fileName, file);

            if (uploadError) {
                console.error("Eroare la upload poză:", uploadError);
                alert("Nu s-a putut încărca poza. Se va salva produsul fără poză.");
            } else {
                const { data: publicUrlData } = window.supabaseClient.storage
                    .from('imagini_produse')
                    .getPublicUrl(fileName);

                imagine_url = publicUrlData.publicUrl;
            }
        }

        const { error } = await window.supabaseClient
            .from('meniu')
            .insert([{ nume, descriere, pret, categorie, imagine_url }]);

        if (error) {
            console.error("Eroare la adăugare:", error);
            alert("Eroare la adăugarea produsului: " + error.message);
        } else {
            form.reset();
            if (imagePreview) {
                imagePreview.src = '';
                imagePreview.style.display = 'none';
                previewPlaceholder.style.display = 'block';
            }

            loadAdminProducts();
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Adaugă în Meniu';
    });
}

// ==========================================
// ȘTERGERE PRODUS — Modal Confirmare
// ==========================================

let productToDeleteId = null;

window.deleteProduct = (id) => {
    productToDeleteId = id;
    const modal = document.getElementById('delete-confirm-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
};

window.closeDeleteModal = () => {
    productToDeleteId = null;
    const modal = document.getElementById('delete-confirm-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

window.confirmDeleteProduct = async () => {
    if (!productToDeleteId) return;

    const id = productToDeleteId;
    window.closeDeleteModal();

    // Verificăm autentificarea
    const { authenticated } = await window.getAuthSession();
    if (!authenticated) {
        alert('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
        window.location.reload();
        return;
    }

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

// ==========================================
// EDITARE PRODUS — Modal & Logica de Salvare
// ==========================================

let editingProduct = null;

window.openEditModal = (id) => {
    editingProduct = allAdminProducts.find(p => String(p.id) === String(id));
    if (!editingProduct) return;

    document.getElementById('edit-product-id').value = editingProduct.id;
    document.getElementById('edit-nume').value = editingProduct.nume || '';
    document.getElementById('edit-categorie').value = editingProduct.categorie || '';
    document.getElementById('edit-pret').value = editingProduct.pret || '';
    document.getElementById('edit-descriere').value = editingProduct.descriere || '';

    const preview = document.getElementById('edit-image-preview');
    if (preview) {
        preview.src = editingProduct.imagine_url || getDefaultProductImage();
    }

    const fileInput = document.getElementById('edit-imagine_upload');
    if (fileInput) fileInput.value = '';

    const fileNameLabel = document.getElementById('edit-file-name');
    if (fileNameLabel) fileNameLabel.innerText = 'Se păstrează imaginea curentă dacă nu alegeți alta.';

    const modal = document.getElementById('edit-product-modal');
    if (modal) modal.classList.remove('hidden');
};

window.closeEditModal = () => {
    editingProduct = null;
    const modal = document.getElementById('edit-product-modal');
    if (modal) modal.classList.add('hidden');
};

// Listener preview imagine noua la editare
const editImageInput = document.getElementById('edit-imagine_upload');
if (editImageInput) {
    editImageInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const validation = window.validateFileUpload(file);
            if (!validation.valid) {
                alert(validation.error);
                editImageInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (evt) {
                const preview = document.getElementById('edit-image-preview');
                if (preview) preview.src = evt.target.result;
            };
            reader.readAsDataURL(file);

            const fileNameLabel = document.getElementById('edit-file-name');
            if (fileNameLabel) fileNameLabel.innerText = `Imagine nouă: ${file.name}`;
        }
    });
}

// Handler salvare editare produs
const editForm = document.getElementById('edit-product-form');
if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const { authenticated } = await window.getAuthSession();
        if (!authenticated) {
            alert('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
            window.location.reload();
            return;
        }

        const id = document.getElementById('edit-product-id').value;
        const nume = document.getElementById('edit-nume').value.trim();
        const descriere = document.getElementById('edit-descriere').value.trim();
        const categorie = document.getElementById('edit-categorie').value.trim();
        const pret = parseFloat(document.getElementById('edit-pret').value);

        if (!pret || pret <= 0 || pret > 9999) {
            alert("Prețul trebuie să fie între 1 și 9999 Lei.");
            return;
        }
        if (!nume) {
            alert("Completați numele!");
            return;
        }
        if (nume.length > 100) {
            alert("Numele produsului nu poate depăși 100 de caractere.");
            return;
        }
        if (descriere.length > 500) {
            alert("Descrierea nu poate depăși 500 de caractere.");
            return;
        }

        const btn = editForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se salvează...';

        let imagine_url = editingProduct ? editingProduct.imagine_url : null;
        const fileInput = document.getElementById('edit-imagine_upload');

        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const validation = window.validateFileUpload(file);
            if (!validation.valid) {
                alert(validation.error);
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Salvează Modificările';
                return;
            }

            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
                .from('imagini_produse')
                .upload(fileName, file);

            if (uploadError) {
                console.error("Eroare la upload poză:", uploadError);
                alert("Nu s-a putut încărca noua poză. Se păstrează poza curentă.");
            } else {
                const { data: publicUrlData } = window.supabaseClient.storage
                    .from('imagini_produse')
                    .getPublicUrl(fileName);

                imagine_url = publicUrlData.publicUrl;
            }
        }

        const { error } = await window.supabaseClient
            .from('meniu')
            .update({ nume, descriere, pret, categorie, imagine_url })
            .eq('id', id);

        if (error) {
            console.error("Eroare la actualizare:", error);
            alert("Eroare la salvarea modificărilor: " + error.message);
        } else {
            window.closeEditModal();
            loadAdminProducts();
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Salvează Modificările';
    });
}

// ==========================================
// PROGRAM DE FUNCȚIONARE (STORE SCHEDULE)
// ==========================================

window.loadStoreSchedule = async function() {
    try {
        const { data: openData } = await window.supabaseClient.from('setari').select('value').eq('key', 'store_open_time').maybeSingle();
        const { data: closeData } = await window.supabaseClient.from('setari').select('value').eq('key', 'store_close_time').maybeSingle();
        const { data: forceData } = await window.supabaseClient.from('setari').select('value').eq('key', 'store_force_close').maybeSingle();

        if (openData && openData.value) document.getElementById('store-open-time').value = openData.value;
        if (closeData && closeData.value) document.getElementById('store-close-time').value = closeData.value;
        if (forceData && forceData.value === 'true') document.getElementById('store-force-close').checked = true;
    } catch (e) {
        console.error("Eroare la încărcarea programului", e);
    }
};

window.saveStoreSchedule = async function() {
    const btn = document.getElementById('btn-save-schedule');
    const openTime = document.getElementById('store-open-time').value;
    const closeTime = document.getElementById('store-close-time').value;
    const forceClose = document.getElementById('store-force-close').checked ? 'true' : 'false';

    if (!openTime || !closeTime) {
        alert("Vă rugăm să setați ambele ore (Deschidere și Închidere).");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se salvează...';

    try {
        await window.supabaseClient.from('setari').upsert({ key: 'store_open_time', value: openTime }, { onConflict: 'key' });
        await window.supabaseClient.from('setari').upsert({ key: 'store_close_time', value: closeTime }, { onConflict: 'key' });
        await window.supabaseClient.from('setari').upsert({ key: 'store_force_close', value: forceClose }, { onConflict: 'key' });

        alert("Programul a fost salvat cu succes! Aplicațiile clienților vor respecta acum noul program.");
    } catch (e) {
        console.error("Eroare la salvarea programului", e);
        alert("Eroare la salvare. Încercați din nou.");
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Salvează Programul';
};

// ==========================================
// PREVIZUALIZARE IMAGINE UPLOAD
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    const { authenticated } = await window.getAuthSession();
    const pinVerified = sessionStorage.getItem('admin_pin_verified') === 'true';

    const credentialsFields = document.getElementById('credentials-fields');
    const loginSubtitle = document.getElementById('login-subtitle');
    const pinInput = document.getElementById('admin-pin');

    if (authenticated && pinVerified) {
        document.getElementById('login-overlay').style.display = 'none';
        loadAdminProducts();
    } else if (authenticated && !pinVerified) {
        // Are sesiune Supabase (logat la recepție) -> cere DOAR PIN-ul
        document.getElementById('login-overlay').style.display = 'flex';
        const loadingSpinner = document.getElementById('auth-loading');
        const loginForm = document.getElementById('login-form-content');
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';

        if (credentialsFields) credentialsFields.style.display = 'none';
        if (loginSubtitle) loginSubtitle.innerText = 'Introduceți PIN-ul secret de Admin pentru a debloca.';
        if (pinInput) pinInput.focus();
    } else {
        // Nu are nicio sesiune -> cere Email + Parolă + PIN
        document.getElementById('login-overlay').style.display = 'flex';
        const loadingSpinner = document.getElementById('auth-loading');
        const loginForm = document.getElementById('login-form-content');
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';

        if (credentialsFields) credentialsFields.style.display = 'block';
        if (loginSubtitle) loginSubtitle.innerText = 'Autentificați-vă cu Email, Parolă și PIN Admin.';
    }

    // Enter pe câmpuri de login
    const pwdInput = document.getElementById('admin-password');
    const emailInput = document.getElementById('admin-email');
    if (pwdInput) {
        pwdInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') window.handleAdminLogin();
        });
    }
    if (emailInput) {
        emailInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') window.handleAdminLogin();
        });
    }
    if (pinInput) {
        pinInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') window.handleAdminLogin();
        });
    }

    // Buton Înapoi la Recepție — blochează PIN-ul Admin și se întoarce la Recepție fără de-autentificare
    const backBtn = document.getElementById('btn-back-to-owner') || document.getElementById('btn-logout');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            sessionStorage.removeItem('admin_pin_verified');
            window.location.href = 'receptie.html';
        });
    }

    // Tab-uri de filtrare Restaurant vs Bar în Admin
    const adminTabRestaurant = document.getElementById('admin-tab-restaurant');
    const adminTabBar = document.getElementById('admin-tab-bar');

    function setAdminTab(tab) {
        adminCurrentTab = tab;
        if (tab === 'bar') {
            adminTabBar.style.background = '#fff';
            adminTabBar.style.color = '#333';
            adminTabRestaurant.style.background = 'transparent';
            adminTabRestaurant.style.color = '#fff';
        } else {
            adminTabRestaurant.style.background = '#fff';
            adminTabRestaurant.style.color = '#333';
            adminTabBar.style.background = 'transparent';
            adminTabBar.style.color = '#fff';
        }
        renderAdminProducts();
    }

    if (adminTabRestaurant && adminTabBar) {
        adminTabRestaurant.addEventListener('click', () => setAdminTab('restaurant'));
        adminTabBar.addEventListener('click', () => setAdminTab('bar'));
    }

    // Logica pentru schimbarea parolei (cu Supabase Auth)
    const changePwdForm = document.getElementById('change-password-form');
    if (changePwdForm) {
        changePwdForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPwd = document.getElementById('new-pwd').value;
            const confirmPwd = document.getElementById('confirm-pwd').value;
            const msg = document.getElementById('pwd-change-msg');

            if (newPwd !== confirmPwd) {
                msg.style.display = 'block';
                msg.style.color = '#e74c3c';
                msg.innerText = "Parolele nu corespund!";
                return;
            }

            if (newPwd.length < 6) {
                msg.style.display = 'block';
                msg.style.color = '#e74c3c';
                msg.innerText = "Parola trebuie să aibă minim 6 caractere.";
                return;
            }

            const result = await window.changeAdminPassword(newPwd);
            if (result.success) {
                msg.style.display = 'block';
                msg.style.color = '#2ecc71';
                msg.innerText = "Parola a fost schimbată cu succes!";
                changePwdForm.reset();
                setTimeout(() => msg.style.display = 'none', 3000);
            } else {
                msg.style.display = 'block';
                msg.style.color = '#e74c3c';
                msg.innerText = "Eroare: " + (result.error || "Nu s-a putut schimba parola.");
            }
        });
    }

    // Logica pentru schimbarea PIN-ului Admin
    const changePinForm = document.getElementById('change-pin-form');
    if (changePinForm) {
        changePinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPin = document.getElementById('new-pin').value;
            const confirmPin = document.getElementById('confirm-pin').value;
            const msg = document.getElementById('pin-change-msg');

            if (newPin !== confirmPin) {
                msg.style.display = 'block';
                msg.style.color = '#e74c3c';
                msg.innerText = "PIN-urile nu corespund!";
                return;
            }

            if (newPin.length < 4) {
                msg.style.display = 'block';
                msg.style.color = '#e74c3c';
                msg.innerText = "PIN-ul trebuie să aibă minim 4 caractere.";
                return;
            }

            const success = await window.updateAdminPin(newPin);
            if (success) {
                msg.style.display = 'block';
                msg.style.color = '#2ecc71';
                msg.innerText = "PIN-ul Admin a fost schimbat cu succes!";
                changePinForm.reset();
                setTimeout(() => msg.style.display = 'none', 3000);
            } else {
                msg.style.display = 'block';
                msg.style.color = '#e74c3c';
                msg.innerText = "Eroare la salvarea PIN-ului.";
            }
        });
    }
});
