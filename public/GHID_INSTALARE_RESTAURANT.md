# 🚀 GHID RAPID DE INSTALARE & CONFIGURARE ÎN RESTAURANT
**Sistem Comenzi Pizzerie / Restaurant (Bella Roma)**

Acest document conține instrucțiunile complete pas-cu-pas pentru instalarea sistemului pe calculatorul POS/Touchscreen din restaurant și pe telefoanele/tabletele ospătarilor.

---

## 🖥️ PARTEA 1: CONFIGURARE CALCULATOR POS / TOUCHSCREEN (BAR / RECEPȚIE)
*(Durată: ~3 minute | Conectat prin USB la imprimanta OCPP-80K)*

### Pasul 1.1: Instalare QZ Tray
1. Deschide browserul pe PC-ul POS și intră pe:
   👉 **`https://qz.io/download/`**
2. Descarcă și instalează **QZ Tray** (apasă Next -> Next -> Install).
3. La final, verifică să apară iconița verde QZ Tray în colțul din dreapta jos (lângă ceas).

### Pasul 1.2: Configurare Certificat & Permisiuni (1 Click)
1. În browserul de pe POS, accesează:
   👉 **`https://proiect-pizzeria.vercel.app/setup-qz-tray.bat`**
2. Se va descărca fișierul `setup-qz-tray.bat`.
3. Mergi în **Downloads**, dă **Click Dreapta** pe `setup-qz-tray.bat` -> **Run as Administrator** *(Execută ca administrator)*.
4. Va apărea o fereastră neagră cu mesajul *"INSTALARE COMPLETĂ"*. Apasă orice tastă pentru a închide.

### Pasul 1.3: Deschiderea Panoului de Recepție & Salvare pe Desktop
1. Deschide în browser:
   👉 **`https://proiect-pizzeria.vercel.app/receptie.html`**
2. Autentifică-te cu contul de recepție.
3. Creează scurtătură / aplicație pe Desktop:
   - În Chrome/Edge: Meniu (3 puncte dreapta sus) -> **Save and Share** -> **Create Shortcut** (bifează *Open as window*).
4. Verifică bara de sus: trebuie să scrie cu verde **`🖨️ QZ Tray: Conectat (OCPP-80K / POS-80)`**.
5. Apasă butonul **„Test Imprimantă”** -> bonul de test trebuie să iasă instant din imprimantă!

---

## 📱 PARTEA 2: CONFIGURARE TELEFOANE / TABLETE OSPĂTARI
*(Durată: ~1 minut per dispozitiv)*

1. Conectează dispozitivul la Wi-Fi sau date mobile.
2. Deschide browserul pe telefon/tabletă:
   👉 **`https://proiect-pizzeria.vercel.app/ospatar.html`**
3. **Adaugă iconița pe ecranul principal (PWA):**
   - **Pe Android (Chrome):** Meniu (3 puncte) -> **„Adaugă pe ecranul de pornire”** / **„Instalează aplicația”**.
   - **Pe iPhone / iPad (Safari):** Butonul Share (pătratul cu săgeată) -> **„Adaugă la ecranul principal”**.
4. Acum ospătarul are o aplicație nativă pe ecran numită **Bella Roma**.

---

## 🧪 PARTEA 3: TESTUL FUNCȚIONAL COMPLET (SIMULARE COMANDĂ)

1. **Pe telefonul ospătarului (`ospatar.html`):**
   - Selectează **Masa 1**.
   - Adaugă produse în coș (ex: 1 Pizza + 1 Băutură).
   - Apasă butonul verde: **`🚀 Trimite la Recepție`**.

2. **Pe ecranul POS (`receptie.html`):**
   - Comanda apare instantaneu în lista de comenzi active.
   - Imprimanta termică OCPP-80K scoate automat bonul de comandă (cu sunet și tăiere de hârtie).
   - Butonul devine verde: **`✓ Comandă Printată (Marchează Servită)`**.

3. **Fluxul de servire:**
   - Când mâncarea este dusă la masă -> se apasă **`✓ Comandă Printată`** -> starea devine **`SERVITĂ`** (albastru).
   - Când clientul plătește și masa se eliberează -> se apasă **`🧹 Eliberează Masa 1`** -> comanda trece în istoric și masa devine liberă.

---

## 🔧 GHID RAPID DE DEPANARE (DACĂ CEVA NU MERGE)

| Problemă | Cauză probabilă | Soluție rapidă |
| :--- | :--- | :--- |
| **QZ Tray arată "Deconectat"** | Aplicația QZ Tray e oprită | Deschide QZ Tray din Start Menu pe PC. |
| **Apare pop-up cu "Action Required"** | Scriptul `.bat` nu a fost rulat ca admin | Apasă `Allow`, apoi rulează din nou `setup-qz-tray.bat` ca Administrator. |
| **Nu iese hârtia din imprimantă** | Cablu USB slăbit sau lipsă hârtie | Verifică cablul USB în spatele POS-ului și LED-ul albastru de pe imprimantă. |
| **Ospătarul nu vede categoriile noi** | Pagina are cache vechi | Trage în jos pe ecranul telefonului (Pull to Refresh) sau dă Refresh. |

---

## 🔗 LINK-URI UTILE
- **Panou Recepție (POS):** `https://proiect-pizzeria.vercel.app/receptie.html`
- **Panou Ospătar (Mobil):** `https://proiect-pizzeria.vercel.app/ospatar.html`
- **Panou Admin (Meniu & Prețuri):** `https://proiect-pizzeria.vercel.app/admin.html`
- **Script Configurare Imprimantă:** `https://proiect-pizzeria.vercel.app/setup-qz-tray.bat`
- **Download QZ Tray:** `https://qz.io/download/`
