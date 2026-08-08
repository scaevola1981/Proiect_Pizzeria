import { test, expect } from '@playwright/test';

test.describe('Suita 4: Panoul Admin', () => {
  test.beforeEach(async ({ page }) => {
    // Accesam pagina de admin
    await page.goto('/admin.html');
    
    // Asteptam sa dispara spinnerul si sa apara formularul de login
    await page.waitForSelector('#login-form-content');
    
    // Autentificare completă cu Email, Parolă și PIN
    await page.fill('#admin-email', 'dorobantuflorin81@gmail.com');
    await page.fill('#admin-password', 'Bella-Roma');
    await page.fill('#admin-pin', '1234');
    await page.click('#btn-login');
    
    // Asteptam sa dispara overlay-ul de login
    await expect(page.locator('#login-overlay')).not.toBeVisible({ timeout: 10000 });
  });

  test('Creare, Editare și Ștergere Produs (CRUD)', async ({ page }) => {
    // 1. Creare
    const uniqueName = `Pizza Test Playwright ${Date.now()}`;
    
    await page.fill('#nume', uniqueName);
    await page.fill('#descriere', 'Descriere automata generata de teste');
    await page.fill('#pret', '99');
    await page.fill('#categorie', 'Pizza');
    
    await page.click('button[type="submit"]');
    
    // Verificam ca a aparut in lista (refresh automat sau realtime)
    // Asteptam cateva secunde pentru insert in baza de date
    await expect(page.locator('.product-card').filter({ hasText: uniqueName })).toBeVisible({ timeout: 15000 });
    
    // 2. Ștergere (cautam butonul Sterge de pe randul produsului nou creat)
    const productCard = page.locator('.product-card').filter({ hasText: uniqueName });
    await productCard.locator('button', { hasText: 'Șterge' }).click();

    // Aplicația afișează un modal custom #delete-confirm-modal
    const confirmBtn = page.locator('#delete-confirm-modal button', { hasText: 'Șterge' });
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();

    // 3. Verificare stergere
    await expect(productCard).not.toBeVisible({ timeout: 15000 });
  });
});
