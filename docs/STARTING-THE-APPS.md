# Starting the apps

How to run the backend, web frontend, and mobile app, and how to use one environment for testing.

---

## 1. Backend + web frontend (public website)

**Yes – you can use `start.bat` for this.**

From the **project root** (where `start.bat` lives):

1. Double‑click **`start.bat`**  
   **or** in a terminal run:
   ```bat
   start.bat
   ```

2. It will:
   - Stop any process already using ports **3000** (backend) and **5173** (web frontend).
   - Start the **backend** (NestJS) at **http://localhost:3000**.
   - Start the **public website** (Vite) at **http://localhost:5173** (and on your LAN, e.g. http://192.168.1.217:5173).

3. Open in a browser: **http://localhost:5173**.

4. To stop: press **Ctrl+C** in that terminal (stops both backend and frontend).

**What’s under the hood:**  
`start.bat` runs `npm run start:all`, which uses `concurrently` to run:

- `npm run start:dev` (backend)
- `npm run dev:network --prefix public-website` (web frontend)

The mobile app is **not** started by `start.bat`; see section 3 for how to run it.

---

## 2. One “sandbox” environment for testing

**Yes – one backend can serve all clients.** This works on **Windows, macOS, and Linux**.

- **Backend** = single source of truth (API + database). Run it once (e.g. via `start.bat` on Windows).
- **Clients** you can use against that same backend depend on your OS:
  - **Public website** – started with `start.bat` → http://localhost:5173 (any OS)
  - **Mobile app in the browser** – dev server on port **5174** (any OS)
  - **Mobile app on Android** – emulator or real device (any OS; see section 2b)
  - **Mobile app on iOS (iPhone)** – simulator or real device (**macOS only**; Apple does not provide iOS Simulator on Windows)

So **one sandbox works on Windows**: you run one backend, and you can test the mobile app using the **browser** and/or the **Android emulator** (and a real Android phone if you have one). You cannot run the **iPhone simulator** on Windows; for that you need a Mac (see section 3, Platform C).

---

## 2b. Testing the mobile app on a Windows computer

On Windows you have **three ways** to test the mobile app against the same backend (one sandbox). You **cannot** run the iOS (iPhone) simulator on Windows.

| Option | What it is | When to use |
|--------|------------|-------------|
| **1. Browser** | Run the mobile app’s dev server and open it in Chrome/Edge at http://localhost:5174. Same app code and API as the native app. | Fastest; good for UI and API checks. Not a real mobile environment. |
| **2. Android emulator** | Install Android Studio, create a virtual device (AVD), then run `scripts\run-android-emulator.bat`. The app runs inside the emulator. | Test real Android (install, launch, native shell) without a physical phone. |
| **3. Real Android device** | Connect an Android phone by USB (or same Wi‑Fi). Set `VITE_API_URL` in `mobile-app\.env` to your PC’s LAN IP. Build and run from Android Studio onto the device. | Test on real hardware and sensors. |

**Summary on Windows:**  
- **One sandbox** = one backend (e.g. `start.bat`). You can use the **browser** and the **Android emulator** (and a real Android device) at the same time against that backend.  
- **iPhone testing** is not available on Windows; use a Mac with Xcode for the iOS Simulator, or a cloud Mac service / physical iPhone if you need to test iOS.

---

## 3. Starting the mobile app (by platform)

The mobile app is in the **`mobile-app`** folder. It talks to the same backend; the backend (and, for browser, optionally the public website) must be running first.

**Emulator (Android / iPhone):** To install tools and run the app on **Android emulator** or **iOS Simulator** with one command, see **[EMULATOR-SETUP.md](EMULATOR-SETUP.md)** and the scripts in **`scripts/`** (`run-android-emulator.bat` / `run-android-emulator.sh`, `run-ios-simulator.sh`).

### Prerequisites (all platforms)

- **Node.js** (e.g. 18+) and **npm** installed.
- **Backend running** (e.g. run **`start.bat`** from the project root, or `npm run start:dev` in the root).
- In **`mobile-app`**: `npm install` done once; copy **`.env.example`** to **`.env`** and set:
  - **Browser / same machine:**  
    `VITE_API_URL=http://localhost:3000`
  - **Real device or emulator (same Wi‑Fi):**  
    `VITE_API_URL=http://YOUR_PC_LAN_IP:3000`  
    (e.g. `http://192.168.1.217:3000` – use the same IP shown in the `start.bat` window for “Network”.)

---

### Platform A: Browser (quick testing, no device)

Use this for day‑to‑day UI and API testing. Same sandbox as above: one backend, mobile app in the browser.

1. **Start backend (and optionally web):**  
   From project root, run **`start.bat`** (or at least `npm run start:dev` for the backend).

2. **Start the mobile app dev server:**  
   In a **second** terminal:
   ```bat
   cd mobile-app
   npm run dev
   ```
   The app runs at **http://localhost:5174** (port 5174 so it doesn’t conflict with the public website on 5173).

3. **Open:**  
   http://localhost:5174  
   Sign up / log in and test. All API calls go to the same backend as the public site.

4. **Stop:**  
   Ctrl+C in the `mobile-app` terminal.

---

### Platform B: Android (emulator or real device)

You need **Android Studio** installed and either an emulator or a USB‑connected device.

**First time only:**

1. In **`mobile-app`**:
   ```bat
   npm run build
   npx cap add android
   npx cap sync
   ```
   If `npx cap sync` fails with **EPERM**, run it from a normal (non‑sandbox) terminal.

2. **Real device only:**  
   In **`mobile-app/.env`** set:
   ```env
   VITE_API_URL=http://YOUR_PC_LAN_IP:3000
   ```
   Then run `npm run build` and `npx cap sync` again so the app bundle has the right API URL.

**Every time you want to run on Android:**

1. **Start the backend** (e.g. **`start.bat`** from project root).

2. **Sync and open Android project:**
   ```bat
   cd mobile-app
   npm run build
   npx cap sync
   npm run android
   ```
   This opens **Android Studio** with the `android` project.

3. In Android Studio:
   - Pick an **emulator** or a **connected device**.
   - Click **Run** (green play button).

4. **Emulator:**  
   Use `VITE_API_URL=http://10.0.2.2:3000` in `.env` (Android emulator’s alias for your PC’s localhost), then rebuild/sync.  
   **Real device:**  
   Use your PC’s LAN IP (e.g. `http://192.168.1.217:3000`) and ensure the device is on the same Wi‑Fi.

5. The app on the device/emulator uses the **same backend** as your browser – one sandbox.

---

### Platform C: iOS (simulator or real device) – macOS only

You need **Xcode** (and thus a Mac). Capacitor’s iOS project is added only on macOS.

**First time only:**

1. In **`mobile-app`**:
   ```bat
   npm run build
   npx cap add ios
   npx cap sync
   npm run ios
   ```
   This opens Xcode with the iOS project.

2. In Xcode, select a **simulator** or a **connected iPhone** and click **Run**.

**Real device:**  
In **`mobile-app/.env`** set `VITE_API_URL=http://YOUR_MAC_LAN_IP:3000`, then `npm run build` and `npx cap sync` again.

**Every time:**  
Start backend (e.g. `start.bat` or `npm run start:dev`), then from **`mobile-app`** run `npm run build`, `npx cap sync`, and `npm run ios` (or run from Xcode). Same single backend = same sandbox.

---

## 4. Summary table

| What you want to run        | Command / action |
|----------------------------|-------------------|
| Backend + web frontend     | **`start.bat`** from project root |
| Mobile app in browser      | Backend running → `cd mobile-app` → `npm run dev` → open http://localhost:5174 |
| Mobile app on Android      | Backend running → `cd mobile-app` → `npm run build` → `npx cap sync` → `npm run android` → Run in Android Studio |
| Mobile app on iOS (Mac)    | Backend running → `cd mobile-app` → `npm run build` → `npx cap sync` → `npm run ios` → Run in Xcode |

**One sandbox:** Use one backend (started e.g. with `start.bat`). Test with the web frontend, the mobile app in the browser, or the mobile app on a device/emulator – all hit the same API and database.
