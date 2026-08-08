import { test, expect } from '@playwright/test';

test.describe('Suita 2: Recepție & Timp Real', () => {
  // Vom folosi un context de browser pentru Recepție și altul pentru Client
  test('Comenzile clienților apar în timp real la Recepție', async ({ browser }) => {
    // 1. Setup Context Recepție
    const receptionContext = await browser.newContext();
    const receptionPage = await receptionContext.newPage();
    
    // Navigam la receptie
    await receptionPage.goto('/receptie.html');
    
    // Autentificare Receptie
    await receptionPage.fill('#owner-email', 'dorobantuflorin81@gmail.com');
    await receptionPage.fill('#owner-password', 'Bella-Roma');
    await receptionPage.click('#btn-owner-login');
    
    // Asteptam sa dispara overlay-ul de login
    await expect(receptionPage.locator('#login-overlay')).not.toBeVisible({ timeout: 10000 });
    
    // Extragem numarul initial de comenzi (sau notam ca așteptăm una nouă)
    // Vom cauta o comanda de la "Masa 999" (pentru a fi usor de identificat)

    // 2. Setup Context Client
    const clientContext = await browser.newContext({
      geolocation: { latitude: 44.4268, longitude: 26.1025 },
      permissions: ['geolocation']
    });
    const clientPage = await clientContext.newPage();
    
    // Clientul accesează meniul la Masa 999
    await clientPage.goto('/meniu.html?masa=999');
    
    // Asteapta incarcarea produselor
    await clientPage.waitForSelector('.btn-alegere');
    
    // Clientul alege "Persoana 1" si adauga un produs
    await clientPage.locator('.person-chip').filter({ hasText: 'Persoana 1' }).click();
    await clientPage.locator('.btn-alegere').first().click();
    
    // Clientul trimite comanda
    const trimiteBtn = clientPage.locator('#btn-trimite-comanda');
    // Așteptăm puțin pentru a ne asigura că pagina de Recepție s-a conectat la WebSocket-ul Supabase (realtime)
    await clientPage.waitForTimeout(3000);
    
    await expect(trimiteBtn).toBeEnabled({ timeout: 15000 });
    await trimiteBtn.click();
    
    // Asteptam confirmarea pe client
    // Modificat pt. a astepta mesajul de succes / resetarea cosului
    await expect(clientPage.locator('#cart-items')).toContainText('Nu ați adăugat niciun produs în coș.', { timeout: 15000 });

    // 3. Verificare pe pagina Recepției
    // Ne asteptam ca la receptie sa apara instant o comanda pentru Masa 999 (fara refresh)
    const newOrder = receptionPage.locator('.modern-card').filter({ hasText: 'Masa 999' }).first();
    await expect(newOrder).toBeVisible({ timeout: 15000 });
    
    // Verificam ca defalcarea contine "Persoana 1"
    await expect(newOrder).toContainText('Persoana 1');

    // 4. Finalizare comandă din Recepție
    const btnFinalizeaza = newOrder.locator('button').filter({ hasText: 'Finalizează' });
    if (await btnFinalizeaza.isVisible()) {
        await btnFinalizeaza.click();
        
        // Comanda ar trebui să dispară din lista activă
        await expect(newOrder).not.toBeVisible({ timeout: 10000 });
    }
  });
});
