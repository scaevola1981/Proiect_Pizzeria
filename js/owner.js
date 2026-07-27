// ==========================================
// OWNER.JS — Panou Recepție
// Autentificare cu Supabase Auth + Securitate
// ==========================================

let allOrders = [];

// ==========================================
// AUTENTIFICARE OWNER
// ==========================================

async function initOwnerAuth() {
    const loginOverlay = document.getElementById('login-overlay');
    const loginBtn = document.getElementById('btn-owner-login');
    const logoutBtn = document.getElementById('btn-owner-logout');
    const emailInput = document.getElementById('owner-email');
    const pwdInput = document.getElementById('owner-password');
    const errMsg = document.getElementById('owner-login-error');

    // Verificăm dacă e deja autentificat
    const { authenticated } = await window.getAuthSession();
    if (authenticated) {
        loginOverlay.style.display = 'none';
        loadOwnerOrders();
    }

    // Handler login
    async function handleOwnerLogin() {
        const email = emailInput.value.trim();
        const pwd = pwdInput.value;

        // Rate limiting
        const rateCheck = window.checkLoginRateLimit();
        if (rateCheck.blocked) {
            errMsg.style.display = 'block';
            errMsg.innerText = `Prea multe încercări. Așteptați ${rateCheck.remainingSeconds} secunde.`;
            return;
        }

        if (!email || !pwd) {
            errMsg.style.display = 'block';
            errMsg.innerText = 'Completați email-ul și parola.';
            return;
        }

        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se autentifică...';

        const result = await window.loginAdmin(email, pwd);

        if (result.success) {
            window.resetLoginAttempts();
            errMsg.style.display = 'none';
            loginOverlay.style.display = 'none';
            loadOwnerOrders();
        } else {
            const failResult = window.recordFailedLogin();
            errMsg.style.display = 'block';
            if (failResult.blocked) {
                errMsg.innerText = 'Cont blocat temporar. Așteptați 5 minute.';
            } else {
                errMsg.innerText = `Email sau parolă incorectă. Mai aveți ${failResult.attemptsLeft} încercări.`;
            }
        }

        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Autentificare';
    }

    if (loginBtn) loginBtn.addEventListener('click', handleOwnerLogin);
    if (pwdInput) pwdInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleOwnerLogin(); });
    if (emailInput) emailInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleOwnerLogin(); });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await window.supabaseClient.auth.signOut();
            window.location.reload();
        });
    }
}

// ==========================================
// ÎNCĂRCARE COMENZI
// ==========================================

async function loadOwnerOrders() {
    if (!window.supabaseClient) return;

    // Verificăm autentificarea
    const { authenticated } = await window.getAuthSession();
    if (!authenticated) {
        document.getElementById('login-overlay').style.display = 'flex';
        return;
    }

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

// ==========================================
// RENDER COMENZI — cu XSS Protection
// ==========================================

window.renderOwnerOrders = function () {
    const container = document.getElementById('comenzi-container');
    if (!container) return;

    container.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let totalRevenue = 0;

    if (allOrders.length === 0) {
        container.innerHTML = '<p>Nicio comandă înregistrată.</p>';
        return;
    }

    allOrders.forEach(order => {
        const orderDate = new Date(order.created_at);
        const isToday = orderDate >= today;

        if (isToday && order.status !== 'finalizata') {
            totalRevenue += parseFloat(order.total) || 0;
        }

        if (order.status === 'finalizata' || !isToday) {
            return;
        }

        const div = document.createElement('div');
        div.className = 'modern-card';

        let headerGradient = "linear-gradient(135deg, #f5b041 0%, #e67e22 100%)";
        if (order.status === 'in_preparare') headerGradient = "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)";
        if (order.status === 'servita') headerGradient = "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)";

        // XSS Protection — escapăm toate datele
        let itemsStr = order.detalii_comanda && Array.isArray(order.detalii_comanda) ? order.detalii_comanda.map(i => {
            let noteHtml = i.notes ? `<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${escapeHTML(i.notes)}</small>` : '';
            return `<b>${escapeHTML(String(i.quantity))}x</b> ${escapeHTML(i.product.nume)}${noteHtml}`;
        }).join('<br><br>') : 'Fără detalii';

        const dateStr = new Date(order.created_at).toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' });
        const timeStr = new Date(order.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

        let statusLabel = order.status.toUpperCase();
        let statusColor = '#f39c12';

        if (order.status === 'noua') {
            statusLabel = 'NOUĂ';
            statusColor = '#f39c12';
        } else if (order.status === 'in_preparare') {
            statusLabel = 'ÎN PREPARARE';
            statusColor = '#2ecc71';
        } else if (order.status === 'servita') {
            statusLabel = 'SERVITĂ';
            statusColor = '#95a5a6';
        }

        let buttonHtml = '';
        if (order.status === 'noua') {
            buttonHtml = `<button class="modern-card-btn" onclick="window.updateOrderStatus(${parseInt(order.id)}, 'in_preparare')"><i class="fas fa-check"></i> Acceptă Comanda</button>`;
        } else if (order.status === 'in_preparare') {
            buttonHtml = `<button class="modern-card-btn success" onclick="window.updateOrderStatus(${parseInt(order.id)}, 'servita')"><i class="fas fa-flag-checkered"></i> Încheiere Comandă</button>`;
        } else if (order.status === 'servita') {
            buttonHtml = `<button class="modern-card-btn disabled" disabled><i class="fas fa-check-circle"></i> Comanda Încheiată</button>`;
        }

        div.innerHTML = `
            <div class="modern-card-header" style="background: url('/img/bella-roma.png') center/cover; position: relative;">
                <div class="modern-card-tab">Masa ${escapeHTML(String(order.numar_masa))}</div>
                <span class="modern-card-price" style="position: absolute; bottom: 10px; right: 10px;">${escapeHTML(String(order.total))} Lei</span>
            </div>
            <div class="modern-card-body">
                <div class="modern-card-title-row">
                    <h3>Comanda #${parseInt(order.id)}</h3>
                </div>
                <div class="modern-card-desc">
                    ${itemsStr}
                </div>
                <div class="modern-card-tags">
                    <span class="modern-tag">Ora ${escapeHTML(timeStr)}</span>
                    <span class="modern-tag">${escapeHTML(dateStr)}</span>
                    <span class="modern-tag" style="background: ${statusColor}; color: white;">${escapeHTML(statusLabel)}</span>
                </div>
            </div>
            ${buttonHtml}
        `;
        container.appendChild(div);
    });

    const todayNonFinalOrders = allOrders.filter(o => {
        const d = new Date(o.created_at);
        return d >= today && o.status !== 'finalizata';
    });

    if (todayNonFinalOrders.length > 0 || totalRevenue > 0) {
        const revDiv = document.createElement('div');
        revDiv.style.gridColumn = '1 / -1';
        revDiv.innerHTML = `<h2 style="margin-bottom:20px; color:#2ecc71; text-align: center;">Încasări Azi: ${totalRevenue.toFixed(2)} Lei</h2>`;
        container.insertBefore(revDiv, container.firstChild);
    }

    const endDayBtn = document.getElementById('btn-incheiere-zi');
    if (endDayBtn) {
        endDayBtn.style.display = todayNonFinalOrders.length > 0 ? 'inline-block' : 'none';
    }

    window.renderHistory();
};

// ==========================================
// ISTORIC — cu XSS Protection
// ==========================================

window.renderHistory = function () {
    const content = document.getElementById('history-content');
    if (!content) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = allOrders.filter(order => new Date(order.created_at) >= sevenDaysAgo);

    let html = '';
    let lastDate = '';

    if (recentOrders.length === 0) {
        html = '<p style="text-align:center; margin-top:20px;">Nu există comenzi în ultimele 7 zile.</p>';
    } else {
        const dailyTotals = {};
        recentOrders.forEach(o => {
            const fullDateStr = new Date(o.created_at).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            dailyTotals[fullDateStr] = (dailyTotals[fullDateStr] || 0) + (parseFloat(o.total) || 0);
        });

        recentOrders.forEach(o => {
            const orderDate = new Date(o.created_at);
            const dateStr = orderDate.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' });
            const timeStr = orderDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

            const fullDateStr = orderDate.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            if (fullDateStr !== lastDate) {
                const totalZi = dailyTotals[fullDateStr] ? dailyTotals[fullDateStr].toFixed(2) : '0.00';
                html += `<div style="grid-column: 1 / -1; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                             <h3 style="color: #f1c40f; text-transform: capitalize; margin: 0;">${escapeHTML(fullDateStr)}</h3>
                             <h3 style="color: #2ecc71; margin: 0; background: rgba(0,0,0,0.3); padding: 5px 15px; border-radius: 8px;">Total Zi: ${totalZi} Lei</h3>
                         </div>`;
                lastDate = fullDateStr;
            }

            // XSS Protection
            let itemsStr = o.detalii_comanda && Array.isArray(o.detalii_comanda) ? o.detalii_comanda.map(i => {
                let noteHtml = i.notes ? `<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${escapeHTML(i.notes)}</small>` : '';
                return `<b>${escapeHTML(String(i.quantity))}x</b> ${escapeHTML(i.product.nume)}${noteHtml}`;
            }).join('<br><br>') : 'Fără detalii';

            html += `
                <div class="modern-card history-card">
                    <div class="modern-card-header" style="background: url('/img/bella-roma.png') center/cover; position: relative;">
                        <div class="modern-card-tab">Masa ${escapeHTML(String(o.numar_masa))}</div>
                        <span class="modern-card-price" style="position: absolute; bottom: 10px; right: 10px;">${escapeHTML(String(o.total))} Lei</span>
                    </div>
                    <div class="modern-card-body">
                        <div class="modern-card-title-row">
                            <h3>Comanda #${parseInt(o.id)}</h3>
                        </div>
                        <div class="modern-card-desc">
                            ${itemsStr}
                        </div>
                        <div class="modern-card-tags">
                            <span class="modern-tag">Ora ${escapeHTML(timeStr)}</span>
                            <span class="modern-tag">${escapeHTML(dateStr)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    content.innerHTML = html;
};

// ==========================================
// ÎNCHEIERE ZI — Acum protejată de Supabase Auth
// ==========================================

window.showEndDayModal = function () {
    const modal = document.getElementById('end-day-modal');
    const summary = document.getElementById('end-day-summary');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = allOrders.filter(o => new Date(o.created_at) >= today);
    const activeOrders = todayOrders.filter(o => o.status === 'noua' || o.status === 'in_preparare');
    const servitaOrders = todayOrders.filter(o => o.status === 'servita');
    const totalRevenue = todayOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const totalComenzi = todayOrders.length;

    summary.innerHTML = `
        <p style="color: #f5b041; font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">Sumar Zi de Lucru</p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-receipt" style="width: 20px;"></i> Total comenzi azi: <strong>${totalComenzi}</strong></p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-check-circle" style="width: 20px;"></i> Comenzi servite: <strong style="color: #2ecc71;">${servitaOrders.length}</strong></p>
        ${activeOrders.length > 0 ? `<p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-exclamation-circle" style="width: 20px;"></i> Comenzi încă active: <strong style="color: #e74c3c;">${activeOrders.length}</strong></p>` : ''}
        <p style="color: #2ecc71; font-size: 1.3rem; font-weight: bold; margin-top: 10px;"><i class="fas fa-cash-register" style="width: 20px;"></i> Încasări: ${totalRevenue.toFixed(2)} Lei</p>
    `;

    modal.classList.remove('hidden');
};

window.closeEndDayModal = function () {
    document.getElementById('end-day-modal').classList.add('hidden');
};

window.confirmEndDay = async function () {
    // Verificăm autentificarea (înlocuiește parola veche)
    const { authenticated } = await window.getAuthSession();
    if (!authenticated) {
        alert('Sesiunea a expirat. Autentificați-vă din nou.');
        window.location.reload();
        return;
    }

    // Curățare comenzi vechi (> 7 zile)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
        await window.supabaseClient
            .from('comenzi')
            .delete()
            .lt('created_at', sevenDaysAgo.toISOString());
    } catch (e) {
        console.error("Eroare la curățarea istoricului vechi:", e);
    }

    // Finalizăm comenzile de azi
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeToday = allOrders.filter(o => {
        const d = new Date(o.created_at);
        return d >= today && o.status !== 'finalizata';
    });

    if (activeToday.length === 0) {
        alert('Nu există comenzi active de finalizat.');
        window.closeEndDayModal();
        return;
    }

    let errors = 0;
    for (const order of activeToday) {
        const { error } = await window.supabaseClient
            .from('comenzi')
            .update({ status: 'finalizata' })
            .eq('id', order.id);

        if (error) {
            console.error('Eroare la finalizare comanda #' + order.id, error);
            errors++;
        }
    }

    window.closeEndDayModal();

    // Setare Force Close dacă e bifat
    const forceCloseCheckbox = document.getElementById('cb-force-close');
    let wasForcedClosed = false;
    if (forceCloseCheckbox && forceCloseCheckbox.checked) {
        try {
            await window.supabaseClient.from('setari').upsert({ key: 'store_force_close', value: 'true' }, { onConflict: 'key' });
            wasForcedClosed = true;
        } catch (e) {
            console.error("Nu s-a putut forța închiderea:", e);
        }
    }

    if (errors === 0) {
        const totalRevenue = allOrders
            .filter(o => new Date(o.created_at) >= today)
            .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        let extraMsg = wasForcedClosed ? "\n\n⚠️ NOTĂ: Preluarea comenzilor a fost blocată (Forțare Închidere). Nu uitați să debifați din Admin mâine!" : "";
        alert(`✅ Ziua de muncă a fost închisă cu succes!\n\nTotal încasări: ${totalRevenue.toFixed(2)} Lei\nComenzi finalizate: ${activeToday.length}\n\nToate comenzile au fost mutate în Istoric.${extraMsg}`);
    } else {
        alert(`Ziua a fost închisă, dar ${errors} comenzi au avut erori. Verificați istoricul.`);
    }
};

// ==========================================
// TOGGLE ISTORIC
// ==========================================

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

// ==========================================
// PWA INSTALL LOGIC
// ==========================================

let deferredPromptOwner;
const installAppBtn = document.getElementById('install-app-btn');

function updateOwnerInstallButtonVisibility() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (installAppBtn) {
        if (isStandalone) {
            installAppBtn.style.display = 'none'; // Ascunde dacă rulează deja ca aplicație PWA instalată
        } else {
            installAppBtn.style.display = 'inline-flex'; // Reapare dacă se deschide din browser (dacă a fost ștearsă)
        }
    }
}

updateOwnerInstallButtonVisibility();

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPromptOwner = e;
    updateOwnerInstallButtonVisibility();
});

window.addEventListener('appinstalled', () => {
    console.log('🎉 PWA Recepție instalată cu succes!');
    if (installAppBtn) installAppBtn.style.display = 'none';
});

if (installAppBtn) {
    installAppBtn.addEventListener('click', async () => {
        if (deferredPromptOwner) {
            deferredPromptOwner.prompt();
            const { outcome } = await deferredPromptOwner.userChoice;
            console.log(`PWA install choice: ${outcome}`);
            if (outcome === 'accepted') {
                installAppBtn.style.display = 'none';
            }
            deferredPromptOwner = null;
        } else {
            alert("Pentru a instala aplicația pe ecranul principal:\n\n• Pe iPhone (Safari): Apasă Partajare ⎋ -> Adaugă pe ecranul principal ➕\n• Pe iPhone (Chrome): Apasă Partajare ⎋ sus -> Adaugă pe ecranul principal ➕\n• Pe Android / PC (Chrome): Apasă Meniu ⁝ -> Instalează aplicația");
        }
    });
}

// ==========================================
// INIȚIALIZARE
// ==========================================

initOwnerAuth();
