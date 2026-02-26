# Mobile App Feature Parity & What to Start With

This doc compares the **web app** (`public-website`) and **mobile app** (`mobile-app`) and recommends an order for bringing web features to mobile and adding unit tests.

**Verified on Android emulator:** Listings, Dashboard, Bookings, Messages, and Profile all work end-to-end (create booking from listing detail, contact host → Messages, host dashboard CRUD).

---

## Current state

| Feature | Web | Mobile | Notes |
|--------|-----|--------|------|
| **Auth** | Login, Signup (modal), logout | Login, Signup (pages), logout | Mobile uses Capacitor Preferences for token. |
| **Listings** | Browse, detail, image URLs | Browse, detail, Contact host, Book this place | Parity; create booking and message host from detail. |
| **My Bookings** | Full list with listing link, dates, location, price | List with listing title, dates, location | Mobile could add “View listing” link and price. |
| **Messages** | List, thread, send, delete thread | List, thread, send (threads + compose) | Contact host opens new thread; mobile can add delete thread. |
| **Dashboard (host)** | My listings CRUD, create/edit/delete, image upload | **Done** – tab + CRUD + image upload | Verified on emulator. |
| **Create booking** | From listing detail (dates, submit) | **Done** – listing detail dates + Request to book | Verified on emulator. |
| **Profile / Settings** | Minimal (via nav) | Profile (email, User ID, Log out) | Both minimal; mobile can add settings (API URL, theme). |
| **Home** | N/A (landing is listings) | Index redirects to Listings | Optional: dedicated Home with quick links. |

---

## Recommended order to develop (what to start with)

### 1. **Create booking from listing detail (mobile)**  
**Why first:** Core guest flow; web already has it.  
**Tasks:**  
- On mobile `ListingDetail` page, add date picker and “Book” button.  
- Call `createBooking` from `api.ts` (already exists).  
- Show success/error and optionally navigate to Bookings tab.  
**Tests:** Unit test `ListingDetail` with mocked `getListing` and `createBooking`; test API `createBooking` (optional, similar to `api.test.ts`).

### 2. **Dashboard (host) on mobile**  
**Why second:** Biggest feature gap; hosts need to manage listings.  
**Tasks:**  
- Add a “Dashboard” or “Host” screen (e.g. under Profile or new tab).  
- Reuse web behaviour: list “My listings”, create/edit/delete listing, image upload.  
- Reuse `getMyListings`, `createListing`, `updateListing`, `deleteListing`, `uploadListingImage` from `mobile-app/src/api.ts`.  
**Tests:** Unit tests for a Dashboard container (load my listings, open add/edit, submit with mocks).

### 3. **My Bookings polish (mobile)**  
**Why third:** Small UX improvement.  
**Tasks:**  
- Add “View listing” link to each booking card (like web).  
- Show price per night if listing is present.  
- Optionally filter “my” bookings by current user (backend may already return only current user’s).  
**Tests:** Extend existing `Bookings.test.tsx` (links, price text).

### 4. **Profile & settings (mobile)**  
**Why fourth:** Improves usability and dev experience.  
**Tasks:**  
- Profile: show email (and userId) from `getProfile()`.  
- Settings: optional dev API base URL, theme (light/dark), notifications placeholder.  
**Tests:** Unit test Profile page with mocked `useAuth` and optional API.

### 5. **Home tab (mobile)**  
**Why fifth:** Better first-screen experience.  
**Tasks:**  
- Replace placeholder with: quick links to Listings / Bookings / Messages, or a simple “Dashboard” summary (e.g. next booking, unread count).  
**Tests:** Snapshot or simple render test with mocked auth.

### 6. **Messages parity**  
**Why sixth:** Web has delete thread; mobile may already support it via API.  
**Tasks:**  
- Ensure mobile Messages UI can delete a thread (call `deleteMessageThread`).  
- Optional: polling for new messages (like web `usePolling`) for “instant” feel.  
**Tests:** Unit test Messages list/thread with mocked `getMessages`, `deleteMessageThread`.

---

## Unit tests added for mobile (current)

| Area | File | What’s tested |
|------|------|----------------|
| API | `mobile-app/src/api.test.ts` | `getImageUrl` (null, empty, http, relative); `getMessages` (with/without `since`); `deleteMessageThread` (params, DELETE, error) |
| Auth | `mobile-app/src/contexts/AuthContext.test.tsx` | Initial load (no token), login success, logout clears user, clearError |
| Bookings | `mobile-app/src/pages/Bookings.test.tsx` | Loading → empty state, error state, list with listing info |

**Run mobile tests:** From `mobile-app`: `npm test` or `npm run test:watch`.

---

## Summary

- **Start with:** **Create booking on listing detail** (guest flow), then **Dashboard (host)** for listing CRUD.  
- **Then:** Bookings polish, Profile/settings, Home tab, Messages parity.  
- **Testing:** Mobile now has Vitest + jsdom + Testing Library; add tests for each new screen or API usage (mirror patterns in `api.test.ts`, `AuthContext.test.tsx`, `Bookings.test.tsx`).

For backend and public-website testing, see root [TESTING.md](../TESTING.md).
