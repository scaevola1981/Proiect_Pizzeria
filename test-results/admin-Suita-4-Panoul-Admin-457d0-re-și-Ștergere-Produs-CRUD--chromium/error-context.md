# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.js >> Suita 4: Panoul Admin >> Creare, Editare și Ștergere Produs (CRUD)
- Location: tests/admin.spec.js:21:7

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  locator('#login-overlay')
Expected: not visible
Received: visible
Timeout:  10000ms

Call log:
  - Expect "not toBeVisible" with timeout 10000ms
  - waiting for locator('#login-overlay')
    24 × locator resolved to <div id="login-overlay">…</div>
       - unexpected value "visible"

```

```yaml
- heading " Acces Administrare Meniu" [level=2]
- paragraph: Autentificați-vă cu Email, Parolă și PIN Admin.
- textbox "Email": dorobantuflorin81@gmail.com
- textbox "Parola": Bella-Roma
- textbox "🔑 PIN Admin (4 cifre)": "1234"
- button " Deblochează Meniu"
- paragraph: "Email sau parolă incorectă: Invalid login credentials"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Suita 4: Panoul Admin', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Accesam pagina de admin
  6  |     await page.goto('/admin.html');
  7  |     
  8  |     // Asteptam sa dispara spinnerul si sa apara formularul de login
  9  |     await page.waitForSelector('#login-form-content');
  10 |     
  11 |     // Autentificare completă cu Email, Parolă și PIN
  12 |     await page.fill('#admin-email', 'dorobantuflorin81@gmail.com');
  13 |     await page.fill('#admin-password', 'Bella-Roma');
  14 |     await page.fill('#admin-pin', '1234');
  15 |     await page.click('#btn-login');
  16 |     
  17 |     // Asteptam sa dispara overlay-ul de login
> 18 |     await expect(page.locator('#login-overlay')).not.toBeVisible({ timeout: 10000 });
     |                                                      ^ Error: expect(locator).not.toBeVisible() failed
  19 |   });
  20 | 
  21 |   test('Creare, Editare și Ștergere Produs (CRUD)', async ({ page }) => {
  22 |     // 1. Creare
  23 |     const uniqueName = `Pizza Test Playwright ${Date.now()}`;
  24 |     
  25 |     await page.fill('#nume', uniqueName);
  26 |     await page.fill('#descriere', 'Descriere automata generata de teste');
  27 |     await page.fill('#pret', '99');
  28 |     await page.fill('#categorie', 'Pizza');
  29 |     
  30 |     await page.click('button[type="submit"]');
  31 |     
  32 |     // Verificam ca a aparut in lista (refresh automat sau realtime)
  33 |     // Asteptam cateva secunde pentru insert in baza de date
  34 |     await expect(page.locator('.product-card').filter({ hasText: uniqueName })).toBeVisible({ timeout: 15000 });
  35 |     
  36 |     // 2. Ștergere (cautam butonul Sterge de pe randul produsului nou creat)
  37 |     const productCard = page.locator('.product-card').filter({ hasText: uniqueName });
  38 |     await productCard.locator('button', { hasText: 'Șterge' }).click();
  39 | 
  40 |     // Aplicația afișează un modal custom #delete-confirm-modal
  41 |     const confirmBtn = page.locator('#delete-confirm-modal button', { hasText: 'Șterge' });
  42 |     await expect(confirmBtn).toBeVisible({ timeout: 5000 });
  43 |     await confirmBtn.click();
  44 | 
  45 |     // 3. Verificare stergere
  46 |     await expect(productCard).not.toBeVisible({ timeout: 15000 });
  47 |   });
  48 | });
  49 | 
```