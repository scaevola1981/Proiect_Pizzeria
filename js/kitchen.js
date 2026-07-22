let kitchenOrders = [];

async function loadKitchenOrders() {
    if (!window.supabaseClient) return;

    const { data, error } = await window.supabaseClient
        .from('comenzi')
        .select('*')
        .eq('status', 'noua')
        .order('created_at', { ascending: true });
        
    if (error) {
        console.error("Eroare la preluarea comenzilor:", error);
        return;
    }
    
    kitchenOrders = data || [];
    renderKitchenOrders();
    
    window.subscribeToKitchenOrders((payload) => {
        if (payload.eventType === 'INSERT') {
            kitchenOrders.push(payload.new);
            renderKitchenOrders();
        } else if (payload.eventType === 'UPDATE') {
            if (payload.new.status !== 'noua') {
                kitchenOrders = kitchenOrders.filter(o => o.id !== payload.new.id);
                renderKitchenOrders();
            }
        }
    });
}

window.renderKitchenOrders = function() {
    const container = document.getElementById('comenzi-active-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (kitchenOrders.length === 0) {
        container.innerHTML = '<p>Fără comenzi active momentan.</p>';
        return;
    }
    
    kitchenOrders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.style.borderLeft = "5px solid #ff4757"; 
        
        let detailsHtml = '<ul style="text-align: left; margin: 10px 0; padding-left: 20px;">';
        if (Array.isArray(order.detalii_comanda)) {
            order.detalii_comanda.forEach(item => {
                detailsHtml += `<li><b>${item.quantity}x</b> ${item.product.nume}</li>`;
            });
        }
        detailsHtml += '</ul>';

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>Masa ${order.numar_masa}</h3>
                <span style="font-size:0.9rem; color:#ccc;">#${order.id}</span>
            </div>
            ${detailsHtml}
            <h4>Total: ${order.total} Lei</h4>
            <button onclick="window.openAcceptModal(${order.id})" style="margin-top: 15px;">Acceptă & Setează Timp</button>
        `;
        container.appendChild(div);
    });
};

loadKitchenOrders();
