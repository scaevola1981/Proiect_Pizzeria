let customerOrders = [];

async function loadCustomerOrders() {
    if (!window.supabaseClient) return;

    const { data, error } = await window.supabaseClient
        .from('comenzi')
        .select('*')
        .in('status', ['in_preparare', 'finalizata'])
        .order('created_at', { ascending: true });
        
    if (error) {
        console.error("Eroare:", error);
        return;
    }
    
    customerOrders = data || [];
    renderCustomerOrders();
    
    window.subscribeToCustomerDisplay((payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const index = customerOrders.findIndex(o => o.id === payload.new.id);
            if (index > -1) {
                if (payload.new.status === 'preluata') {
                    customerOrders.splice(index, 1);
                } else {
                    customerOrders[index] = payload.new;
                }
            } else {
                if (payload.new.status === 'in_preparare' || payload.new.status === 'finalizata') {
                    customerOrders.push(payload.new);
                }
            }
            renderCustomerOrders();
        }
    });
    
    setInterval(renderCustomerOrders, 60000);
}

window.renderCustomerOrders = function() {
    const inPreparareContainer = document.getElementById('comenzi-in-preparare');
    const finalizateContainer = document.getElementById('comenzi-finalizate');
    
    if (inPreparareContainer) inPreparareContainer.innerHTML = '';
    if (finalizateContainer) finalizateContainer.innerHTML = '';
    
    const preparare = customerOrders.filter(o => o.status === 'in_preparare');
    const finalizate = customerOrders.filter(o => o.status === 'finalizata');
    
    if (preparare.length === 0 && inPreparareContainer) {
         inPreparareContainer.innerHTML = '<p>Nicio comandă în preparare.</p>';
    }
    
    preparare.forEach(order => {
        const div = document.createElement('div');
        div.className = 'product-card';
        const minsLeft = window.calculateRemainingTime ? window.calculateRemainingTime(order.timp_asteptare) : 0;
        div.innerHTML = `
            <h3>Masa ${order.numar_masa}</h3>
            <p style="font-size: 2rem; margin: 10px 0; color: #ffa502;">${minsLeft > 0 ? minsLeft + ' min' : 'Imediat'}</p>
        `;
        if (inPreparareContainer) inPreparareContainer.appendChild(div);
    });
    
    if (finalizate.length === 0 && finalizateContainer) {
         finalizateContainer.innerHTML = '<p>Nicio comandă finalizată recent.</p>';
    }
    
    finalizate.forEach(order => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.style.background = "rgba(46, 204, 113, 0.2)";
        div.style.borderColor = "#2ecc71";
        div.innerHTML = `
            <h3>Masa ${order.numar_masa}</h3>
            <p style="font-size: 1.5rem; margin: 10px 0; color: #2ecc71;">GATA DE RIDICARE</p>
        `;
        if (finalizateContainer) finalizateContainer.appendChild(div);
    });
};

loadCustomerOrders();
