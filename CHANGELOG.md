# Changelog

Acest fișier documentează toate modificările importante aduse proiectului Bella Roma MVP.

## [2026-07-25] - Integrare PWA, Web Push și Reparații Vercel
- **Fix**: Reparare eroare `SyntaxError` din serverul Vercel cauzată de mixarea modulelor ES6 (`export default`) cu cele CommonJS (`require`). Trecere exclusivă pe export CommonJS.
- **Fix**: Hardcodare chei VAPID (publice și private) pentru a asigura stabilitatea executării atât în Frontend (Vite build) cât și în Vercel API.
- **Fix**: Eliminare `start_url` din manifestul principal pentru a permite păstrarea numărului mesei (query params) la instalarea PWA de către client.
- **Feat**: Separare Manifesturi. Creare `manifest-owner.json` exclusiv pentru panoul de Recepție și direcționare corectă a `start_url`.
- **Feat**: Suport iOS Safari PWA. Adăugare `apple-touch-icon` și metatag-uri specifice Apple.
- **Feat**: Sistem Web Push Notifications. Generare dinamică de abonamente Push, expediate prin API-ul Vercel și ascultate cu Service Worker (`sw.js`).
- **Fix**: Rezolvarea erorilor de cale iconițe (din `logo.png` în `icon.png`).
- **Feat**: Notificări în aplicație cu sunet (in-app audio trigger, sintetizator dinamic `AudioContext`).
- **Feat**: Notificări push pe statusurile `in_preparare` și `servita`.
- **Design**: Butoane cu aspect iOS și animații CSS ajustate.

## [2026-07-24] - Funcționalități Owner și Glassmorphism
- **Feat**: Sistemul de "Încheiere Zi de Muncă". Parolare proces, calcul total încasări zilnice și ascunderea comenzilor arhivate.
- **Feat**: Modal de confirmare pentru terminarea zilei și modal pentru vizualizarea Istoricului (ultimele 7 zile).
- **Feat**: Proces automatizat de ștergere definitivă a comenzilor mai vechi de 7 zile din istoricul bazei de date.
- **Design**: Trecere masivă spre tema "Glassmorphism Dark" pentru toate panourile și ferestrele modale.
- **Fix**: Corectarea layout-ului pe telefoane mobile (responsivitate).
- **Feat**: Refactorizare flow logic al comenzilor (Nouă -> În preparare -> Servită -> Arhivată la final de zi).

## [2026-07-22] - Supabase, Configurare, Realtime
- **Feat**: Setup inițial Vite Build (configurări Vercel).
- **Feat**: Crearea bazei de date Supabase și definirea structurii SQL pentru tabelele `comenzi` și `produse`.
- **Feat**: Funcție `Supabase Realtime` pentru a emite evenimentele către `owner.html` fără refresh.
- **Feat**: Conectare dinamică a listei de produse. Descărcare direct din tabela de Supabase, renunțare la date mock hardcodate.
- **Feat**: Panou Admin capabil să încarce poze direct în Supabase Storage (`meniu-imagini`).
- **Initial**: Primul commit. Setup HTML, CSS Vanilla și arhitectură client.
