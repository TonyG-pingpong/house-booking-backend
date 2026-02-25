# Scripts

Helper scripts for the House Booking project.

| Script | Platform | Purpose |
|--------|----------|---------|
| **run-mobile-browser.bat** | Windows | Start the mobile app dev server for testing in the browser (http://localhost:5174). Run from **project root**. Backend (e.g. start.bat) should be running. |
| **install-android-emulator.ps1** | Windows | Install Android Studio via winget and set ANDROID_HOME. Run once before using the Android emulator. |
| **run-android-emulator.bat** | Windows | Build app, sync Capacitor, start Android emulator (if needed), install and launch the app. Run from **project root**. |
| **run-android-emulator.sh** | macOS / Linux | Same as above for Android. `chmod +x` once, then run from project root. |
| **run-ios-simulator.sh** | macOS only | Build app, sync Capacitor, run on iOS Simulator. `chmod +x` once, then run from project root. |

**Full instructions (install steps, env vars, one sandbox):** see **[../docs/EMULATOR-SETUP.md](../docs/EMULATOR-SETUP.md)**.

**Quick start (Windows – Android):**
1. Run `.\scripts\install-android-emulator.ps1` (once).
2. Open Android Studio → Device Manager → Create Device (e.g. Pixel 6, API 34).
3. Start backend (e.g. `start.bat`). In `mobile-app\.env` set `VITE_API_URL=http://10.0.2.2:3000`.
4. Run `scripts\run-android-emulator.bat` from project root.

**Quick start (macOS – iOS):**
1. Install Xcode from the App Store and open it once.
2. Start backend. In `mobile-app\.env` set `VITE_API_URL=http://localhost:3000`.
3. Run `./scripts/run-ios-simulator.sh` from project root (optionally pass a device name, e.g. `"iPhone 15"`).
