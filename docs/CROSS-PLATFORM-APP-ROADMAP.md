# Cross-Platform App Roadmap

Standalone **mobile app first** (iOS + Android), reusing the existing house-booking backend. Desktop app is **deferred**—add later only if needed.

---

## Current Backend (unchanged)

- **Stack:** NestJS, Prisma, PostgreSQL, JWT auth
- **API:** REST; `auth`, `listings`, `bookings`, `messages`, `users`
- **Auth:** `POST /auth/signup`, `POST /auth/login`, `POST /auth/profile`; Bearer token in `Authorization` header
- **Storage:** Token currently in `localStorage` on the web app; app will need platform-appropriate secure storage

No backend changes are required for a new client; ensure CORS and (if needed) API base URL configuration support the new app.

---

## Phase 1: Strategy & setup (Week 1)

### 1.1 Choose cross-platform approach

| Option | Pros | Cons | Best for |
|--------|------|------|----------|
| **React Native (Expo)** | One codebase for iOS + Android; can add Expo web for browser; team already uses React | Separate codebase from public-website; native UI patterns | Strong mobile focus, willing to maintain RN |
| **Flutter** | One codebase for mobile + web + desktop; fast, consistent UI | New language (Dart) and stack | Greenfield, want one stack for all platforms |
| **Capacitor** | Wrap existing or new web app in native shell; reuse React/Vite skills; one UI codebase | Web view on mobile (not native widgets); desktop via Electron/Tauri | Maximize reuse of web skills and UI |

**Recommendation (mobile first):**  
- **Capacitor** – one React/Vite app, wrap for iOS + Android only for now; add desktop (Electron/Tauri) later if needed.  
- **React Native (Expo)** – if you prefer native mobile UX and a dedicated app codebase.

### 1.2 Repo and project structure

- **Option A – Monorepo:** e.g. `apps/mobile-app` (or `apps/cross-platform-app`) next to `public-website` and backend; shared types or API client in `packages/api-client` if useful.
- **Option B – Separate repo:** New repo for the app, copy or publish API types and client; backend stays in this repo.

Decide where the app lives and whether you share types/API client with `public-website` (monorepo makes this easier).

### 1.3 Backend readiness

- [ ] Confirm CORS allows requests from the app’s origins (mobile may use `http://localhost` in dev; production uses app scheme or HTTPS).
- [ ] Document or add env for `API_BASE_URL` (e.g. `https://api.yourdomain.com`) for production.
- [ ] Optional: add a simple health or version endpoint for app startup checks.

---

## Phase 2: App shell & API layer (Weeks 2–3)

### 2.1 Bootstrap the app (mobile only)

- Create the project: **Capacitor + Vite/React** (or Expo/Flutter if you chose that).
- Configure build for **iOS and Android only**. Desktop is out of scope for now.

### 2.2 Shared API client

- Implement a single API client used by all platforms:
  - Base URL from environment (e.g. `API_BASE_URL`).
  - `fetch` (or platform-equivalent) with `Authorization: Bearer <token>`.
  - Same endpoints as `public-website/src/api.ts`: auth, listings, bookings, messages (and users if needed).
- Mirror DTOs/types (Listing, Booking, Message, User, Auth response) so request/response handling is consistent with the backend.

### 2.3 Auth flow

- **Screens:** Login, Signup (and optionally “Forgot password” if you add it on backend).
- **Token storage (mobile):** Secure storage (e.g. Capacitor secure storage plugin)—do not rely on `localStorage` alone for production.
- **State:** After login/signup, store token and user id/email; on launch, restore session and call `POST /auth/profile` to validate.
- **Logout:** Clear token and in-memory state; optional “logout everywhere” later via backend if you add it.
- **Token storage (mobile):** Use Capacitor secure storage (e.g. `@capacitor/preferences` with a secure plugin, or `@capacitor-community/secure-storage`) so tokens are not in plain WebView storage.

### 2.4 Navigation and minimal UI

- Set up app navigation (tabs, stack) and a simple home/shell.
- One placeholder “Home” or “Dashboard” after login to confirm auth and API base URL work on device/emulator.

---

## Phase 3: Core features (Weeks 4–7)

Implement in an order that matches your priorities (e.g. guest vs host flows).

### 3.1 Listings

- List listings (browse).
- Listing detail (single listing).
- Optional: “My listings” (host) and create/edit/delete (reuse backend DTOs and validation expectations).
- Image handling: use existing backend image URLs; ensure `getImageUrl`-style logic works with your `API_BASE_URL` (and CORS if images are served from API).

### 3.2 Bookings

- List “My bookings” (and optionally “Bookings for my listings” for hosts).
- Create booking (listing, dates, user); respect backend validation (e.g. date format, overlap).
- Booking detail and cancel if backend supports it.

### 3.3 Messages

- List conversations or messages (reuse `GET /messages` and thread semantics).
- Open thread, send message (`POST /messages`).
- Optional: delete thread (`DELETE /messages/thread`) and per-message delete.

### 3.4 Profile / settings

- Show profile (email, etc.) from `GET /auth/profile` or users API.
- Settings: API base URL (dev), theme, notifications (preferences only; push comes in Phase 4).
- Logout.

---

## Phase 4: Mobile polish and distribution (Weeks 8–10)

*Desktop is deferred; focus is mobile only.*

### 4.1 Mobile-specific

- **Push notifications:** Backend support (e.g. FCM/APNs tokens, store in DB); app: register device, handle taps (e.g. open message or booking).
- **Deep links:** `yourapp://listing/123`, `yourapp://messages` so links open the right screen.
- **Offline:** Optional caching of listings/bookings for read-only offline; sync or clear cache on next launch.
- **Biometrics:** Optional fingerprint/Face ID to unlock app or confirm sensitive actions.

### 4.2 Shared (mobile)

- **Error handling:** Network errors, 401 (redirect to login), 4xx/5xx messages.
- **Loading and empty states:** Skeletons or spinners; “No listings”, “No messages”.
- **Accessibility:** Labels, focus order, contrast (especially if reusing web UI in Capacitor).

---

## Phase 5: Build and distribution – mobile (Ongoing)

### 5.1 Build and CI

- Build iOS (Xcode) and Android (APK/AAB) in CI; sign with your certs.
- Versioning: single version (e.g. semver) for the app; backend can stay on its own version.

### 5.2 Distribution

- App Store and Google Play (store accounts, policies, screenshots, privacy notes).

### 5.3 Backend and API

- Keep backend and API contract stable; document any new endpoints or changes.
- Prefer feature flags or API versioning if you need to roll out breaking changes.

---

## Later (optional): Desktop app

If you decide you need a desktop app:

- Reuse the **same** Capacitor app (or a shared React app): package the web build with **Electron** or **Tauri** for Windows/macOS/Linux.
- No new UI codebase—same screens and API client; only add desktop build and installers (Phase 4/5 style tasks for desktop).

---

## Summary checklist (mobile first)

| Phase | Focus |
|-------|--------|
| 1 | Capacitor (or alternative), repo structure, backend CORS/API URL |
| 2 | App shell (mobile), API client, auth, secure token storage, navigation |
| 3 | Listings, bookings, messages, profile/settings |
| 4 | Push, deep links, offline (mobile); errors and a11y |
| 5 | Mobile build pipelines, App Store / Play Store submission |
| *Later* | Desktop: same app in Electron/Tauri if needed |

---

## References in this repo

- Backend API surface and auth: `src/auth`, `src/listings`, `src/bookings`, `src/messages`, `src/users`
- Existing API client and types: `public-website/src/api.ts`, `public-website/src/types` (if present)
- Env: backend and public-website use env for base URL; app will need equivalent (e.g. `API_BASE_URL`)

This roadmap assumes the backend stays as-is; the new app is a first-class client alongside the public website, using the same REST API and JWT auth.
