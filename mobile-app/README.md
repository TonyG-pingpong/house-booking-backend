# House Booking – Mobile App

Capacitor + Vite + React app for iOS and Android. Uses the same backend as the public website.

**Detailed startup (all platforms) and “one sandbox” testing:** see **[../docs/STARTING-THE-APPS.md](../docs/STARTING-THE-APPS.md)**.

---

## Quick start

1. **Backend** must be running (e.g. run **`start.bat`** from the project root, or `npm run start:dev` there).

2. **Environment**  
   Copy `.env.example` to `.env`. Use `VITE_API_URL=http://localhost:3000` for browser; use your PC’s LAN IP (e.g. `http://192.168.1.217:3000`) for a real device.

3. **Browser (same machine)**  
   ```bash
   npm install
   npm run dev
   ```  
   Open **http://localhost:5174** (port 5174 so it doesn’t conflict with the public website on 5173).

4. **Android**  
   ```bash
   npm run build
   npx cap add android   # first time only
   npx cap sync         # if EPERM, run from a normal terminal
   npm run android      # opens Android Studio
   ```  
   Build and run from Android Studio. On a real device, set `VITE_API_URL` in `.env` to your machine’s LAN IP and rebuild.

5. **iOS** (macOS only)  
   ```bash
   npx cap add ios
   npx cap sync
   npm run ios
   ```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server in browser (port 5174) |
| `npm run build` | Production build to `dist/` |
| `npm run build:cap` | Build and sync to native projects |
| `npm run android` | Open Android project in Android Studio |
| `npm run ios` | Open iOS project in Xcode |

---

## One sandbox for testing

One backend (e.g. started with **`start.bat`**) can serve:

- The **public website** (http://localhost:5173)
- The **mobile app in the browser** (http://localhost:5174)
- The **mobile app on Android or iOS** (device/emulator using your LAN IP)

So you can test the mobile app in the browser against the same backend as the website, or on a device/emulator against that same backend. See ** [../docs/STARTING-THE-APPS.md](../docs/STARTING-THE-APPS.md)** for full details.

---

## Backend health check

`GET http://localhost:3000/health` should return `{"status":"ok"}` when the backend is running.
