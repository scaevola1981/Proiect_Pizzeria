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
        if (orderDate >= today) {
            totalRevenue += parseFloat(order.total) || 0;
        }
        
        // Ascundem comenzile finalizate de pe display
        if (order.status === 'finalizata') {
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
    let lastDate = '';
    
    if (recentOrders.length === 0) {
        html = '<p style="text-align:center; margin-top:20px;">Nu există comenzi în ultimele 7 zile.</p>';
    } else {
        recentOrders.forEach(o => {
            const orderDate = new Date(o.created_at);
            const dateStr = orderDate.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' });
            const timeStr = orderDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute:'2-digit' });
            
            const fullDateStr = orderDate.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            if (fullDateStr !== lastDate) {
                html += `<div style="grid-column: 1 / -1; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 20px; margin-bottom: 10px;">
                             <h3 style="color: #f1c40f; text-transform: capitalize; margin: 0;">${fullDateStr}</h3>
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
