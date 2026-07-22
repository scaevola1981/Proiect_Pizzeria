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
        const div = document.createElement('div');
        div.className = 'product-card';
        div.style.marginBottom = "15px";
        
        let bg = "rgba(255, 255, 255, 0.1)";
        if (order.status === 'in_preparare') bg = "rgba(255, 165, 2, 0.2)";
        if (order.status === 'finalizata') bg = "rgba(46, 204, 113, 0.2)";
        div.style.background = bg;

        let detailsHtml = '<ul style="text-align: left; margin: 10px 0; padding-left: 20px;">';
        if (Array.isArray(order.detalii_comanda)) {
            order.detalii_comanda.forEach(item => {
                detailsHtml += `<li><b>${item.quantity}x</b> ${item.product.nume}</li>`;
            });
        }
        detailsHtml += '</ul>';

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>Masa ${order.numar_masa} <span style="font-size:0.9rem; color:#ccc;">(#${order.id})</span></h3>
                <span style="font-weight:bold; color:#ffa502;">${order.status.toUpperCase()}</span>
            </div>
            ${detailsHtml}
            <h4 style="margin-top:10px;">Total: ${order.total} Lei</h4>
            ${order.status === 'in_preparare' ? `<button onclick="window.updateOrderStatus(${order.id}, 'finalizata')" style="margin-top:10px; background:#2ecc71;">Marchează Finalizată</button>` : ''}
            ${order.status === 'finalizata' ? `<button onclick="window.updateOrderStatus(${order.id}, 'preluata')" style="margin-top:10px; background:#3498db;">Marchează Preluată</button>` : ''}
        `;
        container.appendChild(div);
    });
    
    const revDiv = document.createElement('div');
    revDiv.innerHTML = `<h2 style="margin-bottom:20px; color:#2ecc71; text-align: center;">Încasări Totale: ${totalRevenue.toFixed(2)} Lei</h2>`;
    container.insertBefore(revDiv, container.firstChild);
};

loadOwnerOrders();
