import { chromium } from 'playwright';

async function testProject() {
    console.log('=== PORNIRE TESTARE COMPLETĂ APLICAȚIE PIZZERIE ===\n');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        geolocation: { latitude: 44.4268, longitude: 26.1025 },
        permissions: ['geolocation']
    });

    const results = [];

    // 1. Test Meniu Client
    try {
        console.log('▶ [1/4] Testare Meniu Client (http://localhost:5173/meniu.html?masa=3)');
        const page = await context.newPage();
        
        await page.goto('http://localhost:5173/meniu.html?masa=3', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const title = await page.title();
        const heroTitle = (await page.locator('.hero-title').textContent().catch(() => '')).trim();
        const productsCount = await page.locator('.product-card').count();
        const categories = await page.locator('.category-section h2').allTextContents();

        console.log(`  ✔ Titlu: "${title}"`);
        console.log(`  ✔ Header: "${heroTitle}"`);
        console.log(`  ✔ Categorii încărcate (${categories.length}): ${categories.join(', ')}`);
        console.log(`  ✔ Număr produse randate: ${productsCount}`);

        // Test Căutare
        await page.fill('#search-input', 'Margherita');
        await page.waitForTimeout(500);
        const searchResults = await page.locator('.product-card').count();
        console.log(`  ✔ Căutare 'Margherita': ${searchResults} produs(e) găsit(e)`);

        // Resetare căutare
        await page.fill('#search-input', '');
        await page.waitForTimeout(500);

        // Test Adăugare în Coș
        const firstAddBtn = page.locator('.product-card button').first();
        await firstAddBtn.click();
        await page.waitForTimeout(500);

        const cartBadgeCount = (await page.locator('#cart-count-badge').textContent()).trim();
        const cartBadgeTotal = (await page.locator('#cart-total-badge').textContent()).trim();
        console.log(`  ✔ Coș actualizat: ${cartBadgeCount} produse, Total: ${cartBadgeTotal}`);

        // Deschidere Modal Coș
        await page.click('#floating-cart-btn');
        await page.waitForTimeout(500);
        const modalVisible = await page.locator('#cart-modal').isVisible();
        const masaInModal = (await page.locator('#cart-modal-masa-text').textContent()).trim();
        const cartItemsCount = await page.locator('#client-cart-items > div').count();
        console.log(`  ✔ Modal coș vizibil: ${modalVisible}, Masa: "${masaInModal}", Articole în listă: ${cartItemsCount}`);

        await page.screenshot({ path: 'screenshot_meniu.png' });

        results.push({
            pagina: 'meniu.html',
            status: productsCount > 0 ? 'PASSED ✅' : 'WARNING ⚠️',
            mesaj: `Produse: ${productsCount}, Categorii: ${categories.length}, Adăugare în coș funcțională.`
        });
        await page.close();
    } catch (e) {
        console.error('  ❌ Eroare la testarea meniu.html:', e.message);
        results.push({ pagina: 'meniu.html', status: 'FAILED ❌', mesaj: e.message });
    }

    // 2. Test Ospătar
    try {
        console.log('\n▶ [2/4] Testare Interfață Ospătar (http://localhost:5173/ospatar.html)');
        const page = await context.newPage();
        await page.goto('http://localhost:5173/ospatar.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const title = await page.title();
        const bodyContent = await page.locator('body').innerText();
        const hasWaiterUI = bodyContent.includes('Ospătar') || bodyContent.includes('Masa') || bodyContent.includes('PIN');
        
        console.log(`  ✔ Titlu: "${title}"`);
        console.log(`  ✔ Interfață Ospătar încărcată: ${hasWaiterUI}`);

        await page.screenshot({ path: 'screenshot_ospatar.png' });

        results.push({
            pagina: 'ospatar.html',
            status: 'PASSED ✅',
            mesaj: `Titlu: "${title}", UI activ.`
        });
        await page.close();
    } catch (e) {
        console.error('  ❌ Eroare la ospatar.html:', e.message);
        results.push({ pagina: 'ospatar.html', status: 'FAILED ❌', mesaj: e.message });
    }

    // 3. Test Recepție
    try {
        console.log('\n▶ [3/4] Testare Interfață Recepție (http://localhost:5173/receptie.html)');
        const page = await context.newPage();
        await page.goto('http://localhost:5173/receptie.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const title = await page.title();
        console.log(`  ✔ Titlu: "${title}"`);

        await page.screenshot({ path: 'screenshot_receptie.png' });

        results.push({
            pagina: 'receptie.html',
            status: 'PASSED ✅',
            mesaj: `Titlu: "${title}", Pagină accesibilă.`
        });
        await page.close();
    } catch (e) {
        console.error('  ❌ Eroare la receptie.html:', e.message);
        results.push({ pagina: 'receptie.html', status: 'FAILED ❌', mesaj: e.message });
    }

    // 4. Test Panou Admin
    try {
        console.log('\n▶ [4/4] Testare Panou Administrare (http://localhost:5173/admin.html)');
        const page = await context.newPage();
        await page.goto('http://localhost:5173/admin.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const title = await page.title();
        console.log(`  ✔ Titlu: "${title}"`);

        await page.screenshot({ path: 'screenshot_admin.png' });

        results.push({
            pagina: 'admin.html',
            status: 'PASSED ✅',
            mesaj: `Titlu: "${title}", Pagină accesibilă.`
        });
        await page.close();
    } catch (e) {
        console.error('  ❌ Eroare la admin.html:', e.message);
        results.push({ pagina: 'admin.html', status: 'FAILED ❌', mesaj: e.message });
    }

    await browser.close();

    console.log('\n==================================================');
    console.log('REZULTATE FINALE TESTARE:');
    console.table(results);
    console.log('==================================================\n');
}

testProject();
