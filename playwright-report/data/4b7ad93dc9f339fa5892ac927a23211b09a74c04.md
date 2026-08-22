# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: waiter.spec.js >> Suita 3: Aplicația Ospătar >> Preluare manuală comandă la masă și eliberarea mesei
- Location: tests/waiter.spec.js:23:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('#table-chips-grid button').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('#table-chips-grid button').first()

```

```yaml
- text: 
- heading "BELLA ROMA" [level=2]
- paragraph: Autentificare Tură Ospătar
- text: "Nume Ospătar:"
- textbox "Nume Ospătar:":
  - /placeholder: "ex: Maria, Andrei..."
- text: "PIN Acces (4 cifre):"
- textbox "PIN Acces (4 cifre):":
  - /placeholder: ••••
- button " Intră în Tură"
- banner:
  - text:  Ospătar
  - button " Ieșire"
  - heading "BELLA ROMA" [level=1]
  - paragraph: COMANDA RAPIDĂ MESE
- text: " Deschide Masă: Apasă pentru a alege masa "
- button " Masa 25"
- button "👥 Împreună (Masa)"
- button "👤 Pers. 1"
- button "👤 Pers. 2"
- button "👤 Pers. 3"
- button "👤 Pers. 4"
- button "👤 Pers. 5"
- button "👤 Pers. 6"
- button "👤 Pers. 7"
- button "👤 Pers. 8"
- button "👤 Pers. 9"
- main:
  - text: 
  - textbox "Caută preparat sau băutură..."
  - button "🍕 Meniu Restaurant"
  - button "🍹 Meniu Bar"
  - text:  Pizza 21 preparate  Focaccia 4 preparate  Paste 7 preparate  Antipasti 4 preparate  Fel Principal 4 preparate  Desert 4 preparate  Înghețată 16 preparate
- text: "📍 Alege Masă 🛒 0 produse Total: 0.00 Lei"
- button " Vezi Coș"
- button " Trimite la Recepție" [disabled]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Suita 3: Aplicația Ospătar', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Navigam la ospatar
  6  |     await page.goto('/ospatar.html');
  7  |   });
  8  | 
  9  |   test('Harta Meselor și Starea Liberă/Ocupată', async ({ page }) => {
  10 |     // Verificam prezenta meselor (sunt butoane in grid-ul de mese)
  11 |     const tableChips = page.locator('#table-chips-grid button');
  12 |     await expect(tableChips.first()).toBeVisible({ timeout: 15000 });
  13 |     
  14 |     // Selectam "Masa 1" 
  15 |     const masa1 = tableChips.filter({ hasText: 'Masa 1' }).first();
  16 |     await masa1.click();
  17 | 
  18 |     // Verificam ca eticheta mesei s-a schimbat in panou
  19 |     const activeTableBadge = page.locator('#ospatar-active-table-badge');
  20 |     await expect(activeTableBadge).toContainText('Masa 1');
  21 |   });
  22 | 
  23 |   test('Preluare manuală comandă la masă și eliberarea mesei', async ({ page }) => {
  24 |     // Asteptam sa apara mesele
  25 |     const tableChips = page.locator('#table-chips-grid button');
> 26 |     await expect(tableChips.first()).toBeVisible({ timeout: 15000 });
     |                                      ^ Error: expect(locator).toBeVisible() failed
  27 | 
  28 |     // Alegem Masa 10 (sau o masa random de test) pt a o ocupa
  29 |     const masaTest = tableChips.filter({ hasText: 'Masa 10' }).first();
  30 |     await masaTest.click();
  31 | 
  32 |     // Selectam "Persoana 1"
  33 |     const persoana1 = page.locator('.person-chip').filter({ hasText: 'Persoana 1' });
  34 |     await persoana1.click();
  35 | 
  36 |     // Adaugam un produs
  37 |     const addButtons = page.locator('button', { hasText: 'Adaugă' });
  38 |     await expect(addButtons.first()).toBeVisible({ timeout: 15000 });
  39 |     await addButtons.first().click();
  40 | 
  41 |     // Trimitem comanda pentru a "ocupa" masa
  42 |     const btnTrimite = page.locator('#btn-trimite-comanda-ospatar');
  43 |     await btnTrimite.click();
  44 | 
  45 |     // Dupa trimitere, Masa 10 ar trebui sa apara "Ocupata" pe buton (stilizare red) 
  46 |     // sau pur si simplu sa apara butonul de eliberare
  47 |     // Acceptam popup-ul de confirmare automat
  48 |     page.on('dialog', dialog => dialog.accept());
  49 |     
  50 |     const btnElibereaza = page.locator('#ospatar-free-table-btn-container button').filter({ hasText: 'Eliberează' });
  51 |     
  52 |     // Uneori e nevoie de cateva secunde pentru ca realtime-ul sa proceseze comanda
  53 |     await expect(btnElibereaza).toBeVisible({ timeout: 15000 });
  54 | 
  55 |     // Eliberam masa
  56 |     await btnElibereaza.click();
  57 | 
  58 |     // Butonul de eliberare ar trebui sa dispara cand masa revine la libera
  59 |     await expect(btnElibereaza).not.toBeVisible({ timeout: 10000 });
  60 |   });
  61 | });
  62 | 
```