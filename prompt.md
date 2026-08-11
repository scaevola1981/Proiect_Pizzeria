# Business Logic: Gestiunea Meselor (proiect-pizzeria-MVP)

**Scenariu:** Menținerea comenzii deschise și cumularea produselor pentru o masă ocupată.

Acest document descrie logica pe care agentul trebuie să o implementeze pentru a gestiona adăugarea de produse noi la o masă care are deja o comandă activă.

## 1. Masă Ocupată (Comanda Inițială)
* La preluarea primei comenzi de către ospătar, sistemul alocă un **ID unic de comandă** asociat mesei respective.
* Statusul mesei se schimbă în `Ocupată`.
* Bonul inițial este trimis automat către secțiile de preparare (ex: bucătărie).

## 2. Actualizare Comandă (Suplimentare)
* Cât timp masa este marcată ca `Ocupată`, orice produs nou adăugat de ospătar trebuie atașat **la aceeași comandă principală** (același ID unic).
* La momentul trimiterii suplimentării, sistemul trebuie să emită către bucătărie **doar produsele noi**, pentru a evita prepararea dublă.
* În baza de date (sau în state-ul aplicației), nota de plată finală va cumula toate produsele adăugate succesiv pe parcursul șederii clienților.

## 3. Eliberare Masă (Finalizare)
* Comanda principală rămâne deschisă și poate primi completări până când ospătarul apasă explicit un buton de finalizare (ex: `Masă Liberă`, `Închide Comanda` sau `Achitat`).
* Doar în acel moment, ciclul comenzii curente se închide definitiv, iar masa redevine disponibilă pentru a primi un nou ID de comandă.