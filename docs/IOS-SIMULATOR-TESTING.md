# Testing the Mobile App on iPhone (macOS)

Step-by-step guide to run the House Booking mobile app on **iOS Simulator** or a **real iPhone** using your Mac.

---

## Prerequisites

- **Mac** with macOS.
- **Xcode** from the [App Store](https://apps.apple.com/app/xcode/id497799835). Open Xcode once and accept the license; install any requested components. The **iOS Simulator** is included with Xcode.
- **Node.js** (e.g. 18+) and **npm**.
- **Backend** running so the app can reach the API (e.g. from your Windows machine or from the Mac—see “Backend” below).

---

## Part 1: One-time setup on your Mac

Do this once after cloning the repo (or when adding iOS for the first time).

### 1.1 Get the project on your Mac

Copy or clone the **house-booking-backend** repo onto your Mac (e.g. via Git clone, USB drive, or shared folder). The `mobile-app` folder and the rest of the project must be present.

### 1.2 Backend

The app needs the backend API. You have two options:

| Option | When to use |
|--------|-------------|
| **Backend on your Mac** | Run the NestJS backend on the Mac (e.g. `npm run start:dev` from project root). Then use `VITE_API_URL=http://localhost:3000` in `mobile-app/.env`. |
| **Backend on another machine (e.g. Windows)** | Start the backend on that machine. In `mobile-app/.env` use your **Mac’s** LAN IP or the **other machine’s** LAN IP so the simulator/device can reach it (e.g. `VITE_API_URL=http://192.168.1.100:3000`). Ensure both devices are on the same network. |

For the **iOS Simulator**, `localhost` on the Mac is the simulator’s host—so if the backend runs on the **same Mac**, use `VITE_API_URL=http://localhost:3000`.

### 1.3 Mobile-app environment

On your Mac, from the **project root**:

```bash
cd mobile-app
cp .env.example .env
```

Edit `mobile-app/.env`:

- **Simulator with backend on same Mac:**  
  `VITE_API_URL=http://localhost:3000`
- **Simulator or device with backend on another machine:**  
  `VITE_API_URL=http://YOUR_BACKEND_MACHINE_LAN_IP:3000`  
  (e.g. `http://192.168.1.50:3000`)

### 1.4 Add the iOS project (first time only)

The repo may not include the `ios` folder (it’s often generated on a Mac). From the **project root** on your Mac:

```bash
cd mobile-app
npm install
npm run build
npx cap add ios
npx cap sync
```

If `npx cap add ios` asks to install **CocoaPods**, accept it. This creates the `mobile-app/ios` folder and configures the Xcode project.

---

## Part 2: Run the app (every time)

### Option A: Using the run script (recommended)

1. **Start the backend** (on the Mac or on another machine; see 1.2).
2. From the **project root** on your Mac:

   ```bash
   chmod +x scripts/run-ios-simulator.sh   # first time only
   ./scripts/run-ios-simulator.sh
   ```

   To pick a specific simulator (e.g. iPhone 15):

   ```bash
   ./scripts/run-ios-simulator.sh "iPhone 15"
   ```

3. The script builds the app, syncs Capacitor, and launches the **iOS Simulator** with the app installed.

### Option B: Manual steps

1. **Start the backend.**
2. From the **project root**:

   ```bash
   cd mobile-app
   npm run build
   npx cap sync ios
   npm run ios
   ```

3. **Xcode** opens with the iOS project. In the toolbar, select an **iPhone simulator** (e.g. iPhone 15) and click **Run** (▶).

---

## Part 3: Run on a real iPhone

1. **Connect your iPhone** to the Mac with a USB cable.
2. In **`mobile-app/.env`** set the API URL so the phone can reach the backend:
   - If the backend runs on your **Mac**: use your Mac’s **LAN IP** (e.g. `VITE_API_URL=http://192.168.1.100:3000`). The phone cannot use `localhost`.
   - If the backend runs on another machine: use that machine’s LAN IP.
3. Rebuild and sync:
   ```bash
   cd mobile-app
   npm run build
   npx cap sync ios
   npm run ios
   ```
4. In **Xcode**, select your **iPhone** (not a simulator) in the device menu and click **Run**.
5. **First time on device:** You may need to enable **Developer Mode** on the iPhone (Settings → Privacy & Security → Developer Mode) and trust the Mac. If the app is unsigned, set your **Team** in Xcode: select the project → **Signing & Capabilities** → choose your Apple ID team.

---

## Part 4: Quick feature checklist

Use the same flow as on Android to verify behavior:

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open app | Login screen (or “Loading…” then Login). |
| 2 | Sign up with a new email | Redirect to Listings. |
| 3 | Log in with that user | Listings tab. |
| 4 | Listings tab | List of listings; tap one → detail; back to list. |
| 5 | Bookings tab | “My Bookings” (create a booking on the web if needed). |
| 6 | Messages tab | Messages list (send a message on the web if needed). |
| 7 | Profile → Log out | Back to Login. |

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| “mobile-app/ios not found” or `cap sync ios` fails | Run **`npx cap add ios`** from the `mobile-app` folder on your Mac, then `npx cap sync`. |
| App shows “Failed to load” or network error | Ensure the **backend** is running and **`VITE_API_URL`** in `mobile-app/.env` is correct. Simulator: use `localhost` if backend is on the same Mac; for a real device use the Mac’s or backend machine’s LAN IP. |
| Xcode doesn’t open or “No devices” | Open **Xcode** once, accept the license, and install components. Then **Xcode → Window → Devices and Simulators** to see simulators. |
| CocoaPods / pod install errors | In `mobile-app/ios` run `pod install` (install CocoaPods with `sudo gem install cocoapods` if needed). Then from `mobile-app`: `npx cap sync ios` and `npm run ios` again. |
| Real device: “Untrusted Developer” | On the iPhone: **Settings → General → VPN & Device Management** → tap your developer profile → **Trust**. |
| Real device: signing errors in Xcode | In Xcode: select the **House Booking** project → **Signing & Capabilities** → select your **Team** (Apple ID). |

---

## Summary

1. **One-time on Mac:** Install Xcode; in `mobile-app`: `npm install`, `npm run build`, `npx cap add ios`, `npx cap sync`. Set `mobile-app/.env` with the correct `VITE_API_URL`.
2. **Every run:** Start the backend → from project root run **`./scripts/run-ios-simulator.sh`** (or build, sync, and `npm run ios` from `mobile-app`).
3. **Real iPhone:** Set `VITE_API_URL` to the backend’s LAN IP, rebuild/sync, then in Xcode select your iPhone and Run; trust the developer certificate on the device if prompted.

For one sandbox (backend + web + mobile), see [STARTING-THE-APPS.md](STARTING-THE-APPS.md). For Android testing, see [ANDROID-EMULATOR-TESTING.md](ANDROID-EMULATOR-TESTING.md).
