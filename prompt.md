# 🧪 Plan Complet de Testare și Verificare — Bella Roma Pub & Pizzerie

Acest document reprezintă protocolul oficial de testare pentru aplicația web modulară **Bella Roma**, bazat pe arhitectura actuală (Frontend modular ES, Supabase Realtime, Geofencing și module dedicate de Recepție, Ospătar, Admin și Meniu Digital Client).

---

## 1. 🏢 Teste pentru Panoul Central de Conducere (`receptie.html` + `js/owner.js`)
*   **Accesibilitate și Navigare:** 
    *   Verifică dacă paginile secundare se deschid corect prin butoanele rapide din panou (Pagina Ospătar, Admin Meniu, Istoric Încasări).
*   **Comenzi în Timp Real & Notificări:**
    *   Simulează plasarea unei comenzi de pe un dispozitiv client și verifică recepționarea instantanee în panou (prin WebSockets/Supabase Realtime) însoțită de semnalul sonor de alertă.
*   **Afișare Defalcată pe Persoane:**
    *   Verifică dacă preparatele sunt grupate corect în casete colorate distincte pentru **`👥 Comandă Împreună`** și per persoană (**`👤 Persoana 1`**, **`👤 Persoana 2`**...).
    *   Verifică corectitudinea calculului pentru insigna verde de plată: **`De plată: XX.XX Lei`** per fiecare persoană.
*   **Istoric Încasări:**
    *   Verifică dacă închiderea/finalizarea comenzilor actualizează corect totalul încasărilor zilnice și istoricul din baza de date.

---

## 2. 📱 Teste pentru Aplicația Ospătarului (`ospatar.html` + `js/ospatar.js`)
*   **Harta Meselor în Timp Real:**
    *   Verifică starea vizuală a meselor pe grila interactivă (🟢 **Liberă** vs 🔴/🟠 **Ocupată** în funcție de comenzile active).
*   **Preluarea Comenzilor la Masă:**
    *   Testează fluxul în care ospătarul selectează o masă și adaugă preparate atribuite direct pe persoane (`Persoana 1`, `Persoana 2`).
*   **Eliberarea Mesei:**
    *   Verifică funcționalitatea butonului dedicat **„Eliberează Masa”** și confirmă că starea mesei revine instant la `Liberă` în baza de date Supabase.

---

## 3. ⚙️ Teste pentru Panoul de Administrare Meniu (`admin.html` + `js/admin.js`)
*   **Securitate Acces:**
    *   Verifică dacă panoul este protejat corespunzător prin sistemul de autentificare PIN / sesiune (interzicerea accesului neautorizat).
*   **Operațiuni CRUD în Timp Real:**
    *   Testează adăugarea unui preparat nou (nume, descriere, preț, categorie, imagine_url) și verifică prezența lui instantanee în baza de date tabelară `meniu`.
    *   Testează modificarea și ștergerea unui produs existent, asigurându-te că schimbările se reflectă imediat în interfața clienților.

---

## 4. 🍕 Teste pentru Meniul Digital al Clientului (`meniu.html` + `js/app.js`)
*   **Detectare Automată Masă:**
    *   Accesează link-ul clientului cu parametru în URL (ex: `?masa=5`) și verifică extragerea corectă a numărului mesei.
*   **Header Selecție Persoană & Comandă Defalcată:**
    *   Testează comutarea între `👥 Comandă Împreună` și opțiunile individuale (`👤 Persoana 1`, `👤 Persoana 2` ... `👤 Persoana 6`).
    *   Verifică dacă eticheta butoanelor din meniu se schimbă dinamic în `Alegerea mea (...)` la apăsare.
*   **Coș Transparent & PWA:**
    *   Verifică gruparea corectă a produselor pe persoane în coș înainte de trimiterea comenzii.
    *   Testează instalarea ca aplicație nativă (PWA) pe ecranul principal al dispozitivului mobil.
*   **Modul de Securitate Geofencing GPS (`js/security.js`):**
    *   Testează comportamentul aplicației când utilizatorul se află în afara razei permise (max 500m de restaurant) – sistemul trebuie să blocheze sau să semnaleze comanda falsă.
    *   Verifică aplicarea funcțiilor de igienizare anti-XSS (`escapeHTML`) și respectarea regulilor de Rate Limiting pe butoanele de trimitere comandă.

---

## 5. 🚀 Teste de Performanță și Deploy (Vercel & Supabase)
*   **Vite Build & Viteza de Compilare:**
    *   Rulează comanda de build local/remote și verifică timpul de compilare (țintă sub 160ms) fără erori de fișiere lipsă.
*   **Integritate Tabele Supabase:**
    *   Validează structura tabelelor PostgreSQL: `meniu` (id, nume, descriere, pret, categorie, imagine_url), `comenzi` (id, numar_masa, detalii_comanda JSONB, total, status, latitude, longitude) și `mese` (id, numar_masa, status).
*   **Deploy Automat (CI/CD):**
    *   Verifică dacă fluxul automat spre Vercel funcționează corect la orice commit pe branch-ul principal și nu generează erori de rute sau resurse blocate în consolă.