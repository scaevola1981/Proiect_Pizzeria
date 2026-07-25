// ==========================================
// SKELETON SUPABASE - Așteaptă conectarea
// ==========================================

const supabaseUrl = 'https://tzdtssvjsrhyocskivmm.supabase.co';
const supabaseKey = 'sb_publishable_JRIxO4MMjth3IkqfaOCPmw_e69T87UP';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
window.supabaseClient = supabase; // Facem clientul disponibil pentru preluarea meniului în app.js

// Trimitere comandă nouă
window.sendOrderToDatabase = async function (masa, cart, total, pushSubscription = null) {
    const order = {
        numar_masa: masa,
        detalii_comanda: cart, // JSON
        total: total,
        status: 'noua'
    };
    
    if (pushSubscription) {
        order.push_subscription = pushSubscription;
    }

    const { data, error } = await supabase.from('comenzi').insert([order]).select();
    if (error) {
        console.error("Eroare la inserare:", error);
        return null;
    }
    return data[0]; // returnăm obiectul complet al comenzii create
};

// Abonare la statusul unei anumite comenzi (pentru client)
window.subscribeToOrderStatus = function (orderId, callback) {
    supabase.channel(`order-${orderId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'comenzi',
                filter: `id=eq.${orderId}`
            },
            (payload) => {
                callback(payload.new.status);
            }
        )
        .subscribe();
};

// Actualizare status comandă
window.updateOrderStatus = async function (orderId, newStatus, timestampFinalizare = null) {
    const updateData = { status: newStatus };
    if (timestampFinalizare !== null) {
        updateData.timp_asteptare = timestampFinalizare; // Salvăm timestamp-ul
    }
    const { data, error } = await supabase.from('comenzi').update(updateData).eq('id', orderId);
    if (error) {
        console.error("Eroare la update:", error);
    }
};

// Abonare pentru Kitchen (ascultă comenzi noi)
window.subscribeToKitchenOrders = function (callback) {
    console.log("Abonat cu succes la comenzile de bucatarie.");
    supabase.channel('kitchen_orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comenzi' }, callback)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comenzi' }, callback)
        .subscribe();
};

// Abonare pentru Customer Display (ascultă comenzi în preparare/finalizate)
window.subscribeToCustomerDisplay = function (callback) {
    console.log("Abonat cu succes la display-ul clienților.");
    supabase.channel('customer_display')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comenzi' }, callback)
        .subscribe();
};
