# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reception.spec.js >> Suita 2: Recepție & Timp Real >> Comenzile clienților apar în timp real la Recepție
- Location: tests/reception.spec.js:5:7

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
- heading " Panou Recepție" [level=2]
- paragraph: Autentificați-vă pentru a accesa comenzile.
- textbox "Email": dorobantuflorin81@gmail.com
- textbox "Parola": Bella-Roma
- button " Autentificare"
- paragraph: Email sau parolă incorectă. Mai aveți 4 încercări.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Suita 2: Recepție & Timp Real', () => {
  4  |   // Vom folosi un context de browser pentru Recepție și altul pentru Client
  5  |   test('Comenzile clienților apar în timp real la Recepție', async ({ browser }) => {
  6  |     // 1. Setup Context Recepție
  7  |     const receptionContext = await browser.newContext();
  8  |     const receptionPage = await receptionContext.newPage();
  9  |     
  10 |     // Navigam la receptie
  11 |     await receptionPage.goto('/receptie.html');
  12 |     
  13 |     // Autentificare Receptie
  14 |     await receptionPage.fill('#owner-email', 'dorobantuflorin81@gmail.com');
  15 |     await receptionPage.fill('#owner-password', 'Bella-Roma');
  16 |     await receptionPage.click('#btn-owner-login');
  17 |     
  18 |     // Asteptam sa dispara overlay-ul de login
> 19 |     await expect(receptionPage.locator('#login-overlay')).not.toBeVisible({ timeout: 10000 });
     |                                                               ^ Error: expect(locator).not.toBeVisible() failed
  20 |     
  21 |     // Extragem numarul initial de comenzi (sau notam ca așteptăm una nouă)
  22 |     // Vom cauta o comanda de la "Masa 999" (pentru a fi usor de identificat)
  23 | 
  24 |     // 2. Setup Context Client
  25 |     const clientContext = await browser.newContext({
  26 |       geolocation: { latitude: 44.4268, longitude: 26.1025 },
  27 |       permissions: ['geolocation']
  28 |     });
  29 |     const clientPage = await clientContext.newPage();
  30 |     
  31 |     // Clientul accesează meniul la Masa 999
  32 |     await clientPage.goto('/meniu.html?masa=999');
  33 |     
  34 |     // Asteapta incarcarea produselor
  35 |     await clientPage.waitForSelector('.btn-alegere');
  36 |     
  37 |     // Clientul alege "Persoana 1" si adauga un produs
  38 |     await clientPage.locator('.person-chip').filter({ hasText: 'Persoana 1' }).click();
  39 |     await clientPage.locator('.btn-alegere').first().click();
  40 |     
  41 |     // Clientul trimite comanda
  42 |     const trimiteBtn = clientPage.locator('#btn-trimite-comanda');
  43 |     // Așteptăm puțin pentru a ne asigura că pagina de Recepție s-a conectat la WebSocket-ul Supabase (realtime)
  44 |     await clientPage.waitForTimeout(3000);
  45 |     
  46 |     await expect(trimiteBtn).toBeEnabled({ timeout: 15000 });
  47 |     await trimiteBtn.click();
  48 |     
  49 |     // Asteptam confirmarea pe client
  50 |     // Modificat pt. a astepta mesajul de succes / resetarea cosului
  51 |     await expect(clientPage.locator('#cart-items')).toContainText('Nu ați adăugat niciun produs în coș.', { timeout: 15000 });
  52 | 
  53 |     // 3. Verificare pe pagina Recepției
  54 |     // Ne asteptam ca la receptie sa apara instant o comanda pentru Masa 999 (fara refresh)
  55 |     const newOrder = receptionPage.locator('.modern-card').filter({ hasText: 'Masa 999' }).first();
  56 |     await expect(newOrder).toBeVisible({ timeout: 15000 });
  57 |     
  58 |     // Verificam ca defalcarea contine "Persoana 1"
  59 |     await expect(newOrder).toContainText('Persoana 1');
  60 | 
  61 |     // 4. Finalizare comandă din Recepție
  62 |     const btnFinalizeaza = newOrder.locator('button').filter({ hasText: 'Finalizează' });
  63 |     if (await btnFinalizeaza.isVisible()) {
  64 |         await btnFinalizeaza.click();
  65 |         
  66 |         // Comanda ar trebui să dispară din lista activă
  67 |         await expect(newOrder).not.toBeVisible({ timeout: 10000 });
  68 |     }
  69 |   });
  70 | });
  71 | 
```