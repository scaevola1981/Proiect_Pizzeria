# Bella Roma - Pub & Pizzerie

Aplicație PWA (Progressive Web App) Serverless pentru preluarea și gestionarea comenzilor la masă, utilizând coduri QR.

## Module Principale
1. **Meniul Clientului (`index.html`)** - Interfață scanabilă via QR (ex: `?masa=5`), de unde clienții vizualizează meniul, personalizează produsele (fără ceapă, alergii etc.) și trimit comenzile.
2. **Panoul Recepție (`owner.html`)** - Sistem Realtime pentru gestionarea comenzilor, destinat ospătarilor. Acceptă comenzile, le schimbă statusul și are opțiune securizată de "Încheiere Zi de Muncă" (cu arhivare automată și calcul total încasări).
3. **Panoul Administrare (`admin.html`)** - Interfață parolatã pentru adăugarea și modificarea produselor în meniu (cu încărcare poze în baza de date).

## Tehnologii Folosite
- **Frontend**: HTML5, CSS3 (Glassmorphism UI), JavaScript ES6 (Vanilla)
- **Backend**: Supabase (PostgreSQL, Storage, WebSockets Realtime)
- **Notificări Push**: Web Push API, Service Workers, Vercel Serverless Functions (`api/send-push.js`)
- **Hosting**: Vercel
- **Build Tool**: Vite (doar pentru procesare locală și environment)

## Funcționalități Cheie
- **Notificări de Fundal (Push)**: Când o comandă este acceptată, telefonul clientului (chiar și cu ecranul blocat) primește o notificare de sistem (Web Push) prin intermediul unui Service Worker și un server Vercel.
- **Sistem PWA pentru iOS/Android**: Aplicația poate fi instalată pe ecranul principal (Home Screen) pentru a se comporta nativ, inclusiv cu memorarea automată a numărului mesei.
- **Modul Realtime**: Comenzile apar instant în fața ospătarilor fără ca pagina să fie reîncărcată (Supabase Realtime).
- **Audio API**: Sunete dinamice generate prin `AudioContext` pentru notificări în aplicație, ocolind restricțiile browserelor mobile.

## Mod de Utilizare Locală
1. Asigurați-vă că aveți `node.js` instalat.
2. Instalați dependențele: `npm install`
3. Rulați mediul de dezvoltare: `npm run dev`
4. Deschideți `http://localhost:5173`

*Toate datele (inclusiv produsele) sunt preluate din baza de date Supabase.*
