// ==========================================
// SECURITY MODULE — Bella Roma Pizzeria
// Geofencing, XSS Sanitization, Rate Limiting
// ==========================================

// ==========================================
// GEOFENCING — Coordonate Restaurant
// ==========================================
// Strada Principala 6, Drăgioiu, Râmnicu Vâlcea, 247443
const RESTAURANT_LAT = 44.8839;
const RESTAURANT_LNG = 24.2908;
const MAX_DISTANCE_METERS = 200; // Raza maximă permisă (metri)

// Pune pe 'true' pentru a PUNE PE PAUZĂ verificarea de geolocație în timpul testării!
const GEOFENCING_TEST_MODE = true; 

/**
 * Calculează distanța între două puncte GPS folosind formula Haversine
 * @returns distanța în metri
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Raza Pământului în metri
    const toRad = (deg) => deg * (Math.PI / 180);

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Verifică dacă utilizatorul se află în raza restaurantului
 * @returns Promise<{allowed: boolean, distance: number, coords: {lat, lng}, error: string|null}>
 */
window.checkGeolocation = function () {
    return new Promise((resolve) => {
        // Verificare Mod de Testare (din flag, URL ?test=1 sau localStorage)
        const urlParams = new URLSearchParams(window.location.search);
        const isTestMode = GEOFENCING_TEST_MODE || 
                           urlParams.get('test') === '1' || 
                           urlParams.get('test') === 'true' ||
                           localStorage.getItem('bypass_geo') === 'true';

        if (isTestMode) {
            console.log('⚡ Geofencing pe PAUZĂ (Mod Testare). Comanda se trimite fără restricție de locație.');
            resolve({
                allowed: true,
                distance: 0,
                coords: { lat: RESTAURANT_LAT, lng: RESTAURANT_LNG },
                error: null
            });
            return;
        }
        if (!navigator.geolocation) {
            resolve({
                allowed: false,
                distance: null,
                coords: null,
                error: 'Geolocația nu este suportată de acest browser. Te rugăm să folosești un browser modern.'
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const clientLat = position.coords.latitude;
                const clientLng = position.coords.longitude;
                const distance = haversineDistance(clientLat, clientLng, RESTAURANT_LAT, RESTAURANT_LNG);
                const allowed = distance <= MAX_DISTANCE_METERS;

                resolve({
                    allowed,
                    distance: Math.round(distance),
                    coords: { lat: clientLat, lng: clientLng },
                    error: allowed ? null : `Trebuie să fii în restaurant pentru a comanda. Ești la ${Math.round(distance)}m distanță (maxim permis: ${MAX_DISTANCE_METERS}m).`
                });
            },
            (err) => {
                let errorMsg = '';
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMsg = 'Accesul la locație a fost refuzat. Te rugăm să activezi locația din setările browserului pentru a putea comanda.';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMsg = 'Informațiile despre locație nu sunt disponibile. Te rugăm să verifici GPS-ul.';
                        break;
                    case err.TIMEOUT:
                        errorMsg = 'Cererea de locație a expirat. Te rugăm să încerci din nou.';
                        break;
                    default:
                        errorMsg = 'Eroare necunoscută la obținerea locației.';
                }
                resolve({
                    allowed: false,
                    distance: null,
                    coords: null,
                    error: errorMsg
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000 // Cache locația 1 minut
            }
        );
    });
};

// ==========================================
// XSS SANITIZATION
// ==========================================

/**
 * Escapează HTML pentru a preveni XSS
 * Folosiți ÎNTOTDEAUNA înainte de a insera date din DB în innerHTML
 */
window.escapeHTML = function (str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// ==========================================
// RATE LIMITING — Protecție Brute-Force
// ==========================================
const LOGIN_ATTEMPTS_KEY = 'bella_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minute

/**
 * Verifică dacă login-ul este blocat din cauza încercărilor eșuate
 * @returns {blocked: boolean, remainingSeconds: number}
 */
window.checkLoginRateLimit = function () {
    try {
        const stored = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
        const now = Date.now();

        if (stored.lockoutUntil && now < stored.lockoutUntil) {
            const remainingSeconds = Math.ceil((stored.lockoutUntil - now) / 1000);
            return { blocked: true, remainingSeconds };
        }

        // Dacă lockout-ul a expirat, resetăm
        if (stored.lockoutUntil && now >= stored.lockoutUntil) {
            localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
        }

        return { blocked: false, remainingSeconds: 0 };
    } catch {
        return { blocked: false, remainingSeconds: 0 };
    }
};

/**
 * Înregistrează o încercare eșuată de login
 * @returns {blocked: boolean, attemptsLeft: number}
 */
window.recordFailedLogin = function () {
    try {
        const stored = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
        const attempts = (stored.attempts || 0) + 1;

        if (attempts >= MAX_ATTEMPTS) {
            const lockoutData = {
                attempts: attempts,
                lockoutUntil: Date.now() + LOCKOUT_DURATION_MS
            };
            localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(lockoutData));
            return { blocked: true, attemptsLeft: 0 };
        }

        localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({ attempts }));
        return { blocked: false, attemptsLeft: MAX_ATTEMPTS - attempts };
    } catch {
        return { blocked: false, attemptsLeft: MAX_ATTEMPTS };
    }
};

/**
 * Resetează contorul de login (la autentificare reușită)
 */
window.resetLoginAttempts = function () {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
};

// ==========================================
// AUTH GUARD — Verificare sesiune Supabase
// ==========================================

/**
 * Verifică dacă utilizatorul este autentificat.
 * Dacă nu, ascunde conținutul și redirecționează.
 * @param {object} supabaseClient - clientul Supabase
 * @param {string} redirectUrl - URL-ul de redirect dacă nu e logat (default: owner.html)
 * @returns Promise<{authenticated: boolean, user: object|null}>
 */
window.checkAuthGuard = async function (supabaseClient, redirectUrl = 'owner.html') {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error || !session) {
            return { authenticated: false, user: null };
        }

        return { authenticated: true, user: session.user };
    } catch (e) {
        console.error('Eroare la verificarea sesiunii:', e);
        return { authenticated: false, user: null };
    }
};

// ==========================================
// VALIDARE UPLOAD FIȘIERE
// ==========================================
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Validează un fișier înainte de upload
 * @returns {valid: boolean, error: string|null}
 */
window.validateFileUpload = function (file) {
    if (!file) {
        return { valid: false, error: 'Niciun fișier selectat.' };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { valid: false, error: `Tipul fișierului nu este permis. Tipuri acceptate: JPG, PNG, WebP, GIF.` };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        return { valid: false, error: `Fișierul este prea mare (${sizeMB}MB). Dimensiunea maximă: 5MB.` };
    }

    return { valid: true, error: null };
};

console.log('🛡️ Modulul de securitate încărcat (Geofencing, XSS, Rate Limiting).');
