# Task: Îngroșarea (Bold) produselor pe bonul de printare

## Obiectiv
Modificarea stilului vizual al bonului generat prin QZ Tray pentru ca denumirea produselor și cantitatea să apară cu text îngroșat (bold), pentru o mai bună lizibilitate la imprimanta termică POS-80.

## Detalii Tehnice
Trebuie să intervii în fișierul care generează `template`-ul HTML al bonului (cel care este trimis către QZ Tray).

### Acțiuni necesare:
1. **Localizare:** Identifică secțiunea din codul sursă unde se face maparea produselor (bucla care iterează prin `produseComanda` sau similar).
2. **Modificare CSS/HTML:** 
   - Înconjoară elementele care afișează produsul și cantitatea cu un tag `<b>` sau un `span` cu stilul `font-weight: bold`.
   - **Exemplu de modificare:**
     ```html
     <!-- În loc de -->
     <div>${produs.nume}</div>
     
     <!-- Folosește -->
     <div style="font-weight: bold;">${produs.cantitate}x ${produs.nume}</div>
     ```

## Cerințe Suplimentare
* Verifică dacă în același șablon este prezentă declarația `<meta charset="UTF-8">` în secțiunea `<head>`, pentru a preveni erorile de afișare a diacriticelor (cum a fost cazul cu „Împreună”).
* Asigură-te că stilul `font-weight: bold` nu este suprascris de alte clase CSS globale.

## Testare
* După aplicarea modificării și push pe Vercel, efectuează o printare de test din aplicație pentru a verifica dacă textul apare îngroșat pe bonul tipărit.