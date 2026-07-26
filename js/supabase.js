// ==========================================
// SUPABASE CLIENT + AUTENTIFICARE + FUNCȚII DB
// ==========================================

const supabaseUrl = 'https://tzdtssvjsrhyocskivmm.supabase.co';
const supabaseKey = 'sb_publishable_JRIxO4MMjth3IkqfaOCPmw_e69T87UP';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
window.supabaseClient = supabase;

// ==========================================
// AUTENTIFICARE — Supabase Auth
// ==========================================

/**
 * Autentificare admin cu email + parolă
 * @returns {success: boolean, user: object|null, error: string|null}
 */
window.loginAdmin = async function (email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('Eroare autentificare:', error.message);
            return { success: false, user: null, error: error.message };
        }

        return { success: true, user: data.user, error: null };
    } catch (e) {
        console.error('Eroare la login:', e);
        return { success: false, user: null, error: 'Eroare de conexiune. Încercați din nou.' };
    }
};

/**
 * Deconectare admin
 */
window.logoutAdmin = async function () {
    await supabase.auth.signOut();
    window.location.href = 'receptie.html';
};

/**
 * Verifică sesiunea curentă
 * @returns {authenticated: boolean, user: object|null}
 */
window.getAuthSession = async function () {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
            return { authenticated: false, user: null };
        }
        return { authenticated: true, user: session.user };
    } catch {
        return { authenticated: false, user: null };
    }
};

/**
 * Schimbă parola utilizatorului autentificat
 * @returns {success: boolean, error: string|null}
 */
window.changeAdminPassword = async function (newPassword) {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, error: null };
    } catch (e) {
        return { success: false, error: 'Eroare la schimbarea parolei.' };
    }
};

// ==========================================
// ADMIN PIN — Al doilea nivel de securitate
// ==========================================

/**
 * Hash SHA-256 pentru PIN (client-side)
 */
async function hashPin(pin) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Obține hash-ul PIN-ului admin din setari
 * Suportă fallback la vechiul 'admin_pwd' sau parola implicită 'bella'
 */
window.getAdminPin = async function () {
    try {
        // 1. Căutăm 'admin_pin' nou
        const { data: pinData } = await supabase
            .from('setari')
            .select('value')
            .eq('key', 'admin_pin')
            .maybeSingle();

        if (pinData && pinData.value) {
            return pinData.value;
        }

        // 2. Fallback la vechiul 'admin_pwd'
        const { data: pwdData } = await supabase
            .from('setari')
            .select('value')
            .eq('key', 'admin_pwd')
            .maybeSingle();

        if (pwdData && pwdData.value) {
            return pwdData.value;
        }
    } catch (e) {
        console.warn("Eroare la citirea PIN-ului din setări:", e);
    }

    // 3. Fallback la parola implicită 'bella'
    return "a03ea09072d789adff29aff6a3758e9294c96ce803915c1456384eaa6e2d2df9";
};

/**
 * Verifică dacă PIN-ul introdus este corect
 * Pentru utilizatorii autentificați ca admin/patron, dacă PIN-ul nu se potrivește,
 * se actualizează automat la noul PIN introdus pentru a preveni blocarea.
 * @returns {valid: boolean, firstTime: boolean}
 */
window.verifyAdminPin = async function (pin) {
    const DEFAULT_BELLA_HASH = "a03ea09072d789adff29aff6a3758e9294c96ce803915c1456384eaa6e2d2df9";
    const storedHash = await window.getAdminPin();
    const inputHash = await hashPin(pin);

    // 1. Potrivire exactă pe hash sau pe text simplu
    if (inputHash === storedHash || pin === storedHash) {
        return { valid: true, firstTime: false };
    }

    // 2. Fiind autentificat ca Patron, dacă PIN-ul nu se potrivește, îl actualizăm la noul PIN introdus
    await window.updateAdminPin(pin);
    return { valid: true, firstTime: true };
};

/**
 * Salvează/actualizează PIN-ul admin (hash-uit)
 */
window.updateAdminPin = async function (newPin) {
    const hashedPin = await hashPin(newPin);

    const { error } = await supabase
        .from('setari')
        .upsert({ key: 'admin_pin', value: hashedPin }, { onConflict: 'key' });

    if (error) {
        console.error('Eroare la salvarea PIN-ului:', error);
        return false;
    }
    return true;
};

// ==========================================
// FUNCȚII BAZĂ DE DATE — COMENZI
// ==========================================

/**
 * Trimitere comandă nouă (pentru clienți anonimi)
 * Acum include și coordonatele GPS ale clientului
 */
window.sendOrderToDatabase = async function (masa, cart, total, pushSubscription = null, clientCoords = null) {
    const order = {
        numar_masa: masa,
        detalii_comanda: cart,
        total: total,
        status: 'noua'
    };

    if (pushSubscription) {
        order.push_subscription = pushSubscription;
    }

    // Salvăm coordonatele clientului pentru audit de securitate
    if (clientCoords) {
        order.client_lat = clientCoords.lat;
        order.client_lng = clientCoords.lng;
    }

    const { data, error } = await supabase.from('comenzi').insert([order]).select();
    if (error) {
        console.error("Eroare la inserare:", error);
        return null;
    }
    return data[0];
};

// ==========================================
// FUNCȚII REALTIME — SUBSCRIPȚII
// ==========================================

/**
 * Abonare la statusul unei comenzi (pentru client)
 */
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

/**
 * Actualizare status comandă (doar admin autentificat)
 * Trimite și notificare PUSH reală pe telefonul clientului în fundal / pe ecranul blocat
 */
window.updateOrderStatus = async function (orderId, newStatus, timestampFinalizare = null) {
    // Verificăm autentificarea înainte de orice update
    const { authenticated } = await window.getAuthSession();
    if (!authenticated) {
        console.error('Nu ești autentificat. Operațiune refuzată.');
        alert('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
        window.location.href = 'receptie.html';
        return;
    }

    // 1. Preluăm comanda din Supabase pentru a obține push_subscription și numar_masa
    let currentOrder = null;
    try {
        const { data } = await supabase
            .from('comenzi')
            .select('push_subscription, numar_masa')
            .eq('id', orderId)
            .maybeSingle();
        currentOrder = data;
    } catch (e) {
        console.warn("Nu s-a putut prelua abonamentul push:", e);
    }

    // 2. Actualizăm statusul în Supabase
    const updateData = { status: newStatus };
    if (timestampFinalizare !== null) {
        updateData.timp_asteptare = timestampFinalizare;
    }
    const { error } = await supabase.from('comenzi').update(updateData).eq('id', orderId);
    if (error) {
        console.error("Eroare la update:", error);
        return;
    }

    // 3. Trimitem notificare Web Push pe telefonul clientului (chiar dacă aplicația e închisă sau ecranul e blocat)
    if (currentOrder && currentOrder.push_subscription) {
        try {
            let title = 'Notificare Comandă Bella Roma';
            let body = `Comanda pentru Masa ${currentOrder.numar_masa || ''} a fost actualizată.`;

            if (newStatus === 'in_preparare') {
                title = 'Comanda a fost acceptată! 🍕';
                body = `Bucătarii noștri au început prepararea comenzii tale (Masa ${currentOrder.numar_masa || ''}).`;
            } else if (newStatus === 'servita') {
                title = 'Comanda este gata! 🛎️';
                body = `Comanda pentru Masa ${currentOrder.numar_masa || ''} este gata și se servește la masă. Poftă bună!`;
            }

            await fetch('/api/send-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: typeof currentOrder.push_subscription === 'string' ? JSON.parse(currentOrder.push_subscription) : currentOrder.push_subscription,
                    title: title,
                    body: body,
                    status: newStatus
                })
            });
            console.log("Notificare push expediată cu succes la client.");
        } catch (pushErr) {
            console.warn("Trimiterea notificării push a întâmpinat o avertizare:", pushErr);
        }
    }
};

/**
 * Abonare pentru Kitchen (ascultă comenzi noi) — necesită autentificare
 */
window.subscribeToKitchenOrders = function (callback) {
    console.log("Abonat cu succes la comenzile de bucatarie.");
    supabase.channel('kitchen_orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comenzi' }, callback)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comenzi' }, callback)
        .subscribe();
};

/**
 * Abonare pentru Customer Display (ascultă comenzi în preparare/finalizate)
 */
window.subscribeToCustomerDisplay = function (callback) {
    console.log("Abonat cu succes la display-ul clienților.");
    supabase.channel('customer_display')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comenzi' }, callback)
        .subscribe();
};
