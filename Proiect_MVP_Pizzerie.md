# 🍕 Documentație Tehnică & Operațională — Bella Roma Pub & Pizzerie (La Zi)

Documentația oficială actualizată a platformei web și a sistemului POS **Bella Roma Pub & Pizzerie**.

---

## 🎯 1. Prezentare Generală & Arhitectură
Aplicația este o platformă completă de gestiune a comenzilor, meselor și meniului digital în timp real, concepută pentru performanță maximă, zero costuri fixe de infrastructură și operare fluidă pe orice dispozitiv (ecrane tactile POS All-in-One, PC, telefoane Android/iOS și tablete).

* **Frontend:** HTML5, Vanilla CSS (Design modern Glassmorphism, layout adaptiv POS), JavaScript Modular (ES Modules).
* **Bundler & Build:** Vite (compilare în sub 300ms) găzduit pe **Vercel** cu deplasare automată din repo-ul GitHub.
* **Backend & Bază de Date:** **Supabase PostgreSQL** cu abonare la evenimente în timp real (**Realtime WebSockets**).
* **Sistem de Printare Bonuri:** Integrare **QZ Tray v2.2** cu semnare digitală locală RSA SHA-512 (fără alerte manuale), suport USB nativ pentru imprimante termice 80mm (ex: **OCOM OCPP-80K**, POS-80).
* **Securitate & Control Acces:** Supabase Auth (Email/Parolă), PIN Admin dinamic, Rate Limiting, sanitizare XSS (`escapeHTML`), Content Security Policy (CSP) și Geofencing GPS.
* **Management Versiuni (Git Branching):**
  - Ramura `main` ➔ **Producție Live** la restaurant (Vercel).
  - Ramura `dev` ➔ **Dezvoltare & Testare** izolată, fără risc de a perturba clienții sau imprimanta din restaurant.

---

## 📱 2. Structura Paginilor & Modulelor

### 🏢 1. `receptie.html` + `js/owner.js` — Panoul Central de Recepție & POS
Panoul principal de comandă și afișare a comenzilor active pe monitorul POS de la recepție:
* **Optimizat pentru Rezoluția POS 1024x768:**
  - Antet compact (**70px**) cu titlu orizontal pe un singur rând pentru a maximiza spațiul util.
  - Grilă adaptivă pe **3-4 coloane** de comenzi (`minmax(230px, 1fr)`) fără scroll orizontal.
* **Afișare Defalcată pe Persoane:**
  - Preparatele sunt grupate pe etichete clare: `👥 Comandă Împreună` sau `👤 Persoana 1`, `👤 Persoana 2` etc.
  - Calculează și afișează automat insigna verde cu subtotalul per persoană (`De plată: XX.XX Lei`).
* **Flux Automat de Comandă & Tranziție Butoane:**
  - La sosirea comenzii, bonul este **printat automat**, iar comanda trece automat în statusul `in_preparare`.
  - **Pasul 1:** Butonul de pe card devine verde: `✓ Comandă Printată (Marchează Servită)`.
  - **Pasul 2:** La apăsare, statusul devine `servita`, iar butonul devine roșu: `🧹 Eliberează Masa X`.
  - **Pasul 3:** La eliberare, comanda este arhivată în istoric, iar masa redevine liberă.
* **Formatare Profesională a Bonului Termic (72mm / 80mm):**
  - Denumirile și cantitățile produselor sunt **îngroșate (Bold)** pentru lizibilitate maximă la bucătărie.
  - Separare text curată: `--- [ IMPREUNA ] ---` și `--- [ PERSOANA X ] ---` (fără emoji-uri care pot genera caractere corupte pe imprimantă).
  - Lățime printabilă calibrată la **72mm** cu padding de siguranță (fără tăierea textului sau a numerelor de pe marginea din dreapta).
  - Mențiune automată `*** BON SUPLIMENTAR ***` dacă se adaugă produse noi la o masă deja deschisă.
* **Istoric & Rapoarte:** Acces rapid la panoul de istoric comenzi și totaluri încasări pe ultimele 7 zile.

---

### 📱 2. `ospatar.html` + `js/ospatar.js` — Aplicația Mobilă a Ospătarilor
Interfața fluidă pentru ospătari, optimizată pentru comenzi rapide la mese:
* **Harta Meselor în Timp Real:**
  - 🟢 **Liberă** (disponibilă pentru comenzi noi)
  - 🔴/🟠 **Ocupată** (masă cu clienți și comenzi active)
* **Bară de Control Sticky & Căutare:**
  - Bara de căutare, tab-urile mari (*Restaurant / Bar*) și pastilele de subcategorii (*Pizza, Paste, Bere, Cafea*) rămân fixate sus la derulare pentru acces instantaneu.
* **Modal Coș Aerisit (`#cart-modal`):**
  - Coșul static din josul paginii a fost înlocuit cu un modal modern accesibil prin butonul plutitor `📋 Vezi Coș`.
  - Oferă spațiu maxim pe ecran pentru explorarea meniului stufos.
* **Comandă pe Persoane & Suplimentare:**
  - Posibilitate de adăugare produse pe persoane separate.
  - Trimiterea de suplimentări la mese existente (se emit doar produsele noi pe bonul de bucătărie).

---

### ⚙️ 3. `admin.html` + `js/admin.js` — Administrare Meniu & Program
Panoul securizat pentru managementul restaurantului:
* **Autentificare Hibridă:**
  - Verificare sesiune Supabase Auth + PIN Admin de 4 cifre.
* **Gestiune Produse (Mâncare & Băuturi):**
  - Adăugare, editare preț/ingrediente/categorie și ștergere produse.
  - Încărcare fotografii și previzualizare instantanee.
  - Tab-uri dedicate pentru *Meniu Restaurant* și *Meniu Bar* cu subcategorii generate dinamic.
* **Program de Funcționare (Prevenire Comenzi Fantomă):**
  - Setare ore de deschidere și închidere (ex: 10:00 - 23:00).
  - Comutator **„Forțează Închiderea Acum”**: blochează instantaneu aplicația clienților în caz de evenimente private sau închidere anticipată.
  - Starea se sincronizează în timp real cu tabelul `setari`.
* **Schimbare Credențiale:**
  - Schimbare parolă cont general și actualizare PIN Admin direct din interfață.

---

### 🍕 4. `meniu.html` + `js/app.js` — Meniul Digital al Clientului (QR la Masă)
Aplicația clientului accesată prin scanarea codului QR de pe masă (`?masa=X`):
* **Detectare Automată Masă:** Extrage numărul mesei din link-ul QR.
* **Selector Persoană în Header:**
  - `👥 Comandă Împreună (Plată Comună)`
  - `👤 Persoana 1`, `👤 Persoana 2` ... `👤 Persoana 6` (pentru comenzi defalcate).
* **Personalizare Preparate:** Adăugare mențiuni și instrucțiuni speciale de preparare.
* **Geofencing GPS:** Previne comenzile false dacă clientul se află la mai mult de 500m de locația fizică a restaurantului.
* **Compatibilitate PWA:** Posibilitate de instalare directă pe ecranul telefonului mobil.

---

## 🖨️ 3. Arhitectura de Printare (QZ Tray & Hardware POS)

* **Hardware Conectat:**
  - **POS:** Sistem All-in-One cu ecran tactil POS EXPERT (Windows).
  - **Imprimantă:** Imprimantă termică de bonuri **OCOM OCPP-80K** (80mm, 300mm/s), conectată prin **cablu USB direct** la POS.
* **Mod de Lucru QZ Tray:**
  - Comunică pe canal local securizat `wss://localhost:8182`.
  - Autentificare cu certificat digital auto-semnat (`digital-certificate.txt`) și semnare RSA SHA-512 via `jsrsasign`, eliminând orice fereastră de confirmare în browser.
  - Script automat de configurare: `public/setup-qz-tray.bat`.
* **Perspectivă Viitoare (Modul In-House):**
  - Înlocuirea QZ Tray cu un micro-serviciu/agent nativ executabil (`.exe`) conectat direct la Supabase Realtime, cu protocol direct ESC/POS (tăiere automată ghilotină, buzzer beep și viteză instantanee).

---

## 🗄️ 4. Schema Bazei de Date (Supabase PostgreSQL)

### 1. Tabelul `meniu`
```sql
CREATE TABLE meniu (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nume TEXT NOT NULL,
    descriere TEXT,
    pret NUMERIC(10,2) NOT NULL,
    categorie TEXT DEFAULT 'restaurant',
    imagine_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Tabelul `comenzi`
```sql
CREATE TABLE comenzi (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    numar_masa TEXT NOT NULL,
    detalii_comanda JSONB NOT NULL, -- Array: [{ product, quantity, notes, customer_name, is_new }]
    total NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'noua',     -- 'noua', 'in_preparare', 'servita'
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Tabelul `mese`
```sql
CREATE TABLE mese (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    numar_masa INT UNIQUE NOT NULL,
    status TEXT DEFAULT 'libera',   -- 'libera', 'ocupata'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Tabelul `setari`
```sql
CREATE TABLE setari (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Chei utilizate: 'admin_pin', 'store_open_time', 'store_close_time', 'store_force_close'
```

---

## 🚀 5. Rezumatul Ultimelor Îmbunătățiri Aplicate

1. ✅ **Optimizare Ecran POS (1024x768):** Header redus la 70px, carduri compacte pe 3-4 coloane.
2. ✅ **Corectare Format Bon Termic:** Produse bold, lățime calibrată la 72mm, eliminare caractere speciale neacceptate (`--- [ IMPREUNA ] ---`).
3. ✅ **Remediere Panou Admin:** Încărcare imediată a listei de produse și reflectare corectă a stării butonului de închidere forțată.
4. ✅ **Tranziție Butoane Comandă:** Comandă Printată ➔ Marchează Servită ➔ Eliberează Masa.
5. ✅ **Izolare Mediu Dev (`git branch dev`):** Protejarea completă a producției restaurantului în timpul dezvoltării de noi funcții.

---
*Ultima actualizare a documentației: 19 August 2026*