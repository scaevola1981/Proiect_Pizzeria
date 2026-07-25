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

// ==========================================
// SECURITATE - SETĂRI PAROLĂ
// ==========================================
window.getAdminPasswordHash = async function() {
    const { data, error } = await supabase
        .from('setari')
        .select('value')
        .eq('key', 'admin_pwd')
        .single();
    if (error) {
        console.warn("Tabelul 'setari' nu exista sau e gol. Fallback la parola initiala.");
        return "a03ea09072d789adff29aff6a3758e9294c96ce803915c1456384eaa6e2d2df9"; // 'bella' hash
    }
    return data.value;
};

window.updateAdminPasswordHash = async function(newHash) {
    // Încercăm să dăm UPDATE. (Necesită ca RLS să permită anon UPDATE pe acest tabel,
    // Ceea ce nu este 100% sigur fără Supabase Auth. Este o vulnerabilitate cunoscută).
    const { error } = await supabase
        .from('setari')
        .upsert({ key: 'admin_pwd', value: newHash }, { onConflict: 'key' });
        
    if (error) {
        console.error("Eroare la actualizarea parolei:", error);
        return false;
    }
    return true;
};
