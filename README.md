# 🍕 Bella Roma - Pub & Pizzerie

Aplicație PWA (Progressive Web App) Serverless pentru preluarea și gestionarea comenzilor la masă în timp real, concepută pentru performanță maximă, zero costuri fixe de găzduire și utilizare intuitivă pe orice dispozitiv.

## 📱 Structura Proiectului (Aplicații Modulare)

1. **Recepție / Panou de Conducere (`receptie.html`)**
   - Interfața centrală pentru primirea comenzilor în timp real.
   - Afișează comenzile defalcate pe persoane, calculează totalurile per persoană.
   - Notificări audio și suport pentru printare automată a bonurilor termice (POS).
   - *Notă: `owner.html` redirecționează către această pagină.*

2. **Aplicația Ospătarului (`ospatar.html`)**
   - Harta meselor în timp real (liber/ocupat).
   - Preluare comenzi direct la masă, grupate pe persoane.

3. **Meniul Digital al Clientului (`meniu.html`)**
   - Interfață scanabilă via cod QR (ex: `?masa=5`).
   - Clienții vizualizează meniul, pot comanda la comun sau defalcat ("Persoana 1", "Persoana 2").
   - Securitate Geofencing (GPS) și Rate Limiting.
   - *Notă: `index.html` redirecționează către această pagină preluând datele mesei.*

4. **Panoul de Administrare (`admin.html`)**
   - Interfață protejată pentru gestiunea meniului (adăugare/editare produse, upload imagini în Supabase Storage).
   - Sincronizare în timp real cu baza de date.

## 🛠 Tehnologii Folosite

- **Frontend**: HTML5, Vanilla CSS (Glassmorphism UI), JavaScript ES6 (ES Modules).
- **Backend & Bază de Date**: Supabase (PostgreSQL, Storage).
- **Comunicare**: Supabase Realtime (WebSockets) pentru actualizări instantanee pe toate ecranele.
- **Securitate**: Rate Limiting, XSS Protection, CSP (Content Security Policy), Geofencing.
- **Hosting / Deploy**: Vercel (CI/CD automatizat prin GitHub).
- **Build Tool**: Vite (bundler extrem de rapid).

## 🚀 Mod de Utilizare Locală

1. Asigurați-vă că aveți instalat **Node.js**.
2. Instalați dependențele proiectului:
   ```bash
   npm install
   ```
3. Porniți serverul de dezvoltare:
   ```bash
   npm run dev
   ```
4. Deschideți `http://localhost:5173` în browser (aplicația vă va redirecționa automat spre `/meniu.html`). Puteți naviga manual la `/receptie.html` sau `/ospatar.html`.

---
*Pentru detalii tehnice aprofundate, arhitectură, schema bazei de date și modificările recente, consultați **[Documentația MVP (Proiect_MVP_Pizzerie.md)](./Proiect_MVP_Pizzerie.md)***.
