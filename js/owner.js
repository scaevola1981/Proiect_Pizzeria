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
    
    // Calculăm încasările doar pentru ziua curentă
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
        
        // Încasările de azi conțin doar comenzile NEFINALIZATE (dacă se închide ziua, se resetează la 0)
        if (isToday && order.status !== 'finalizata') {
            totalRevenue += parseFloat(order.total) || 0;
        }
        
        // Ascundem doar comenzile finalizate (mutate în istoric) și cele din alte zile
        if (order.status === 'finalizata' || !isToday) {
            return;
        }

        const div = document.createElement('div');
        div.className = 'modern-card';
        
        let headerGradient = "linear-gradient(135deg, #f5b041 0%, #e67e22 100%)";
        if (order.status === 'in_preparare') headerGradient = "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)";
        if (order.status === 'servita') headerGradient = "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)";

        let itemsStr = order.detalii_comanda && Array.isArray(order.detalii_comanda) ? order.detalii_comanda.map(i => {
            let noteHtml = i.notes ? `<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${i.notes}</small>` : '';
            return `<b>${i.quantity}x</b> ${i.product.nume}${noteHtml}`;
        }).join('<br><br>') : 'Fără detalii';
        const dateStr = new Date(order.created_at).toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' });
        const timeStr = new Date(order.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute:'2-digit' });

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
            buttonHtml = `<button class="modern-card-btn" onclick="window.updateOrderStatus(${order.id}, 'in_preparare')"><i class="fas fa-check"></i> Acceptă Comanda</button>`;
        } else if (order.status === 'in_preparare') {
            buttonHtml = `<button class="modern-card-btn success" onclick="window.updateOrderStatus(${order.id}, 'servita')"><i class="fas fa-flag-checkered"></i> Încheiere Comandă</button>`;
        } else if (order.status === 'servita') {
            buttonHtml = `<button class="modern-card-btn disabled" disabled><i class="fas fa-check-circle"></i> Comanda Încheiată</button>`;
        }

        div.innerHTML = `
            <div class="modern-card-header" style="background: url('/img/bella-roma.png') center/cover; position: relative;">
                <div class="modern-card-tab">Masa ${order.numar_masa}</div>
                <span class="modern-card-price" style="position: absolute; bottom: 10px; right: 10px;">${order.total} Lei</span>
            </div>
            <div class="modern-card-body">
                <div class="modern-card-title-row">
                    <h3>Comanda #${order.id}</h3>
                </div>
                <div class="modern-card-desc">
                    ${itemsStr}
                </div>
                <div class="modern-card-tags">
                    <span class="modern-tag">Ora ${timeStr}</span>
                    <span class="modern-tag">${dateStr}</span>
                    <span class="modern-tag" style="background: ${statusColor}; color: white;">${statusLabel}</span>
                </div>
            </div>
            ${buttonHtml}
        `;
        container.appendChild(div);
    });
    
    // Ascundem butonul de încheiere zi dacă nu sunt comenzi de azi (active sau servite)
    const todayNonFinalOrders = allOrders.filter(o => {
        const d = new Date(o.created_at);
        return d >= today && o.status !== 'finalizata';
    });
    
    // Afișăm Încasări Azi doar dacă avem comenzi active (dacă s-a închis ziua, dispare / e 0)
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

window.renderHistory = function() {
    const content = document.getElementById('history-content');
    if (!content) return;
    
    // Filtrare ultimele 7 zile
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = allOrders.filter(order => new Date(order.created_at) >= sevenDaysAgo);
    
    let html = '';
    let lastDate = '';
    
    if (recentOrders.length === 0) {
        html = '<p style="text-align:center; margin-top:20px;">Nu există comenzi în ultimele 7 zile.</p>';
    } else {
        // Calculăm totalurile zilnice mai întâi
        const dailyTotals = {};
        recentOrders.forEach(o => {
            const fullDateStr = new Date(o.created_at).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            dailyTotals[fullDateStr] = (dailyTotals[fullDateStr] || 0) + (parseFloat(o.total) || 0);
        });

        recentOrders.forEach(o => {
            const orderDate = new Date(o.created_at);
            const dateStr = orderDate.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' });
            const timeStr = orderDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute:'2-digit' });
            
            const fullDateStr = orderDate.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            if (fullDateStr !== lastDate) {
                const totalZi = dailyTotals[fullDateStr] ? dailyTotals[fullDateStr].toFixed(2) : '0.00';
                html += `<div style="grid-column: 1 / -1; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                             <h3 style="color: #f1c40f; text-transform: capitalize; margin: 0;">${fullDateStr}</h3>
                             <h3 style="color: #2ecc71; margin: 0; background: rgba(0,0,0,0.3); padding: 5px 15px; border-radius: 8px;">Total Zi: ${totalZi} Lei</h3>
                         </div>`;
                lastDate = fullDateStr;
            }
            
            let itemsStr = o.detalii_comanda && Array.isArray(o.detalii_comanda) ? o.detalii_comanda.map(i => {
                let noteHtml = i.notes ? `<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${i.notes}</small>` : '';
                return `<b>${i.quantity}x</b> ${i.product.nume}${noteHtml}`;
            }).join('<br><br>') : 'Fără detalii';

            html += `
                <div class="modern-card history-card">
                    <div class="modern-card-header" style="background: url('/img/bella-roma.png') center/cover; position: relative;">
                        <div class="modern-card-tab">Masa ${o.numar_masa}</div>
                        <span class="modern-card-price" style="position: absolute; bottom: 10px; right: 10px;">${o.total} Lei</span>
                    </div>
                    <div class="modern-card-body">
                        <div class="modern-card-title-row">
                            <h3>Comanda #${o.id}</h3>
                        </div>
                        <div class="modern-card-desc">
                            ${itemsStr}
                        </div>
                        <div class="modern-card-tags">
                            <span class="modern-tag">Ora ${timeStr}</span>
                            <span class="modern-tag">${dateStr}</span>
                        </div>
                    </div>
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

// ==========================================
// ÎNCHEIERE ZI DE MUNCĂ
// ==========================================
const END_DAY_PWD_HASH = "a03ea09072d789adff29aff6a3758e9294c96ce803915c1456384eaa6e2d2df9"; // Parola hash-uită (ex: "bella")

window.showEndDayModal = function() {
    const modal = document.getElementById('end-day-modal');
    const summary = document.getElementById('end-day-summary');
    const pwdInput = document.getElementById('end-day-password');
    const errMsg = document.getElementById('end-day-error');
    
    // Resetăm starea
    pwdInput.value = '';
    errMsg.style.display = 'none';
    
    // Calculăm sumarul zilei
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
    
    // Focus pe câmpul de parolă
    setTimeout(() => pwdInput.focus(), 100);
};

window.closeEndDayModal = function() {
    document.getElementById('end-day-modal').classList.add('hidden');
};

window.confirmEndDay = async function() {
    const pwd = document.getElementById('end-day-password').value;
    const errMsg = document.getElementById('end-day-error');
    
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (hashHex !== END_DAY_PWD_HASH) {
        errMsg.style.display = 'block';
        return;
    }
    
    errMsg.style.display = 'none';
    
    // Curățare automată a bazei de date: ștergem fizic comenzile mai vechi de 7 zile
    // Astfel păstrăm în permanență doar istoricul pe ultimele 7 zile.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    try {
        await window.supabaseClient
            .from('comenzi')
            .delete()
            .lt('created_at', sevenDaysAgo.toISOString());
    } catch (e) {
        console.error("Eroare la curățarea istoriclui vechi:", e);
    }
    
    // Finalizăm toate comenzile de azi care nu sunt deja finalizate
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
    
    // Actualizăm fiecare comandă la status 'finalizata'
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
    
    if (errors === 0) {
        const totalRevenue = allOrders
            .filter(o => new Date(o.created_at) >= today)
            .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        alert(`✅ Ziua de muncă a fost închisă cu succes!\n\nTotal încasări: ${totalRevenue.toFixed(2)} Lei\nComenzi finalizate: ${activeToday.length}\n\nToate comenzile au fost mutate în Istoric.`);
    } else {
        alert(`Ziua a fost închisă, dar ${errors} comenzi au avut erori. Verificați istoricul.`);
    }
};

// Permite Enter pe câmpul de parolă
const endDayPwdInput = document.getElementById('end-day-password');
if (endDayPwdInput) {
    endDayPwdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.confirmEndDay();
    });
}

// ==========================================
// PWA INSTALL LOGIC (Descarcă Aplicația)
// ==========================================
let deferredPrompt;
const installAppBtn = document.getElementById('install-app-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    if (installAppBtn) {
        installAppBtn.style.display = 'block';
    }
});

if (installAppBtn) {
    installAppBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            // We've used the prompt, and can't use it again, throw it away
            deferredPrompt = null;
            installAppBtn.style.display = 'none';
        }
    });
}
