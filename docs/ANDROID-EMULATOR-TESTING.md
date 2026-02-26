# Testing All Features in the Android Emulator

Step-by-step guide to run the House Booking mobile app in the **Android emulator** and manually test every feature.

---

## Prerequisites

- **Android Studio** installed with at least one **AVD** (virtual device).  
  See [EMULATOR-SETUP.md](EMULATOR-SETUP.md) for install and creating an AVD.
- **Node.js** (e.g. 18+) and **npm** on your PC.
- **Backend** and (optionally) **public website** running so you can create listings from the web if needed.

---

## Part 1: One-time setup

### 1.1 Backend and mobile-app env

1. **Start the backend** (from project root):
   ```bat
   start.bat
   ```
   Or in a terminal: `npm run start:dev`.  
   Backend runs at **http://localhost:3000**.

2. **Mobile-app environment** (from repo root):
   ```bat
   cd mobile-app
   copy .env.example .env
   ```
   For **emulator only** you can leave `.env` as:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
   The app uses **127.0.0.1:3000** on Android and the run script sets **adb reverse** so the emulator’s port 3000 forwards to your PC’s 3000.

### 1.2 Android project (first time only)

From **project root**:

```bat
cd mobile-app
npm install
npm run build
npx cap add android
npx cap sync
```

If `npx cap sync` fails with **EPERM**, run it from a normal (non-sandbox) terminal.

---

## Part 2: Run the app on the emulator

**Every time** you want to test on the emulator:

1. **Start the backend** (if not already): from project root run **`start.bat`** or `npm run start:dev`.

2. **From project root** run:
   ```bat
   scripts\run-android-emulator.bat
   ```
   This will:
   - Build the mobile app
   - Sync Capacitor
   - Start an AVD if none is running
   - Run **adb reverse tcp:3000 tcp:3000** (so the app can reach the backend at 127.0.0.1:3000)
   - Install and launch the app on the emulator

3. When the app opens, you should see the **Login** screen (or a brief “Loading…” then Login if not signed in).

**Alternative (manual):**

```bat
cd mobile-app
npm run build
npx cap sync
adb reverse tcp:3000 tcp:3000
npm run android
```

In Android Studio, choose the emulator and click **Run**. After the app is installed, run **adb reverse** again if you reboot the emulator.

---

## Part 3: Steps to test each feature

Use these in order so data (listings, bookings, messages) exists for later screens.

---

### 1. Auth – Sign up

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open app; you should be on **Login**. | Login form with Email, Password, “Log in”, “Sign up” link. |
| 2 | Tap **Sign up**. | Navigate to Sign up page. |
| 3 | Enter a **new** email (e.g. `guest1@test.com`) and password. | Fields accept input. |
| 4 | Tap **Sign up** (submit). | No error; redirect to **Listings** tab. |

---

### 2. Auth – Log in

| Step | Action | Expected |
|------|--------|----------|
| 1 | If already logged in, go to **Profile** → **Log out**. | Back to Login. |
| 2 | Enter the same email and password you used to sign up. | Fields accept input. |
| 3 | Tap **Log in**. | Redirect to **Listings** tab. |

---

### 3. Listings – Browse

| Step | Action | Expected |
|------|--------|----------|
| 1 | Ensure you’re on the **Listings** tab (bottom nav). | “Listings” heading and a list of listings (or “No listings yet.” if DB is empty). |
| 2 | If the list is empty, create listings from the **public website** (http://localhost:5173) after logging in there (or use backend/seed if you have one). Then pull-to-refresh or reopen the app. | List shows cards with image (if any), title, location, price. |
| 3 | Tap a listing card. | Navigate to **Listing detail**. |

---

### 4. Listing detail

| Step | Action | Expected |
|------|--------|----------|
| 1 | On listing detail, check image, title, location, price, description. | All shown correctly. |
| 2 | Tap **← Listings**. | Back to Listings tab. |

---

### 5. Bookings – My Bookings

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open **Bookings** tab (bottom nav). | “My Bookings” and either a list of your bookings or “No bookings yet.” |
| 2 | If empty, create a booking from the **public website** (listing detail → pick dates → Book). Then reopen or refresh the app and open Bookings again. | Your bookings appear with listing title, dates, location. |

---

### 6. Messages

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open **Messages** tab. | “Messages” and either a list of messages or “No messages yet.” |
| 2 | If empty, send a message from the **public website** (e.g. from a listing or Messages). Then reopen or refresh the app. | Messages list shows sender, date, content, and “Re: &lt;listing&gt;” if tied to a listing. |

---

### 7. Profile and Log out

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open **Profile** tab. | “Profile”, your email, “User ID: …”, **Log out** button. |
| 2 | Tap **Log out**. | Return to **Login** screen. |
| 3 | Try opening **Listings** (e.g. via deep link or back). | Should redirect to Login (protected route). |

---

### 8. Error and loading states (optional)

| Step | Action | Expected |
|------|--------|----------|
| 1 | **Stop the backend** (Ctrl+C in the terminal where `start.bat` is running). | — |
| 2 | In the app, open **Listings** or **Bookings**. | Loading then an error message (e.g. “Failed to load” or network error). |
| 3 | **Restart the backend**, then pull-to-refresh or reopen the app. | Data loads again. |

---

## Part 4: Quick checklist

- [ ] Backend running (e.g. `start.bat`).
- [ ] `scripts\run-android-emulator.bat` run (build, sync, adb reverse, install, launch).
- [ ] Sign up with a new user.
- [ ] Log in with that user.
- [ ] Listings tab: list loads; tap a listing → detail; back to list.
- [ ] Bookings tab: “My Bookings” (create booking on web if needed).
- [ ] Messages tab: list loads (send message on web if needed).
- [ ] Profile: email and User ID shown; Log out → back to Login.
- [ ] (Optional) Backend off → error on Listings/Bookings; backend on → data loads again.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| App shows “Failed to load” or network error | Ensure **backend** is running at http://localhost:3000. Run **adb reverse tcp:3000 tcp:3000** (script does this; run again if you restarted the emulator). |
| “No listings yet” and you want data | Use **public website** (http://localhost:5173): sign up / log in, add listings from Dashboard. Same backend = same data in the app. |
| Emulator doesn’t start | Open **Android Studio** → **Device Manager** → create an AVD (e.g. Pixel 6, API 34). See [EMULATOR-SETUP.md](EMULATOR-SETUP.md). |
| `ANDROID_HOME` not set | Set it (e.g. `%LOCALAPPDATA%\Android\Sdk` on Windows). Restart terminal. See [EMULATOR-SETUP.md](EMULATOR-SETUP.md). |
| Build/sync fails | Run `npm install` in `mobile-app`. If **EPERM** on `cap sync`, run `npx cap sync` from a normal terminal. |
| App not installed / wrong app opens | In Android Studio, select the **mobile-app** project under `mobile-app/android`, choose the emulator, and click **Run**. |

---

## Summary

1. **One-time:** Install Android Studio + AVD; in `mobile-app`: `npm install`, `npm run build`, `npx cap add android`, `npx cap sync`.
2. **Every run:** Start backend → run **`scripts\run-android-emulator.bat`** (build, sync, adb reverse, install, launch).
3. **Test flow:** Sign up → Log in → Listings (browse, detail) → Bookings → Messages → Profile → Log out; optionally test with backend off for errors.

For starting backend + web + mobile together, see [STARTING-THE-APPS.md](STARTING-THE-APPS.md). For emulator install and scripts, see [EMULATOR-SETUP.md](EMULATOR-SETUP.md).
