/**
 * USB RAW Print Driver for Windows Spooler
 * Sends raw ESC/POS binary buffers directly to the USB thermal printer.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec, execSync } = require('child_process');

let cachedPrinterName = null;

/**
 * Obține lista tuturor imprimantelor instalate în Windows
 */
async function getWindowsPrinters() {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') {
            return resolve(['POS-80 (Simulated Non-Windows)']);
        }

        const psCommand = `powershell -NoProfile -Command "Get-CimInstance Win32_Printer | Select-Object -ExpandProperty Name"`;
        exec(psCommand, { timeout: 4000 }, (error, stdout) => {
            if (error || !stdout) {
                // Fallback la WMI vechi dacă CIM e indisponibil
                exec(`powershell -NoProfile -Command "(Get-WmiObject -Class Win32_Printer).Name"`, { timeout: 3000 }, (err2, out2) => {
                    if (err2 || !out2) return resolve([]);
                    const printers = out2.split(/\r?\n/).map(p => p.trim()).filter(p => p.length > 0);
                    resolve(printers);
                });
                return;
            }
            const printers = stdout
                .split(/\r?\n/)
                .map(p => p.trim())
                .filter(p => p.length > 0);
            resolve(printers);
        });
    });
}

/**
 * Găsește imprimanta POS țintă (după nume exact sau căutare automată)
 */
async function resolveTargetPrinter(config = {}) {
    if (cachedPrinterName) return cachedPrinterName;

    if (process.platform !== 'win32') {
        cachedPrinterName = config.printer_name || 'POS-80';
        return cachedPrinterName;
    }

    const printers = await getWindowsPrinters();
    console.log("🖨️ Imprimante Windows detectate:", printers);

    // 1. Căutare după numele specificat în config
    if (config.printer_name) {
        const exactMatch = printers.find(p => p.toLowerCase() === config.printer_name.toLowerCase());
        if (exactMatch) {
            cachedPrinterName = exactMatch;
            return cachedPrinterName;
        }
    }

    // 2. Căutare automată după regex (POS-80, OCPP, Thermal, etc.)
    const regex = new RegExp(config.printer_name_regex || '(POS-80|OCPP|Thermal|Receipt|XP-80|POS80)', 'i');
    const autoMatch = printers.find(p => regex.test(p));
    if (autoMatch) {
        cachedPrinterName = autoMatch;
        return cachedPrinterName;
    }

    // 3. Fallback la prima imprimantă sau numele configurat
    cachedPrinterName = printers[0] || config.printer_name || 'POS-80';
    return cachedPrinterName;
}

/**
 * Trimite un buffer binar RAW direct către spooler-ul Windows al imprimantei
 */
async function printRawBuffer(buffer, config = {}) {
    const targetPrinter = await resolveTargetPrinter(config);

    if (process.platform !== 'win32') {
        console.log(`[SIMULARE NON-WINDOWS] Bon trimis spre imprimanta: "${targetPrinter}" (${buffer.length} bytes)`);
        return { success: true, printer: targetPrinter, simulated: true };
    }

    return new Promise((resolve, reject) => {
        // Scriem bufferul într-un fișier binar temporar
        const tempPath = path.join(os.tmpdir(), `bella_pos_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.bin`);
        fs.writeFileSync(tempPath, buffer);

        // Script PowerShell care folosește API-ul nativ Windows winspool.drv pentru scriere RAW
        const psScript = `
$printerName = "${targetPrinter.replace(/"/g, '`"')}";
$filePath = "${tempPath.replace(/\\/g, '\\\\')}";

$code = @"
using System;
using System.IO;
using System.Runtime.InteropServices;

public class RawPrinter {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public class DOCINFOA {
        [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
        [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
    }

    [DllImport("winspool.drv", EntryPoint = "OpenPrinterA", ExactSpelling = true, SetLastError = true)]
    public static extern bool OpenPrinter(string pPrinterName, out IntPtr phPrinter, IntPtr pDefault);

    [DllImport("winspool.drv", EntryPoint = "ClosePrinter", ExactSpelling = true, SetLastError = true)]
    public static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "StartDocPrinterA", ExactSpelling = true, SetLastError = true)]
    public static extern int StartDocPrinter(IntPtr hPrinter, int Level, [In] DOCINFOA pDocInfo);

    [DllImport("winspool.drv", EntryPoint = "EndDocPrinter", ExactSpelling = true, SetLastError = true)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "StartPagePrinter", ExactSpelling = true, SetLastError = true)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "EndPagePrinter", ExactSpelling = true, SetLastError = true)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "WritePrinter", ExactSpelling = true, SetLastError = true)]
    public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);

    public static bool SendBytes(string printerName, byte[] bytes) {
        IntPtr hPrinter;
        if (!OpenPrinter(printerName, out hPrinter, IntPtr.Zero)) return false;
        
        DOCINFOA di = new DOCINFOA();
        di.pDocName = "BellaRoma Receipt";
        di.pDataType = "RAW";

        int docId = StartDocPrinter(hPrinter, 1, di);
        if (docId == 0) { ClosePrinter(hPrinter); return false; }

        if (!StartPagePrinter(hPrinter)) { EndDocPrinter(hPrinter); ClosePrinter(hPrinter); return false; }

        IntPtr pUnmanagedBytes = Marshal.AllocCoTaskMem(bytes.Length);
        Marshal.Copy(bytes, 0, pUnmanagedBytes, bytes.Length);

        int written = 0;
        bool success = WritePrinter(hPrinter, pUnmanagedBytes, bytes.Length, out written);

        Marshal.FreeCoTaskMem(pUnmanagedBytes);
        EndPagePrinter(hPrinter);
        EndDocPrinter(hPrinter);
        ClosePrinter(hPrinter);

        return success && written == bytes.Length;
    }
}
"@;

Add-Type -TypeDefinition $code -ErrorAction Stop;
$bytes = [System.IO.File]::ReadAllBytes($filePath);
$res = [RawPrinter]::SendBytes($printerName, $bytes);
if ($res) { exit 0 } else { exit 1 }
`;

        const encodedCommand = Buffer.from(psScript, 'utf16le').toString('base64');
        const execCmd = `powershell -NoProfile -EncodedCommand ${encodedCommand}`;

        exec(execCmd, { timeout: 6000 }, (error) => {
            // Ștergem fișierul temporar
            try { fs.unlinkSync(tempPath); } catch (_) {}

            if (error) {
                console.error(`❌ Eroare la trimiterea bonului către "${targetPrinter}":`, error.message);
                return reject(new Error(`Eșec printare pe ${targetPrinter}: ${error.message}`));
            }

            console.log(`✅ Bon printat cu succes pe imprimanta USB "${targetPrinter}"!`);
            resolve({ success: true, printer: targetPrinter });
        });
    });
}

module.exports = {
    getWindowsPrinters,
    resolveTargetPrinter,
    printRawBuffer
};
