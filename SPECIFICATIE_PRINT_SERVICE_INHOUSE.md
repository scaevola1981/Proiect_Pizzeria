# 🖨️ Specificație Tehnică & Ghid de Implementare: Serviciu In-House de Printare Bonuri (Bella Roma POS)

Acest document este conceput ca un **ghid complet de specificații** pe care îl poți da direct oricărui Agent AI sau dezvoltator pentru a construi serviciul de printare nativ (in-house) pentru restaurantul Bella Roma.

---

## 🎯 1. Obiectivul Proiectului

Crearea unui **agent executabil de fundal pentru Windows** (`bella-print-service.exe` sau aplicație de System Tray) care să înlocuiască complet utilitarul *QZ Tray*. 

### Beneficii Cheie:
1. **Zero Ferestre de Confirmare:** Fără certificate digitale RSA, fără pop-up-uri în browser.
2. **Printare Nativă ESC/POS Ultra-Rapidă:** Trimite comenzi hardware directe către imprimanta termică (tăiere automată de hârtie, beep sonor la comandă nouă, text bold nativ).
3. **Funcționare Silențioasă în Fundal:** Pornește automat odată cu Windows-ul (`Windows Startup`) și rulează invizibil în System Tray.

---

## 🖥️ 2. Specificații Hardware & Mediu

* **Sistem de Operare:** Windows 10 / 11 (POS Expert All-in-One Touchscreen, rezoluție 1024x768).
* **Model Imprimantă:** **OCOM OCPP-80K** (sau POS-80 series).
* **Conexiune Hardware:** **Cablu USB Direct** conectat la PC (Driver Windows instalat: *POS-80* sau *Generic / Text Only*).
* **Caracteristici Rolă:** Hârtie termică 80mm (Lățime printabilă efectivă: **72mm** / 48 coloane font standard).
* **Comenzi Hardware Suportate:** ESC/POS standard, ghilotina automată (*Auto-Cutter*), sonerie internă (*Buzzer*).

---

## 🏗️ 3. Arhitectura Recomandată

### 🏆 Varianta A: Agent Autonom Conectat Direct la Supabase (Recomandată)
Agentul local se conectează direct la baza de date Supabase și ascultă comenzile noi în timp real:
```
[ Telefon Ospătar / Client QR ]
               │
               ▼
   [ Supabase PostgreSQL ]
               │ (Realtime WebSocket Broadcast)
               ▼
[ bella-print-service.exe (pe PC POS) ]
               │ (Comenzi ESC/POS directe via USB Spooler)
               ▼
[ Imprimantă Termică OCPP-80K ] ➔ Bon Printat + Cut + Beep!
```
* **Avantaj Major:** Chiar dacă browserul cu `receptie.html` este închis sau minimizat, **comenzile se printează garantat** în 0.2 secunde!

---

### 🌐 Varianta B: Micro-Server Local HTTP / WebSocket (`localhost:4000`)
Agentul pornește un server HTTP local pe portul `4000`. Când sosește o comandă, pagina `receptie.html` trimite un apel POST:
```javascript
fetch('http://localhost:4000/print', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
});
```

---

## 🧾 4. Formatul Vizual al Bonului (Specificație ESC/POS)

Fiecare bon generat trebuie să respecte următoarea structură:

```text
================================================
                  BELLA ROMA
                PUB & PIZZERIE
            *** BON SUPLIMENTAR ***  (dacă e cazul)
================================================
Masa: 4                                    #128
Data: 19.08.2026                     Ora: 13:45
Ospatar: Maria
------------------------------------------------
              --- [ IMPREUNA ] ---
2x Pizza Diavola                          70.00
   * Fara ceapa, bine facuta
1x Coca-Cola 0.33L                        10.00
------------------------------------------------
             --- [ PERSOANA 1 ] ---
1x Paste Carbonara                        38.00
------------------------------------------------
Subtotal: 118.00 Lei
================================================
              TOTAL: 118.00 Lei
================================================
                 Va multumim!
              www.bella-roma.ro

[COMANDĂ CUT: Tăiere Hârtie]
[COMANDĂ BEEP: 2 Bipuri Scurte]
```

### Comenzi ESC/POS Esențiale:
* **Inițializare:** `\x1B\x40` (ESC @)
* **Aliniere Centru:** `\x1B\x61\x01` (ESC a 1)
* **Aliniere Stânga:** `\x1B\x61\x00` (ESC a 0)
* **Aliniere Dreapta:** `\x1B\x61\x02` (ESC a 2)
* **Text Bold ON:** `\x1B\x45\x01` (ESC E 1)
* **Text Bold OFF:** `\x1B\x45\x00` (ESC E 0)
* **Font Dublu (Titlu / Total):** `\x1D\x21\x11` (GS ! 0x11)
* **Font Normal:** `\x1D\x21\x00` (GS ! 0x00)
* **Tăiere Hârtie (Partial/Full Cut):** `\x1D\x56\x00` (GS V 0) sau `\x1D\x56\x41\x03`
* **Sonerie / Buzzer:** `\x1B\x42\x02\x02` (ESC B 2 2 - 2 bipuri)

---

## 💻 5. Exemplu de Implementare (Node.js + Windows Spooler)

Agentul poate fi scris în **Node.js** și compilat într-un singur fișier `.exe` folosind `pkg`.

### Dependințe principale:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "node-printer": "^1.1.0", 
    "escpos": "^3.0.0-alpha.6"
  }
}
```

### Cod Sursă de Referință (`index.js`):
```javascript
const { createClient } = require('@supabase/supabase-js');
const printer = require('@thiagoelg/node-printer'); // sau win32print

const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_KEY = "your-anon-or-service-key";
const PRINTER_NAME_REGEX = /(OCPP|POS-80|Thermal|Receipt|XP-80)/i;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function getTargetPrinter() {
    const list = printer.getPrinters();
    const match = list.find(p => PRINTER_NAME_REGEX.test(p.name));
    return match ? match.name : printer.getDefaultPrinterName();
}

function buildEscPosBuffer(order) {
    const iconv = require('iconv-lite');
    let commands = [];

    // Init printer
    commands.push(Buffer.from([0x1B, 0x40]));

    // Header (Centrat + Bold)
    commands.push(Buffer.from([0x1B, 0x61, 0x01])); // Centru
    commands.push(Buffer.from([0x1D, 0x21, 0x11])); // Dublu
    commands.push(iconv.encode("BELLA ROMA\n", 'cp852'));
    commands.push(Buffer.from([0x1D, 0x21, 0x00])); // Normal
    commands.push(iconv.encode("PUB & PIZZERIE\n", 'cp852'));
    
    if (order.is_supplement) {
        commands.push(Buffer.from([0x1B, 0x45, 0x01]));
        commands.push(iconv.encode("*** BON SUPLIMENTAR ***\n", 'cp852'));
        commands.push(Buffer.from([0x1B, 0x45, 0x00]));
    }
    commands.push(iconv.encode("================================================\n", 'cp852'));

    // Info Masă & Dată
    commands.push(Buffer.from([0x1B, 0x61, 0x00])); // Stanga
    commands.push(iconv.encode(`Masa: ${order.numar_masa}                      #${order.id}\n`, 'cp852'));
    commands.push(iconv.encode(`Data: ${new Date().toLocaleDateString('ro-RO')}          Ora: ${new Date().toLocaleTimeString('ro-RO')}\n`, 'cp852'));
    if (order.ospatar_nume) {
        commands.push(iconv.encode(`Ospatar: ${order.ospatar_nume}\n`, 'cp852'));
    }
    commands.push(iconv.encode("------------------------------------------------\n", 'cp852'));

    // Produse
    // ... Parcurgere iteme, formatare 48 coloane ...

    // Total Bold
    commands.push(Buffer.from([0x1B, 0x61, 0x01]));
    commands.push(Buffer.from([0x1D, 0x21, 0x11]));
    commands.push(iconv.encode(`TOTAL: ${order.total} Lei\n`, 'cp852'));
    commands.push(Buffer.from([0x1D, 0x21, 0x00]));

    // Footer
    commands.push(iconv.encode("Va multumim!\nwww.bella-roma.ro\n\n\n\n", 'cp852'));

    // Cut Paper (GS V 0)
    commands.push(Buffer.from([0x1D, 0x56, 0x00]));

    // Buzzer (ESC B 2 2)
    commands.push(Buffer.from([0x1B, 0x42, 0x02, 0x02]));

    return Buffer.concat(commands);
}

// Ascultare Realtime Supabase
supabase
  .channel('comenzi-channel')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comenzi' }, payload => {
      console.log("Comandă nouă primită:", payload.new);
      const rawBuffer = buildEscPosBuffer(payload.new);
      const targetPrinter = getTargetPrinter();
      
      printer.printDirect({
          data: rawBuffer,
          printer: targetPrinter,
          type: 'RAW',
          success: (jobId) => console.log(`Printat cu succes (Job: ${jobId})`),
          error: (err) => console.error("Eroare printare:", err)
      });
  })
  .subscribe();

console.log("Serviciul de printare Bella Roma rulează...");
```

---

## 📦 6. Compilare în Executabil Windows (`.exe`)

Folosind `pkg`, întregul proiect Node.js se împachetează într-un singur executabil fără a fi nevoie de instalat Node.js pe calculatorul clientului:

```bash
npm install -g pkg
pkg index.js --target node18-win-x64 --output bella-print-service.exe
```

---

## 🚀 7. Ghid de Instalare la Restaurant (Windows)

1. Se copiază `bella-print-service.exe` în folderul `C:\BellaRomaPOS\`.
2. Se creează o scurtătură în folderul de pornire automată al Windows-ului:
   - `Win + R` ➔ scrie `shell:startup` ➔ Enter.
   - Trage o scurtătură către `bella-print-service.exe`.
3. La fiecare pornire a calculatorului POS, serviciul pornește automat și ascultă comenzile!
