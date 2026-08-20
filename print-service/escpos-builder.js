/**
 * ESC/POS Receipt Buffer Generator for Bella Roma POS (80mm / 48 columns)
 * Generates raw byte streams compatible with all ESC/POS thermal printers.
 */

// Elimină diacriticele pentru printare impecabilă pe orice imprimantă termică
function cleanDiacritics(str) {
    if (!str) return '';
    return str
        .replace(/ă|â/gi, 'a')
        .replace(/Ă|Â/g, 'A')
        .replace(/î|í/gi, 'i')
        .replace(/Î|Í/g, 'I')
        .replace(/ș|ş/gi, 's')
        .replace(/Ș|Ş/g, 'S')
        .replace(/ț|ţ/gi, 't')
        .replace(/Ț|Ţ/g, 'T')
        .replace(/é|è|ê/gi, 'e')
        .replace(/É|È|Ê/g, 'E')
        .replace(/ó|ò/gi, 'o')
        .replace(/Ó|Ò/g, 'O')
        .replace(/ú|ù/gi, 'u')
        .replace(/Ú|Ù/g, 'U');
}

/**
 * Formatează o linie de 48 de caractere cu text în stânga și text în dreapta
 */
function formatTwoColumns(leftText, rightText, totalWidth = 48) {
    const cleanLeft = cleanDiacritics(String(leftText || ''));
    const cleanRight = cleanDiacritics(String(rightText || ''));
    const availableLeft = totalWidth - cleanRight.length - 1;

    let left = cleanLeft;
    if (left.length > availableLeft) {
        left = left.substring(0, availableLeft);
    }

    const spacesCount = totalWidth - left.length - cleanRight.length;
    const spaces = ' '.repeat(Math.max(1, spacesCount));
    return left + spaces + cleanRight;
}

/**
 * Centrează un text într-o linie de 48 de caractere
 */
function formatCenter(text, totalWidth = 48) {
    const clean = cleanDiacritics(String(text || ''));
    if (clean.length >= totalWidth) return clean.substring(0, totalWidth);
    const leftPad = Math.floor((totalWidth - clean.length) / 2);
    const rightPad = totalWidth - clean.length - leftPad;
    return ' '.repeat(leftPad) + clean + ' '.repeat(rightPad);
}

/**
 * Construiește buffer-ul binar ESC/POS pentru o comandă completă sau suplimentară
 */
function buildEscPosBuffer(order, options = {}) {
    const autoCut = options.auto_cut !== false;
    const beepOnOrder = options.beep_on_order !== false;
    const beepCount = options.beep_count || 2;
    const lineChars = 48;

    const detalii = Array.isArray(order.detalii_comanda) ? order.detalii_comanda : [];
    const masaStr = String(order.numar_masa || '?');
    const totalVal = parseFloat(order.total || 0);

    const dateObj = order.created_at ? new Date(order.created_at) : new Date();
    const dateStr = dateObj.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

    // Verificăm dacă există produse suplimentare
    const hasNewItems = detalii.some(item => item.is_new === true);
    const isSupplement = Boolean(order.is_supplement || hasNewItems);
    const itemsToPrint = hasNewItems ? detalii.filter(item => item.is_new === true) : detalii;

    // Grupare pe persoane
    const grouped = {};
    itemsToPrint.forEach(item => {
        const rawPerson = item.customer_name && item.customer_name.trim() !== '' ? item.customer_name.trim() : 'Masa';
        const person = cleanDiacritics(rawPerson);
        if (!grouped[person]) grouped[person] = [];
        grouped[person].push(item);
    });

    const commands = [];

    // 1. Inițializare imprimantă (ESC @)
    commands.push(Buffer.from([0x1B, 0x40]));

    // 2. Setare Code Page (CP852 / Standard)
    commands.push(Buffer.from([0x1B, 0x74, 0x12])); // CP852 Latin 2

    // 3. Header Restaurant (Centrat + Bold + Mărit)
    commands.push(Buffer.from([0x1B, 0x61, 0x01])); // Aliniere Centru
    commands.push(Buffer.from([0x1D, 0x21, 0x11])); // Dublă înălțime și lățime
    commands.push(Buffer.from([0x1B, 0x45, 0x01])); // Bold ON
    commands.push(Buffer.from("BELLA ROMA\n", 'ascii'));
    
    commands.push(Buffer.from([0x1D, 0x21, 0x00])); // Font Normal
    commands.push(Buffer.from("PUB & PIZZERIE\n", 'ascii'));
    commands.push(Buffer.from([0x1B, 0x45, 0x00])); // Bold OFF

    if (isSupplement) {
        commands.push(Buffer.from([0x1B, 0x45, 0x01])); // Bold ON
        commands.push(Buffer.from("*** BON SUPLIMENTAR ***\n", 'ascii'));
        commands.push(Buffer.from([0x1B, 0x45, 0x00])); // Bold OFF
    }

    commands.push(Buffer.from('='.repeat(lineChars) + '\n', 'ascii'));

    // 4. Detalii Masă & Oră (Aliniat la stânga)
    commands.push(Buffer.from([0x1B, 0x61, 0x00])); // Aliniere Stânga
    
    const tableLine = formatTwoColumns(`Masa: ${masaStr}`, `#${order.id || ''}`, lineChars);
    commands.push(Buffer.from(tableLine + '\n', 'ascii'));

    const dateLine = formatTwoColumns(`Data: ${dateStr}`, `Ora: ${timeStr}`, lineChars);
    commands.push(Buffer.from(dateLine + '\n', 'ascii'));

    const waiter = order.ospatar_nume || (detalii.find(i => i.ospatar_nume)?.ospatar_nume);
    if (waiter) {
        commands.push(Buffer.from(`Ospatar: ${cleanDiacritics(waiter)}\n`, 'ascii'));
    }

    commands.push(Buffer.from('-'.repeat(lineChars) + '\n', 'ascii'));

    // 5. Produse Grupate pe Persoane
    for (const [person, items] of Object.entries(grouped)) {
        const headerLabel = (person === 'Masa' || person.toLowerCase() === 'masa') ?
            '--- [ IMPREUNA ] ---' :
            `--- [ ${person.toUpperCase()} ] ---`;

        // Titlu Persoană (Centrat + Bold)
        commands.push(Buffer.from([0x1B, 0x61, 0x01])); // Centru
        commands.push(Buffer.from([0x1B, 0x45, 0x01])); // Bold ON
        commands.push(Buffer.from(headerLabel + '\n', 'ascii'));
        commands.push(Buffer.from([0x1B, 0x45, 0x00])); // Bold OFF
        commands.push(Buffer.from([0x1B, 0x61, 0x00])); // Stânga

        let personTotal = 0;

        items.forEach(item => {
            const qty = parseInt(item.quantity || 1);
            const price = parseFloat(item.product?.pret || 0);
            const lineTotal = qty * price;
            personTotal += lineTotal;
            const pName = item.product?.nume || 'Produs';

            // Linie Produs (Bold ON)
            commands.push(Buffer.from([0x1B, 0x45, 0x01])); // Bold ON
            const itemLine = formatTwoColumns(`${qty}x ${pName}`, lineTotal.toFixed(2), lineChars);
            commands.push(Buffer.from(itemLine + '\n', 'ascii'));
            commands.push(Buffer.from([0x1B, 0x45, 0x00])); // Bold OFF

            // Observații / Notițe
            if (item.notes && item.notes.trim() !== '') {
                const noteClean = cleanDiacritics(item.notes.trim());
                commands.push(Buffer.from(`   * ${noteClean}\n`, 'ascii'));
            }
        });

        // Subtotal Persoană
        const subtotalLine = formatTwoColumns('', `Subtotal: ${personTotal.toFixed(2)} Lei`, lineChars);
        commands.push(Buffer.from(subtotalLine + '\n\n', 'ascii'));
    }

    commands.push(Buffer.from('='.repeat(lineChars) + '\n', 'ascii'));

    // 6. TOTAL MASĂ (Centrat + Dublu Mărit + Bold)
    commands.push(Buffer.from([0x1B, 0x61, 0x01])); // Centru
    commands.push(Buffer.from([0x1D, 0x21, 0x11])); // Font Dublu
    commands.push(Buffer.from([0x1B, 0x45, 0x01])); // Bold ON
    commands.push(Buffer.from(`TOTAL: ${totalVal.toFixed(2)} Lei\n`, 'ascii'));
    commands.push(Buffer.from([0x1D, 0x21, 0x00])); // Font Normal
    commands.push(Buffer.from([0x1B, 0x45, 0x00])); // Bold OFF
    commands.push(Buffer.from('='.repeat(lineChars) + '\n', 'ascii'));

    // 7. Footer
    commands.push(Buffer.from("Va multumim!\n", 'ascii'));
    commands.push(Buffer.from("www.bella-roma.ro\n\n\n\n", 'ascii'));

    // 8. Tăiere Hârtie (Partial Cut / Full Cut: GS V 0 sau GS V 65 3)
    if (autoCut) {
        commands.push(Buffer.from([0x1D, 0x56, 0x00])); // GS V 0
    }

    // 9. Sonerie / Buzzer (ESC B count duration)
    if (beepOnOrder) {
        commands.push(Buffer.from([0x1B, 0x42, Math.min(9, Math.max(1, beepCount)), 0x02]));
    }

    return Buffer.concat(commands);
}

module.exports = {
    buildEscPosBuffer,
    cleanDiacritics,
    formatTwoColumns,
    formatCenter
};
