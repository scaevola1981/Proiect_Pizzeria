/**
 * Script de testare rapidă a printării USB pentru Bella Roma
 * Rulează: node test-print.js
 */

const { buildEscPosBuffer, buildPlainTextReceipt } = require('./escpos-builder');
const { printRawBuffer, printTextDocument, isThermalPrinter, resolveTargetPrinter, getWindowsPrinters } = require('./printer-driver-usb');
const config = require('./config.json');

async function runTest() {
    console.log("==========================================");
    console.log("🧪 TEST PRINTARE USB - BELLA ROMA POS");
    console.log("==========================================");

    const printers = await getWindowsPrinters();
    console.log("Imprimante disponibile:", printers);

    const targetPrinter = await resolveTargetPrinter(config);
    const isThermal = isThermalPrinter(targetPrinter);
    console.log(`\nImprimantă selectată: "${targetPrinter}" (Tip: ${isThermal ? 'Termică ESC/POS' : 'Laser/GDI/Standard'})\n`);

    const sampleOrder = {
        id: 101,
        numar_masa: "4",
        created_at: new Date().toISOString(),
        ospatar_nume: "Maria (Test)",
        total: 118.00,
        detalii_comanda: [
            {
                product: { nume: "Pizza Diavola", pret: 35.00 },
                quantity: 2,
                notes: "Fara ceapa, bine facuta",
                customer_name: "Masa"
            },
            {
                product: { nume: "Coca-Cola 0.33L", pret: 10.00 },
                quantity: 1,
                customer_name: "Masa"
            },
            {
                product: { nume: "Paste Carbonara", pret: 38.00 },
                quantity: 1,
                customer_name: "Persoana 1"
            }
        ]
    };

    try {
        if (isThermal) {
            console.log("Generare buffer ESC/POS...");
            const buffer = buildEscPosBuffer(sampleOrder, config);
            console.log(`Buffer generat: ${buffer.length} bytes.`);
            console.log(`Trimitere binară către imprimanta termică "${targetPrinter}"...`);
            await printRawBuffer(buffer, config);
        } else {
            console.log("Generare bon text formatat pentru imprimantă standard/laser...");
            const text = buildPlainTextReceipt(sampleOrder, config);
            console.log(`Trimitere text document către imprimanta "${targetPrinter}"...`);
            await printTextDocument(text, config);
        }
        console.log("\n🎉 REZULTAT: TEST REUȘIT!");
        console.log("Bonul ar trebui să fie tipărit acum pe imprimantă.");
    } catch (e) {
        console.error("\n❌ EȘEC TEST PRINTARE:", e.message);
    }
}

runTest();
