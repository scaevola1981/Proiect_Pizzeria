import { test, expect } from '@playwright/test';

test.describe('Suita 1: Meniu Client & Geofencing', () => {
  // Configurare permisiuni de geolocatie si simulare coordonate valide (aproape de restaurant)
  test.use({
    geolocation: { latitude: 44.4268, longitude: 26.1025 }, // Exemplu coordonate valide (Bucuresti centru)
    permissions: ['geolocation'],
  });

  test('Detectare automată a mesei din URL', async ({ page }) => {
    // Accesam meniul cu parametrul masa=5
    await page.goto('/meniu.html?masa=5');
    
    // Asteptam sa apara textul "Masa 5" sau doar "5" in elementul #masa-id
    const masaId = page.locator('#masa-id');
    await expect(masaId).toContainText('5');
  });

  test('Selecția de persoane schimbă eticheta butoanelor', async ({ page }) => {
    await page.goto('/meniu.html?masa=5');
    
    // Implicit ar trebui să fie "Împreună"
    const buttonImpreuna = page.locator('.person-chip').filter({ hasText: 'Împreună' });
    await expect(buttonImpreuna).toHaveCSS('font-weight', '700');

    // Asteptam sa se incarce produsele
    await page.waitForSelector('.btn-alegere');
    
    // Verificam ca eticheta butonului de adaugare este pentru "Împreună"
    const btnAlegere = page.locator('.btn-alegere').first();
    await expect(btnAlegere).toContainText('Împreună');

    // Apasam pe "Persoana 1"
    const buttonPersoana1 = page.locator('.person-chip').filter({ hasText: 'Persoana 1' });
    await buttonPersoana1.click();
    
    // Verificam ca textul butonului de adăugare s-a schimbat
    await expect(btnAlegere).toContainText('Persoana 1');
    
    // Verificam ca eticheta s-a schimbat
    await expect(buttonPersoana1).toHaveCSS('font-weight', '700');
  });

  test('Adăugare în coș și grupare pe persoane', async ({ page }) => {
    await page.goto('/meniu.html?masa=5');
    await page.waitForSelector('.btn-alegere');

    // Alegem Persoana 1 si adaugam primul produs
    await page.locator('.person-chip').filter({ hasText: 'Persoana 1' }).click();
    await page.locator('.btn-alegere').first().click();

    // Verificam cosul
    const cartItems = page.locator('#cart-items');
    await expect(cartItems).toContainText('Persoana 1');
  });
});
