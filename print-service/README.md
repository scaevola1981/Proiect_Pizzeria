# 🖨️ Serviciu In-House de Printare Bonuri (Bella Roma POS)

Agent de fundal autonom pentru Windows care înlocuiește complet *QZ Tray*. Printează direct comenzile primite în restaurant pe imprimanta termică USB (`POS-80` / `OCPP-80K`) prin comenzi native ESC/POS.

---

## 🌟 Beneficii Cheie
* **Zero Ferestre de Dialog / Popups:** Fără certificate digitale RSA, fără aprobări manuale în browser.
* **Autonom & Neîntrerupt:** Rulează independent în fundal pe PC-ul POS; chiar dacă browserul este închis sau minimizat, comenzile sosite de la ospătari sau clienți se printează garantat!
* **Text Îngroșat (Bold) & Formatare 80mm:** Produsele și cantitățile sunt evidențiate cu caractere aldine pentru lizibilitate maximă în bucătărie.
* **Tăiere Automată & Sonerie:** Execută comanda hardware de tăiere (`Auto-Cutter`) și 2 bipuri sonore la fiecare comandă.
* **Recuperare Automată (Offline Recovery):** Dacă PC-ul a fost stins, la pornire preia și printează automat toate comenzile restante din Supabase.

---

## 🛠️ Instalare pe Calculatorul POS din Restaurant

### Pasul 1: Copiere Fișiere
Copiați folderul `print-service/` pe calculatorul POS (de exemplu în `C:\BellaRomaPOS\print-service\`).

### Pasul 2: Testare Conexiune Imprimantă
1. Asigurați-vă că imprimanta este conectată la USB și pornită.
2. Dați dublu-click pe **`test-print.bat`** (sau rulați `node test-print.js`).
3. Imprimanta va tipări imediat un bon de probă, va tăia hârtia și va da 2 bipuri!

### Pasul 3: Pornire Automată odată cu Windows (Startup)
Pentru ca serviciul să pornească automat de fiecare dată când este aprins calculatorul din restaurant:
1. Apăsați tastele **`Win + R`**.
2. Tastați **`shell:startup`** și apăsați **Enter** (se va deschide folderul de Startup al Windows).
3. Faceți **Click Dreapta ➔ Creare Scurtătură (Shortcut)** către fișierul `start-service.bat` (sau `bella-print-service.exe`).
4. Gata! Serviciul va porni invizibil la fiecare deschidere a PC-ului.

---

## ⚙️ Configurare (`config.json`)

Puteți ajusta setările în fișierul `config.json`:

```json
{
  "connection_type": "USB",
  "printer_name": "POS-80",
  "auto_cut": true,
  "beep_on_order": true,
  "beep_count": 2,
  "http_port": 4000
}
```

* **`printer_name`**: Numele imprimantei așa cum apare în Windows *Settings ➔ Printers* (implicit `POS-80`).
* **`auto_cut`**: `true` pentru tăiere automată a bonului.
* **`beep_on_order`**: `true` pentru sonerie la comandă nouă.
* **`http_port`**: `4000` (portul local pe care comunică cu pagina de Recepție).

---

## 📦 Compilare în fișier `.exe` de sine stătător (Opțional)

Dacă doriți să generați un singur fișier executabil `bella-print-service.exe` care rulează fără Node.js:
```bash
npm install
npm run build-exe
```
Fișierul executabil va fi generat în folderul `dist/bella-print-service.exe`.
