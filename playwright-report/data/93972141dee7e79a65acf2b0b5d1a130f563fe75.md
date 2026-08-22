# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: client.spec.js >> Suita 1: Meniu Client & Geofencing >> Selecția de persoane schimbă eticheta butoanelor
- Location: tests/client.spec.js:19:7

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator: locator('.person-chip').filter({ hasText: 'Împreună' })
Expected: "700"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveCSS" with timeout 5000ms
  - waiting for locator('.person-chip').filter({ hasText: 'Împreună' })

```

```yaml
- banner:
  - heading "BELLA ROMA" [level=1]
  - paragraph: PUB & PIZZERIE
- main:
  - text: 
  - textbox "Caută preparat sau băutură..."
  - button "🍕 Meniu Restaurant"
  - button "🍹 Meniu Bar"
  - link "Pizza":
    - /url: "#cat-Pizza"
  - link "Focaccia":
    - /url: "#cat-Focaccia"
  - link "Paste":
    - /url: "#cat-Paste"
  - link "Antipasti":
    - /url: "#cat-Antipasti"
  - link "Fel Principal":
    - /url: "#cat-Fel-Principal"
  - link "Desert":
    - /url: "#cat-Desert"
  - link "Înghețată":
    - /url: "#cat-Înghețată"
  - paragraph: Eroare neașteptată.
- button " Coșul Tău 0 0.00 Lei"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Suita 1: Meniu Client & Geofencing', () => {
  4  |   // Configurare permisiuni de geolocatie si simulare coordonate valide (aproape de restaurant)
  5  |   test.use({
  6  |     geolocation: { latitude: 44.4268, longitude: 26.1025 }, // Exemplu coordonate valide (Bucuresti centru)
  7  |     permissions: ['geolocation'],
  8  |   });
  9  | 
  10 |   test('Detectare automată a mesei din URL', async ({ page }) => {
  11 |     // Accesam meniul cu parametrul masa=5
  12 |     await page.goto('/meniu.html?masa=5');
  13 |     
  14 |     // Asteptam sa apara textul "Masa 5" sau doar "5" in elementul #masa-id
  15 |     const masaId = page.locator('#masa-id');
  16 |     await expect(masaId).toContainText('5');
  17 |   });
  18 | 
  19 |   test('Selecția de persoane schimbă eticheta butoanelor', async ({ page }) => {
  20 |     await page.goto('/meniu.html?masa=5');
  21 |     
  22 |     // Implicit ar trebui să fie "Împreună"
  23 |     const buttonImpreuna = page.locator('.person-chip').filter({ hasText: 'Împreună' });
> 24 |     await expect(buttonImpreuna).toHaveCSS('font-weight', '700');
     |                                  ^ Error: expect(locator).toHaveCSS(expected) failed
  25 | 
  26 |     // Asteptam sa se incarce produsele
  27 |     await page.waitForSelector('.btn-alegere');
  28 |     
  29 |     // Verificam ca eticheta butonului de adaugare este pentru "Împreună"
  30 |     const btnAlegere = page.locator('.btn-alegere').first();
  31 |     await expect(btnAlegere).toContainText('Împreună');
  32 | 
  33 |     // Apasam pe "Persoana 1"
  34 |     const buttonPersoana1 = page.locator('.person-chip').filter({ hasText: 'Persoana 1' });
  35 |     await buttonPersoana1.click();
  36 |     
  37 |     // Verificam ca textul butonului de adăugare s-a schimbat
  38 |     await expect(btnAlegere).toContainText('Persoana 1');
  39 |     
  40 |     // Verificam ca eticheta s-a schimbat
  41 |     await expect(buttonPersoana1).toHaveCSS('font-weight', '700');
  42 |   });
  43 | 
  44 |   test('Adăugare în coș și grupare pe persoane', async ({ page }) => {
  45 |     await page.goto('/meniu.html?masa=5');
  46 |     await page.waitForSelector('.btn-alegere');
  47 | 
  48 |     // Alegem Persoana 1 si adaugam primul produs
  49 |     await page.locator('.person-chip').filter({ hasText: 'Persoana 1' }).click();
  50 |     await page.locator('.btn-alegere').first().click();
  51 | 
  52 |     // Verificam cosul
  53 |     const cartItems = page.locator('#cart-items');
  54 |     await expect(cartItems).toContainText('Persoana 1');
  55 |   });
  56 | });
  57 | 
```