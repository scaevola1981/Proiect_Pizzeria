import { test, expect } from '@playwright/test';

test.describe('Suita 3: Aplicația Ospătar', () => {
  test.beforeEach(async ({ page }) => {
    // Navigam la ospatar
    await page.goto('/ospatar.html');
  });

  test('Harta Meselor și Starea Liberă/Ocupată', async ({ page }) => {
    // Verificam prezenta meselor (sunt butoane in grid-ul de mese)
    const tableChips = page.locator('#table-chips-grid button');
    await expect(tableChips.first()).toBeVisible({ timeout: 15000 });
    
    // Selectam "Masa 1" 
    const masa1 = tableChips.filter({ hasText: 'Masa 1' }).first();
    await masa1.click();

    // Verificam ca eticheta mesei s-a schimbat in panou
    const activeTableBadge = page.locator('#ospatar-active-table-badge');
    await expect(activeTableBadge).toContainText('Masa 1');
  });

  test('Preluare manuală comandă la masă și eliberarea mesei', async ({ page }) => {
    // Asteptam sa apara mesele
    const tableChips = page.locator('#table-chips-grid button');
    await expect(tableChips.first()).toBeVisible({ timeout: 15000 });

    // Alegem Masa 10 (sau o masa random de test) pt a o ocupa
    const masaTest = tableChips.filter({ hasText: 'Masa 10' }).first();
    await masaTest.click();

    // Selectam "Persoana 1"
    const persoana1 = page.locator('.person-chip').filter({ hasText: 'Persoana 1' });
    await persoana1.click();

    // Adaugam un produs
    const addButtons = page.locator('button', { hasText: 'Adaugă' });
    await expect(addButtons.first()).toBeVisible({ timeout: 15000 });
    await addButtons.first().click();

    // Trimitem comanda pentru a "ocupa" masa
    const btnTrimite = page.locator('#btn-trimite-comanda-ospatar');
    await btnTrimite.click();

    // Dupa trimitere, Masa 10 ar trebui sa apara "Ocupata" pe buton (stilizare red) 
    // sau pur si simplu sa apara butonul de eliberare
    // Acceptam popup-ul de confirmare automat
    page.on('dialog', dialog => dialog.accept());
    
    const btnElibereaza = page.locator('#ospatar-free-table-btn-container button').filter({ hasText: 'Eliberează' });
    
    // Uneori e nevoie de cateva secunde pentru ca realtime-ul sa proceseze comanda
    await expect(btnElibereaza).toBeVisible({ timeout: 15000 });

    // Eliberam masa
    await btnElibereaza.click();

    // Butonul de eliberare ar trebui sa dispara cand masa revine la libera
    await expect(btnElibereaza).not.toBeVisible({ timeout: 10000 });
  });
});
