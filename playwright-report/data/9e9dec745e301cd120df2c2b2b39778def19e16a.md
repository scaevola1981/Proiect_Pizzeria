# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: client.spec.js >> Suita 1: Meniu Client & Geofencing >> Adăugare în coș și grupare pe persoane
- Location: tests/client.spec.js:44:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.btn-alegere') to be visible

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - heading "BELLA ROMA" [level=1] [ref=e4]
      - paragraph [ref=e5]: PUB & PIZZERIE
  - main [ref=e7]:
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]: 
        - textbox "Caută preparat sau băutură..." [ref=e11]
      - generic [ref=e12]:
        - button "🍕 Meniu Restaurant" [ref=e13] [cursor=pointer]
        - button "🍹 Meniu Bar" [ref=e14] [cursor=pointer]
      - generic [ref=e15]:
        - link "Pizza" [ref=e16] [cursor=pointer]:
          - /url: "#cat-Pizza"
        - link "Focaccia" [ref=e17] [cursor=pointer]:
          - /url: "#cat-Focaccia"
        - link "Paste" [ref=e18] [cursor=pointer]:
          - /url: "#cat-Paste"
        - link "Antipasti" [ref=e19] [cursor=pointer]:
          - /url: "#cat-Antipasti"
        - link "Fel Principal" [ref=e20] [cursor=pointer]:
          - /url: "#cat-Fel-Principal"
        - link "Desert" [ref=e21] [cursor=pointer]:
          - /url: "#cat-Desert"
        - link "Înghețată" [ref=e22] [cursor=pointer]:
          - /url: "#cat-Înghețată"
    - paragraph [ref=e24]: Eroare neașteptată.
  - button " Coșul Tău 0 0.00 Lei" [ref=e25] [cursor=pointer]:
    - generic [ref=e26]: 
    - generic [ref=e27]: Coșul Tău
    - generic [ref=e28]: "0"
    - generic [ref=e29]: 0.00 Lei
  - text:   
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
  24 |     await expect(buttonImpreuna).toHaveCSS('font-weight', '700');
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
> 46 |     await page.waitForSelector('.btn-alegere');
     |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
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