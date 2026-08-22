/**
 * Bella Roma USB & GDI Printer Driver (Windows Spooler Integration)
 * Dual-Mode: Raw ESC/POS for Thermal POS-80 & Rich GDI for Laser/Standard printers.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { cleanDiacritics, formatDateTime } = require('./escpos-builder');

let cachedPrinterName = null;

/**
 * Obține lista tuturor imprimantelor instalate în Windows prin WMI / PowerShell
 */
async function getWindowsPrinters() {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') {
            return resolve(['POS-80 (Simulated Non-Windows)']);
        }

        const psCommand = `powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Printer | Select-Object -ExpandProperty Name"`;
        exec(psCommand, { timeout: 5000 }, (error, stdout) => {
            if (error || !stdout) {
                // Fallback la WMI vechi dacă CIM e indisponibil
                exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-WmiObject -Class Win32_Printer).Name"`, { timeout: 4000 }, (err2, out2) => {
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
 * Rezolvă automat numele imprimantei țintă
 */
async function resolveTargetPrinter(config = {}) {
    if (cachedPrinterName) return cachedPrinterName;

    if (process.platform !== 'win32') {
        cachedPrinterName = config.printer_name || 'POS-80';
        return cachedPrinterName;
    }

    const printers = await getWindowsPrinters();
    console.log("🖨️ Imprimante Windows detectate:", printers.length > 0 ? printers.join(', ') : '(Niciuna)');

    const configNames = (config.printer_name || 'POS-80').split(/[|,]/).map(s => s.trim()).filter(Boolean);

    // 1. Căutare exactă
    for (const name of configNames) {
        const exactMatch = printers.find(p => p.toLowerCase() === name.toLowerCase());
        if (exactMatch) {
            cachedPrinterName = exactMatch;
            return cachedPrinterName;
        }
    }

    // 2. Căutare parțială
    for (const name of configNames) {
        const partialMatch = printers.find(p => p.toLowerCase().includes(name.toLowerCase()));
        if (partialMatch) {
            cachedPrinterName = partialMatch;
            return cachedPrinterName;
        }
    }

    // 3. Căutare după Regex
    if (config.printer_name_regex) {
        try {
            const regex = new RegExp(config.printer_name_regex, 'i');
            const regexMatch = printers.find(p => regex.test(p));
            if (regexMatch) {
                cachedPrinterName = regexMatch;
                return cachedPrinterName;
            }
        } catch (e) {
            console.warn("⚠️ Regex invalid în config:", e.message);
        }
    }

    // 4. Căutare cuvinte cheie termice implicite
    const defaultThermal = printers.find(p => /(pos|ocpp|thermal|receipt|xp-80|xp-58|zj-80|m2020|samsung)/i.test(p));
    if (defaultThermal) {
        cachedPrinterName = defaultThermal;
        return cachedPrinterName;
    }

    cachedPrinterName = configNames[0] || 'POS-80';
    return cachedPrinterName;
}

/**
 * Verifică dacă imprimanta este termică ESC/POS
 */
function isThermalPrinter(printerName) {
    if (!printerName) return false;
    const thermalRegex = /(pos|ocpp|thermal|receipt|xp-80|xp-58|zj-58|zj-80|epson tm|citizen|star|rongta|xprinter|black copper)/i;
    return thermalRegex.test(printerName);
}

/**
 * Trimite comenzi RAW (ESC/POS) către imprimantă termică prin winspool.drv
 */
async function printRawBuffer(buffer, config = {}) {
    const targetPrinter = await resolveTargetPrinter(config);

    if (process.platform !== 'win32') {
        console.log(`[SIMULARE NON-WINDOWS] Bon trimis spre imprimanta: "${targetPrinter}" (${buffer.length} bytes)`);
        return { success: true, printer: targetPrinter, simulated: true };
    }

    return new Promise((resolve, reject) => {
        const tempPath = path.join(os.tmpdir(), `bella_print_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.bin`);
        const scriptPath = path.join(os.tmpdir(), `bella_raw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.ps1`);
        
        fs.writeFileSync(tempPath, buffer);

        const psScript = `
$ProgressPreference = 'SilentlyContinue';
$WarningPreference = 'SilentlyContinue';
$printerName = "${targetPrinter.replace(/"/g, '`"')}";
$filePath = "${tempPath.replace(/\\/g, '\\\\')}";

$code = @"
using System;
using System.IO;
using System.Runtime.InteropServices;

public class RawPrinterHelper {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public class DOCINFOA {
        [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
        [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
    }

    [DllImport("winspool.Drv", EntryPoint = "OpenPrinterA", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter, out IntPtr hPrinter, IntPtr pd);

    [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "StartDocPrinterA", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, Int32 level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);

    [DllImport("winspool.Drv", EntryPoint = "EndDocPrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "StartPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "EndPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "WritePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, Int32 dwCount, out Int32 dwWritten);

    public static bool SendFileToPrinter(string szPrinterName, string szFileName) {
        IntPtr hPrinter = IntPtr.Zero;
        DOCINFOA di = new DOCINFOA();
        di.pDocName = "Bella Roma Receipt";
        di.pDataType = "RAW";

        if (!OpenPrinter(szPrinterName, out hPrinter, IntPtr.Zero)) {
            return false;
        }

        if (!StartDocPrinter(hPrinter, 1, di)) {
            ClosePrinter(hPrinter);
            return false;
        }

        if (!StartPagePrinter(hPrinter)) {
            EndDocPrinter(hPrinter);
            ClosePrinter(hPrinter);
            return false;
        }

        byte[] bytes = File.ReadAllBytes(szFileName);
        IntPtr pUnmanagedBytes = Marshal.AllocCoTaskMem(bytes.Length);
        Marshal.Copy(bytes, 0, pUnmanagedBytes, bytes.Length);

        Int32 dwWritten = 0;
        bool bSuccess = WritePrinter(hPrinter, pUnmanagedBytes, bytes.Length, out dwWritten);
        Marshal.FreeCoTaskMem(pUnmanagedBytes);

        EndPagePrinter(hPrinter);
        EndDocPrinter(hPrinter);
        ClosePrinter(hPrinter);

        return bSuccess;
    }
}
"@

Add-Type -TypeDefinition $code -Language CSharp
$res = [RawPrinterHelper]::SendFileToPrinter($printerName, $filePath)

if ($res) {
    exit 0
} else {
    exit 1
}
`;

        fs.writeFileSync(scriptPath, psScript, 'utf8');
        const execCmd = `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`;

        exec(execCmd, { timeout: 12000 }, (error) => {
            try { fs.unlinkSync(tempPath); } catch (_) {}
            try { fs.unlinkSync(scriptPath); } catch (_) {}

            if (error) {
                console.error(`❌ Eroare la trimiterea bonului către "${targetPrinter}":`, error.message);
                return reject(new Error(`Eșec printare pe ${targetPrinter}: ${error.message}`));
            }

            console.log(`✅ Bon ESC/POS trimis cu succes către imprimanta termică "${targetPrinter}"!`);
            resolve({ success: true, printer: targetPrinter });
        });
    });
}

/**
 * Printează bonul text pe orice imprimantă standard/laser Windows (GDI PrintDocument)
 */
async function printTextDocument(text, config = {}) {
    const targetPrinter = await resolveTargetPrinter(config);

    if (process.platform !== 'win32') {
        console.log(`[SIMULARE NON-WINDOWS TEXT] Bon trimis spre: "${targetPrinter}"\n${text}`);
        return { success: true, printer: targetPrinter, simulated: true };
    }

    return new Promise((resolve, reject) => {
        const tempPath = path.join(os.tmpdir(), `bella_doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.txt`);
        const scriptPath = path.join(os.tmpdir(), `bella_txt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.ps1`);
        
        fs.writeFileSync(tempPath, text, 'utf8');

        const psScript = `
$ProgressPreference = 'SilentlyContinue';
$WarningPreference = 'SilentlyContinue';
$printerName = "${targetPrinter.replace(/"/g, '`"')}";
$filePath = "${tempPath.replace(/\\/g, '\\\\')}";

try {
    Add-Type -AssemblyName System.Drawing;
    $text = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8);
    $doc = New-Object System.Drawing.Printing.PrintDocument;
    $doc.PrinterSettings.PrinterName = $printerName;
    $doc.PrintController = New-Object System.Drawing.Printing.StandardPrintController;
    $font = New-Object System.Drawing.Font("Consolas", 11, [System.Drawing.FontStyle]::Bold);
    $doc.add_PrintPage({
        param($sender, $e)
        $e.Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias;
        $e.Graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit;
        $e.Graphics.DrawString($text, $font, [System.Drawing.Brushes]::Black, 25, 20);
    });
    $doc.Print();
    exit 0;
} catch {
    Get-Content -Path $filePath -Encoding UTF8 | Out-Printer -Name $printerName;
    exit 0;
}
`;

        fs.writeFileSync(scriptPath, psScript, 'utf8');
        const execCmd = `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`;

        exec(execCmd, { timeout: 15000 }, (error) => {
            try { fs.unlinkSync(tempPath); } catch (_) {}
            try { fs.unlinkSync(scriptPath); } catch (_) {}

            if (error) {
                console.error(`❌ Eroare la printarea text către "${targetPrinter}":`, error.message);
                return reject(new Error(`Eșec printare pe ${targetPrinter}: ${error.message}`));
            }

            console.log(`✅ Bon POS-80 printat cu succes pe imprimanta "${targetPrinter}"!`);
            resolve({ success: true, printer: targetPrinter });
        });
    });
}

module.exports = {
    getWindowsPrinters,
    resolveTargetPrinter,
    isThermalPrinter,
    printRawBuffer,
    printTextDocument
};
