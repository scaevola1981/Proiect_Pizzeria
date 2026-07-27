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

    allAdminProducts = data || [];
    renderAdminProducts();
}

function getDefaultProductImage() {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80';
}

function renderAdminProducts() {
    const container = document.getElementById('admin-products-container');
    if (!container) return;
    container.innerHTML = '';

    if (allAdminProducts.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%;">Meniul este momentan gol.</p>';
        return;
    }

    let count = 0;

    allAdminProducts.forEach(p => {
        const catStr = ((p.categorie || '') + ' ' + (p.nume || '')).toLowerCase();
        const isBautura = p.categorie === 'bar' || catStr.includes('bautur') || catStr.includes('băutur') || catStr.includes('suc') || catStr.includes('apa') || catStr.includes('apă') || catStr.includes('coca') || catStr.includes('cola') || catStr.includes('pepsi') || catStr.includes('fanta') || catStr.includes('sprite') || catStr.includes('cafea') || catStr.includes('bere') || catStr.includes('vin');

        if (adminCurrentTab === 'bar' && !isBautura) return;
        if (adminCurrentTab === 'restaurant' && isBautura) return;

        const imageUrl = p.imagine_url || getDefaultProductImage();
        const div = document.createElement('div');
        div.className = 'product-card';
        div.style.background = 'rgba(255, 255, 255, 0.1)';
        div.style.border = '1px solid rgba(255, 255, 255, 0.2)';

        let priceHTML = `<h4 style="color: #f5b041; margin-bottom: 15px;">${escapeHTML(String(p.pret))} Lei <small style="font-size:0.8rem; opacity:0.7;">(${isBautura ? 'Bar' : 'Restaurant'})</small></h4>`;
        
        if (p.variante && p.variante.length > 0) {
            let variantsStr = p.variante.map(v => `${escapeHTML(v.nume)}: ${escapeHTML(String(v.pret))} Lei`).join('<br>');
            priceHTML = `<h4 style="color: #f5b041; margin-bottom: 5px; font-size: 0.9rem;">Variante:</h4><p style="color: #cbd5e1; font-size: 0.85rem; margin-bottom: 15px;">${variantsStr}</p>`;
        }

        // XSS Protection — escapăm toate datele din DB
        div.innerHTML = `
            <img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(p.nume)}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 12px; margin-bottom: 15px;">
            <h3 style="color: #fff;">${escapeHTML(p.nume)}</h3>
            <p style="color: #cbd5e1; flex-grow: 1; margin-bottom: 15px; font-size: 0.9rem;">${escapeHTML(p.descriere || '-')}</p>
            ${priceHTML}
            <button onclick="window.deleteProduct(${parseInt(p.id)})" style="margin-top:auto; background:#e74c3c; color:white;"><i class="fas fa-trash"></i> Șterge Produs</button>
        `;
        container.appendChild(div);
        count++;
    });

    if (count === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; margin-top: 20px;">Niciun produs în această categorie.</p>';
    }
}

// ==========================================
// FORMULAR ADĂUGARE PRODUS
// ==========================================

window.toggleVariantsUI = function() {
    const hasVariants = document.getElementById('has-variants').checked;
    const pretContainer = document.getElementById('pret-container');
    const pretInput = document.getElementById('pret');
    const variantsContainer = document.getElementById('variants-container');

    if (hasVariants) {
        pretContainer.style.display = 'none';
        pretInput.removeAttribute('required');
        variantsContainer.style.display = 'block';
        if (document.getElementById('variants-list').children.length === 0) {
            window.addVariantRow();
        }
    } else {
        pretContainer.style.display = 'block';
        pretInput.setAttribute('required', 'true');
        variantsContainer.style.display = 'none';
    }
};

window.addVariantRow = function() {
    const list = document.getElementById('variants-list');
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '10px';
    row.className = 'variant-row';
    row.innerHTML = `
        <input type="text" class="modern-input variant-name" placeholder="ex: Mică (26cm)" required style="flex: 2; padding: 8px;">
        <input type="number" class="modern-input variant-price" placeholder="Preț" required min="1" step="0.5" style="flex: 1; padding: 8px;">
        <button type="button" onclick="this.parentElement.remove()" class="btn-secondary" style="padding: 8px; border-radius: 8px;"><i class="fas fa-trash"></i></button>
    `;
    list.appendChild(row);
};

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
        const pret = parseFloat(document.getElementById('pret').value);
        const categorieSelect = document.getElementById('categorie');
        const categorie = categorieSelect ? categorieSelect.value : 'restaurant';
        const fileInput = document.getElementById('imagine_upload');
        const hasVariants = document.getElementById('has-variants').checked;

        let pret = 0;
        let variante = [];

        if (hasVariants) {
            const rows = document.querySelectorAll('.variant-row');
            if (rows.length === 0) {
                alert("Adăugați cel puțin o mărime/variantă!");
                return;
            }
            rows.forEach(row => {
                const vName = row.querySelector('.variant-name').value.trim();
                const vPrice = parseFloat(row.querySelector('.variant-price').value);
                if (vName && vPrice > 0) {
                    variante.push({ nume: vName, pret: vPrice });
                }
            });
            if (variante.length === 0) {
                alert("Completați corect numele și prețul pentru variante!");
                return;
            }
            pret = variante[0].pret; // Prețul de bază e cel al primei variante
        } else {
            pret = parseFloat(document.getElementById('pret').value);
            if (!pret || pret <= 0 || pret > 9999) {
                alert("Prețul trebuie să fie între 1 și 9999 Lei.");
                return;
            }
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
            .insert([{ nume, descriere, pret, categorie, imagine_url, variante }]);

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
            if (document.getElementById('has-variants').checked) {
                document.getElementById('has-variants').checked = false;
                window.toggleVariantsUI();
                document.getElementById('variants-list').innerHTML = '';
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
        if (credentialsFields) credentialsFields.style.display = 'none';
        if (loginSubtitle) loginSubtitle.innerText = 'Introduceți PIN-ul secret de Admin pentru a debloca.';
        if (pinInput) pinInput.focus();
    } else {
        // Nu are nicio sesiune -> cere Email + Parolă + PIN
        document.getElementById('login-overlay').style.display = 'flex';
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
