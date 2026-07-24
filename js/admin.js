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
const imageInput = document.getElementById('imagine_upload');
const imagePreview = document.getElementById('image-preview');
const previewPlaceholder = document.getElementById('preview-placeholder');

if (imageInput) {
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
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
            if (imagePreview) {
                imagePreview.src = '';
                imagePreview.style.display = 'none';
                previewPlaceholder.style.display = 'block';
            }
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
