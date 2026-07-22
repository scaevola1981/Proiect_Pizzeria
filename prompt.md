Obiectiv: Refactorizarea logicii MVP-ului pentru a elimina mock-ul de localStorage, a pregăti terenul pentru Supabase și a repara sistemul de gestionare a timpului.

Fișiere vizate: `js/app.js`, `js/supabase.js`, `kitchen.html`, `customer-display.html`.

Sarcini stricte de execuție:
1. Eliminarea Mock-ului: În `js/supabase.js` și `js/app.js`, șterge absolut toată logica bazată pe `localStorage` și `window.dispatchEvent('storage')`. Lasă în `supabase.js` doar scheletul gol pregătit pentru inițializarea clientului Supabase real (variabilele de URL și Key).
2. Logica de Timp (Timestamp Absolut): Modifică modalul din `kitchen.html` și logica asociată din JavaScript. Bucătarul nu trebuie să mai introducă "minute" (ex: 15 min). Modifică input-ul astfel încât să genereze un Timestamp (o oră viitoare). 
3. Regula Intervalelor: Orice timp estimat setat de bucătărie trebuie restricționat și rotunjit automat pentru a fi afișat exclusiv în ore întregi sau în intervale de 30 de minute (ex. 14:00, 14:30, 15:00). Nicio altă valoare intermediară nu este permisă în interfață sau în baza de date.
4. Display-ul Clientului: Actualizează scriptul din `customer-display.html`. În loc să scadă un număr fix de minute, scriptul trebuie să primească Timestamp-ul (ex: 14:30) și să calculeze dinamic diferența față de ora curentă (`Date.now()`) pentru a afișa timpul rămas.
5. Stilizare: Asigură-te că orice element UI nou generat (cum ar fi noile selectoare de timp) primește automat clasa `.glass-panel` pentru a păstra coerența vizuală.