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
    } else {
        const loadingSpinner = document.getElementById('auth-loading');
        const loginForm = document.getElementById('login-form-content');
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
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
        const loadingSpinner = document.getElementById('auth-loading');
        const loginForm = document.getElementById('login-form-content');
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
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
    allOrders.forEach(o => autoPrintIfNew(o));
    renderOwnerOrders();

    if (!window.ownerChannelSubscribed) {
        window.ownerChannelSubscribed = true;
        window.supabaseClient.channel('owner_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comenzi' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const idx = allOrders.findIndex(o => o.id === payload.new.id);
                    if (idx === -1) {
                        allOrders.unshift(payload.new);
                    }
                    autoPrintIfNew(payload.new);
                } else if (payload.eventType === 'UPDATE') {
                    const idx = allOrders.findIndex(o => o.id === payload.new.id);
                    if (idx > -1) {
                        allOrders[idx] = payload.new;
                    } else {
                        allOrders.unshift(payload.new);
                    }
                    autoPrintIfNew(payload.new);
                } else if (payload.eventType === 'DELETE') {
                    allOrders = allOrders.filter(o => o.id !== payload.old.id);
                }
                renderOwnerOrders();
            }).subscribe();
    }

    // Polling fallback la 5 secunde pentru recepție
    if (!window.ownerPollInterval) {
        window.ownerPollInterval = setInterval(async () => {
            if (window.supabaseClient) {
                const { data: latestData } = await window.supabaseClient
                    .from('comenzi')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (latestData) {
                    allOrders = latestData;
                    allOrders.forEach(o => autoPrintIfNew(o));
                    renderOwnerOrders();
                }
            }
        }, 5000);
    }
}

const printedOrderSignatures = new Set();

function autoPrintIfNew(order) {
    if (!order || order.status !== 'noua') return;

    const detailsCount = Array.isArray(order.detalii_comanda) ? order.detalii_comanda.length : 0;
    const signature = `${order.id}_${order.total}_${detailsCount}`;

    if (!printedOrderSignatures.has(signature)) {
        printedOrderSignatures.add(signature);
        console.log("🖨️ Auto-print declanșat automat pentru comanda #", order.id, "Masa:", order.numar_masa);
        printReceiptForOrder(order);
    }
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
        if (order.status !== 'finalizata') {
            totalRevenue += parseFloat(order.total) || 0;
        }

        if (order.status === 'finalizata') {
            return;
        }

        const div = document.createElement('div');
        div.className = 'modern-card';

        let headerGradient = "linear-gradient(135deg, #f5b041 0%, #e67e22 100%)";
        if (order.status === 'in_preparare') headerGradient = "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)";
        if (order.status === 'servita') headerGradient = "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)";

        // Formatează preparatele grupate pe persoane + suma de plată per persoană
        let itemsStr = renderOrderItemsGroupedByPerson(order.detalii_comanda);

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
            buttonHtml = `<button class="modern-card-btn success" onclick="window.updateOrderStatus(${parseInt(order.id)}, 'servita')"><i class="fas fa-flag-checkered"></i> Marchează ca Servită</button>`;
        } else if (order.status === 'servita') {
            buttonHtml = `<button class="modern-card-btn success" style="background: #e74c3c;" onclick="window.updateOrderStatus(${parseInt(order.id)}, 'finalizata')"><i class="fas fa-broom"></i> Eliberează Masa ${escapeHTML(String(order.numar_masa))}</button>`;
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
            <button class="modern-card-btn" style="background: #2c3e50; margin-top: 0;" onclick="window.printOrderReceipt(${parseInt(order.id)})"><i class="fas fa-print"></i> Printează Bon</button>
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

            let itemsStr = renderOrderItemsGroupedByPerson(o.detalii_comanda);

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



// Helper de formatare preparate grupate pe persoane + calcul subtotal per persoană
function renderOrderItemsGroupedByPerson(detaliiComanda) {
    if (!detaliiComanda || !Array.isArray(detaliiComanda) || detaliiComanda.length === 0) {
        return '<p style="color: #cbd5e1; font-style: italic;">Fără detalii</p>';
    }

    const grouped = {};
    detaliiComanda.forEach(item => {
        const person = item.customer_name && item.customer_name.trim() !== '' ? item.customer_name : 'Masa';
        if (!grouped[person]) {
            grouped[person] = [];
        }
        grouped[person].push(item);
    });



    // Dacă sunt defalcate pe persoane
    let html = '';
    const badgeColors = ['#f5b041', '#3498db', '#9b59b6', '#2ecc71', '#e67e22', '#1abc9c'];
    let colorIdx = 0;

    for (const [person, items] of Object.entries(grouped)) {
        let personTotal = 0;
        const itemsHtml = items.map(i => {
            const price = parseFloat(i.product.pret || 0);
            const qty = parseInt(i.quantity || 1);
            const lineTotal = price * qty;
            personTotal += lineTotal;

            const noteHtml = i.notes ? `<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${escapeHTML(i.notes)}</small>` : '';
            return `<div style="color: #fff; font-size: 0.9rem; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span><b>${qty}x</b> ${escapeHTML(i.product.nume)}</span>
                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${lineTotal.toFixed(2)} Lei</span>
            </div>${noteHtml}`;
        }).join('');

        const accentColor = badgeColors[colorIdx % badgeColors.length];
        colorIdx++;

        const isMasaGroup = (person === 'Masa');
        const displayLabel = isMasaGroup ? '👥 Comandă Împreună' : `👤 ${escapeHTML(person)}`;

        html += `
            <div style="margin-bottom: 10px; padding: 10px 12px; background: rgba(0, 0, 0, 0.4); border-radius: 10px; border-left: 4px solid ${accentColor}; border: 1px solid rgba(255,255,255,0.15); border-left-width: 4px; border-left-color: ${accentColor};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.15);">
                    <span style="color: ${accentColor}; font-weight: 800; font-size: 0.95rem;">
                        ${displayLabel}
                    </span>
                    <span style="background: rgba(46, 204, 113, 0.25); color: #2ecc71; font-weight: 800; font-size: 0.85rem; padding: 3px 10px; border-radius: 12px; border: 1px solid #2ecc71;">
                        De plată: ${personTotal.toFixed(2)} Lei
                    </span>
                </div>
                ${itemsHtml}
            </div>
        `;
    }

    return html;
}

// ==========================================
// PRINTARE BON TERMIC — OCPP-80K (80mm)
// ==========================================

async function printReceiptForOrder(order) {
    if (!order) return;

    const detalii = order.detalii_comanda || [];
    const masaStr = String(order.numar_masa || '?');
    const totalStr = parseFloat(order.total || 0).toFixed(2);
    const dateObj = new Date(order.created_at);
    const dateStr = dateObj.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

    // Verificăm dacă există produse noi (is_new === true) pentru a tipări doar bonul suplimentar
    const hasNewItems = detalii.some(item => item.is_new === true);
    const isSupplement = hasNewItems;
    const itemsToPrint = hasNewItems ? detalii.filter(item => item.is_new === true) : detalii;

    // Grupare pe persoane
    const grouped = {};
    itemsToPrint.forEach(item => {
        const person = item.customer_name && item.customer_name.trim() !== '' ? item.customer_name : 'Masa';
        if (!grouped[person]) grouped[person] = [];
        grouped[person].push(item);
    });

    let itemsHtml = '';
    for (const [person, items] of Object.entries(grouped)) {
        const displayLabel = person === 'Masa' ? '👥 Împreună' : `👤 ${person}`;
        let personTotal = 0;

        itemsHtml += `<div style="border-top: 1px dashed #000; padding: 4px 0 2px; margin-top: 4px;">
            <b>${displayLabel}</b>
        </div>`;

        items.forEach(item => {
            const qty = parseInt(item.quantity || 1);
            const price = parseFloat(item.product?.pret || 0);
            const lineTotal = qty * price;
            personTotal += lineTotal;
            const notes = item.notes ? `<br><small><i>* ${item.notes}</i></small>` : '';
            itemsHtml += `<div style="display: flex; justify-content: space-between; font-size: 12px; padding: 1px 0;">
                <span>${qty}x ${item.product?.nume || 'Produs'}</span>
                <span>${lineTotal.toFixed(2)}</span>
            </div>${notes}`;
        });

        itemsHtml += `<div style="text-align: right; font-size: 11px; font-weight: bold; padding-top: 2px;">Subtotal: ${personTotal.toFixed(2)} Lei</div>`;
    }

    const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Bon Bella Roma</title>
        <style>
            @page {
                size: 80mm auto;
                margin: 0;
            }
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Courier New', monospace;
                width: 80mm;
                padding: 5mm;
                font-size: 12px;
                color: #000;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 6px;
                margin-bottom: 6px;
            }
            .header h1 {
                font-size: 18px;
                letter-spacing: 2px;
                margin-bottom: 2px;
            }
            .header p {
                font-size: 10px;
            }
            .info {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                font-weight: bold;
                padding: 4px 0;
                border-bottom: 1px dashed #000;
            }
            .total-section {
                border-top: 2px solid #000;
                margin-top: 8px;
                padding-top: 6px;
                text-align: center;
            }
            .total-section .total {
                font-size: 18px;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 10px;
                padding-top: 6px;
                border-top: 1px dashed #000;
                font-size: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>BELLA ROMA</h1>
            <p>PUB & PIZZERIE</p>
            ${isSupplement ? '<p style="font-size: 14px; font-weight: bold; margin-top: 4px; border-top: 1px dashed #000; padding-top: 4px;">*** BON SUPLIMENTAR ***</p>' : ''}
        </div>

        <div class="info">
            <span>Masa: ${masaStr}</span>
            <span>#${parseInt(order.id)}</span>
        </div>
        <div class="info" style="border-bottom: none; font-weight: normal;">
            <span>${dateStr}</span>
            <span>${timeStr}</span>
        </div>

        <div style="margin-top: 4px;">
            ${itemsHtml}
        </div>

        <div class="total-section">
            <div class="total">TOTAL: ${totalStr} Lei</div>
        </div>

        <div class="footer">
            <p>Vă mulțumim!</p>
            <p>www.bella-roma.ro</p>
        </div>
    </body>
    </html>`;

    // Încercăm conexiunea / reconectarea la QZ Tray înainte de printare
    const isQzActive = await initQZTrayConnection();

    if (isQzActive && typeof qz !== 'undefined' && qz.websocket.isActive()) {
        try {
            const printerName = qzTargetPrinter || await qz.printers.getDefault();
            const config = qz.print.createConfig(printerName);
            const data = [{
                type: 'pixel',
                format: 'html',
                flavor: 'plain',
                data: receiptHtml
            }];
            await qz.print(config, data);
            console.log("✅ Bon printat 100% silențios via QZ Tray pe:", printerName);
            return; // S-A PRINTAT SILENȚIOS VIA QZ TRAY — NU MAI DESCHIDEM NICIO FEREASTRĂ BROWSER!
        } catch (qzErr) {
            console.warn("Eroare trimitere job QZ Tray, fallback la browser:", qzErr);
        }
    }

    // Doar dacă QZ Tray este oprit pe laptop, deschidem fereastră de backup
    fallbackBrowserPrint(receiptHtml);
}

function fallbackBrowserPrint(receiptHtml) {
    let printFrame = document.getElementById('receipt-print-frame');
    if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'receipt-print-frame';
        printFrame.style.cssText = 'position: fixed; top: -10000px; left: -10000px; width: 80mm; height: 0; border: none; visibility: hidden;';
        document.body.appendChild(printFrame);
    }

    const frameDoc = printFrame.contentDocument || printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(receiptHtml);
    frameDoc.close();

    printFrame.onload = () => {
        try {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
        } catch (e) {
            console.warn('Printare automată blocată, se deschide fereastra manuală:', e);
            const printWindow = window.open('', '_blank', 'width=320,height=600');
            if (printWindow) {
                printWindow.document.write(receiptHtml);
                printWindow.document.close();
                printWindow.onload = () => {
                    printWindow.print();
                    printWindow.onafterprint = () => printWindow.close();
                };
            }
        }
    };
}

// ==========================================
// QZ TRAY — SUPORT IMPRIMANTĂ SILENȚIOASĂ (SAMSUNG / POS)
// ==========================================

let qzTargetPrinter = null;
let isQzConnecting = false;

async function initQZTrayConnection() {
    if (typeof qz === 'undefined') {
        updateQZBadge('Lipsă SDK QZ', '#e74c3c');
        return false;
    }

    if (qz.websocket.isActive()) {
        updateQZBadge(`Conectat (${qzTargetPrinter || 'Implicită'})`, '#2ecc71');
        return true;
    }

    if (isQzConnecting) return false;
    isQzConnecting = true;

    try {
        qz.security.setCertificatePromise((resolve) => resolve());
        qz.security.setSignaturePromise(() => (resolve) => resolve());

        if (!qz.websocket.isActive()) {
            await qz.websocket.connect({ retries: 5, delay: 1 });
        }

        try {
            const printers = await qz.printers.find();
            console.log("🖨️ Imprimante detectate de QZ Tray:", printers);
            const samsung = printers.find(p => p && (p.toLowerCase().includes('samsung') || p.toLowerCase().includes('m2020') || p.toLowerCase().includes('m2026')));
            if (samsung) {
                qzTargetPrinter = samsung;
            } else {
                qzTargetPrinter = await qz.printers.getDefault();
            }
            updateQZBadge(`Conectat (${qzTargetPrinter || 'Implicită'})`, '#2ecc71');
        } catch {
            updateQZBadge('Conectat QZ', '#2ecc71');
        }

        isQzConnecting = false;
        return true;
    } catch (err) {
        console.warn("QZ Tray nu este pornit pe laptop:", err);
        updateQZBadge('Deconectat (Offline)', '#f5b041');
        isQzConnecting = false;
        return false;
    }
}

function updateQZBadge(text, color) {
    const badge = document.getElementById('qz-status-badge');
    if (badge) {
        badge.style.background = `rgba(${color === '#2ecc71' ? '46, 204, 113' : '245, 176, 65'}, 0.2)`;
        badge.style.color = color;
        badge.style.borderColor = color;
        badge.innerHTML = `<i class="fas fa-print"></i> QZ Tray: ${text}`;
    }
}

window.testQZPrint = async function () {
    const isConnected = await initQZTrayConnection();
    if (isConnected && typeof qz !== 'undefined' && qz.websocket.isActive()) {
        try {
            const printerName = qzTargetPrinter || await qz.printers.getDefault();
            const config = qz.print.createConfig(printerName);
            const sampleHTML = `
                <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 2px dashed #000;">
                    <h2 style="margin: 0; font-size: 20px;">BELLA ROMA - PUB & PIZZERIE</h2>
                    <p style="margin: 5px 0;">Test Imprimare Silențioasă QZ Tray</p>
                    <hr style="border: 1px dashed #000; margin: 10px 0;">
                    <p style="font-weight: bold; font-size: 16px;">Imprimantă: ${printerName}</p>
                    <p style="font-size: 14px; color: green; font-weight: bold;">TEST REUȘIT 🚀</p>
                </div>
            `;
            const data = [{
                type: 'pixel',
                format: 'html',
                flavor: 'plain',
                data: sampleHTML
            }];
            await qz.print(config, data);
            alert(`✅ Test trimis cu succes pe imprimanta: ${printerName}!`);
        } catch (e) {
            alert('Eroare la printare prin QZ Tray: ' + e.message);
        }
    } else {
        alert('QZ Tray nu este pornit pe laptop. Deschide aplicația QZ Tray pe Windows!');
    }
};

// Funcție globală pentru print manual de pe card
window.printOrderReceipt = function(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
        printReceiptForOrder(order);
        
        // Trecem comanda automat "În preparare" după ce am trimis bonul spre bucătărie
        if (order.status === 'noua') {
            window.updateOrderStatus(orderId, 'in_preparare');
        }
    }
};

// ==========================================
// INIȚIALIZARE & KEEP-ALIVE QZ TRAY
// ==========================================

initOwnerAuth();
setTimeout(initQZTrayConnection, 500);
setInterval(initQZTrayConnection, 8000);
