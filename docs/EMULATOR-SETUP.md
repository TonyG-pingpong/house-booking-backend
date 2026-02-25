# Emulator setup and run scripts

How to install everything needed to run the House Booking mobile app on **Android** and **iOS (iPhone)** emulators, and how to use the provided scripts.

---

## Overview

| Platform | Emulator runs on | What you install | Script to run app |
|----------|------------------|------------------|-------------------|
| **Android** | Windows, macOS, Linux | Android Studio (includes SDK + emulator) | `scripts\run-android-emulator.bat` (Windows) or `scripts/run-android-emulator.sh` (macOS/Linux) |
| **iOS (iPhone)** | **macOS only** | Xcode (from App Store) | `scripts/run-ios-simulator.sh` (macOS only) |

You only need one platform’s tools to test that platform. To test both, install Android Studio (any OS) and Xcode (macOS only).

---

## 1. Android emulator

### 1.1 Install (Windows)

**Option A – Automated**  
If the install script works on your machine:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser  # if needed
cd C:\projects\house-booking-backend
.\scripts\install-android-emulator.ps1
```

After install, restart your terminal so `ANDROID_HOME` is available. Then do **steps 2–4 below** (create AVD and set ANDROID_HOME if the script didn’t).

**Option B – Manual install (Windows)**  
Use this if the script fails or you prefer to install by hand.

1. **Download and install Android Studio**
   - Go to [developer.android.com/studio](https://developer.android.com/studio).
   - Download the Windows installer and run it.
   - Follow the wizard (default options are fine). Let it install the Android SDK.

2. **Set ANDROID_HOME (so the run script can find the emulator)**
   - Press **Win + R**, type `sysdm.cpl`, Enter → **Advanced** tab → **Environment Variables**.
   - Under **User variables** click **New**:
     - Variable name: `ANDROID_HOME`
     - Variable value: `%LOCALAPPDATA%\Android\Sdk`
   - Click OK. **Restart any open terminals** (or log out and back in) so the variable is visible.

3. **Create a virtual device (AVD)**
   - Open **Android Studio**.
   - On the welcome screen: **More Actions** → **Virtual Device Manager** (or from inside a project: **Tools** → **Device Manager**).
   - Click **Create Device**.
   - Pick a phone (e.g. **Pixel 6**) → **Next**.
   - Choose a **system image** (e.g. **API 34** or **Tiramisu**). If it says “Download” next to it, click **Download**, wait, then **Next**.
   - **Next** → **Finish**. You should see your new AVD in the list.

4. **Optional check**  
   In a **new** Command Prompt or PowerShell, run:
   ```bat
   echo %ANDROID_HOME%
   ```
   You should see something like `C:\Users\YourName\AppData\Local\Android\Sdk`. If it’s blank, restart the terminal or repeat step 2.

### 1.2 Install (macOS / Linux)

- Install [Android Studio](https://developer.android.com/studio).
- Open Android Studio → **Device Manager** → create an AVD (e.g. Pixel 6, API 34).
- Set `ANDROID_HOME` (e.g. in `~/.zshrc`): `export ANDROID_HOME=~/Library/Android/sdk` (macOS).

### 1.3 Run the app on Android emulator

1. **Start the backend** (e.g. run **`start.bat`** from the project root, or `npm run start:dev`).
2. **API URL for emulator:** In **`mobile-app/.env`** set:
   ```env
   VITE_API_URL=http://10.0.2.2:3000
   ```
   (`10.0.2.2` is the Android emulator’s alias for your PC’s localhost.)
3. From the **project root** run:

   **Windows:**
   ```bat
   scripts\run-android-emulator.bat
   ```

   **macOS / Linux:**
   ```bash
   chmod +x scripts/run-android-emulator.sh
   ./scripts/run-android-emulator.sh
   ```

The script will: build the web app → sync Capacitor → start an AVD if none is running → install the app on the emulator → launch the app.

---

## 2. iOS Simulator (iPhone) – macOS only

### 2.1 Install

- Install **Xcode** from the **App Store** (large download).
- Open Xcode once and accept the license; install any requested components.
- No separate “emulator” install: the **iOS Simulator** is included with Xcode.

### 2.2 Run the app on iOS Simulator

1. **Start the backend** (e.g. `npm run start:dev` from project root).
2. In **`mobile-app/.env`** use your Mac’s localhost or LAN IP, e.g.:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
   (Simulator runs on the Mac, so localhost is fine.)
3. From the **project root** run:
   ```bash
   chmod +x scripts/run-ios-simulator.sh
   ./scripts/run-ios-simulator.sh
   ```

The script will: build the web app → sync Capacitor → run the app in the iOS Simulator (and prompt for a device if needed).

---

## 3. One sandbox

Use **one** running backend for all testing:

- **Backend:** e.g. **`start.bat`** (or `npm run start:dev`).
- **Android emulator:** `VITE_API_URL=http://10.0.2.2:3000` in `mobile-app/.env`, then run `scripts\run-android-emulator.bat` (or the .sh on Mac/Linux).
- **iOS Simulator:** `VITE_API_URL=http://localhost:3000` in `mobile-app/.env`, then run `scripts/run-ios-simulator.sh` on macOS.

Same backend and database for web, Android emulator, and iOS Simulator.
