# Testing Stay & Book

This project has **unit tests** for both the backend (NestJS) and the frontend (React/Vite). Use them to guard existing behaviour and to add tests for each new feature.

---

## Running tests

### Backend (NestJS + Jest)

From the **project root** (`c:\projects\house-booking-backend`):

```bash
npm test
```

- Runs all `*.spec.ts` files under `src/`.
- Watch mode (re-run on file changes): `npm run test:watch`
- Coverage: `npm run test:cov`

### Frontend – public website (Vite + Vitest)

From the **public-website** folder:

```bash
cd public-website
npm test
```

- Runs all `*.test.ts` and `*.spec.ts` files under `src/`.
- Watch mode: `npm run test:watch`

### Frontend – mobile app (Vite + Vitest)

From the **mobile-app** folder:

```bash
cd mobile-app
npm test
```

- Runs all `*.test.ts` and `*.test.tsx` files under `src/`.
- Watch mode: `npm run test:watch`
- Uses jsdom, `@testing-library/react`, and `@testing-library/jest-dom` (see `vitest.setup.ts`).

---

## What is tested today

### Backend

| Area | File | What’s tested |
|------|------|----------------|
| Auth | `src/auth/auth.service.spec.ts` | signup (validation, duplicate email), login, validateUser |
| Listings | `src/listings/listings.service.spec.ts` | create, findAll, findByHost, findOne, update (not found / forbidden / success), remove |
| Messages | `src/messages/messages.service.spec.ts` | create, findAll (with optional `since` for instant chat), findOne (not found / forbidden / success), update, remove |
| Bookings | `src/bookings/bookings.service.spec.ts` | create (listing missing, own listing, invalid dates, overlap, success), update, remove |

Services use **mocked** `PrismaService` (no real database).

### Frontend

| Area | File | What’s tested |
|------|------|----------------|
| API helper | `src/api.test.ts` | `getImageUrl()` for null, empty, absolute URL, relative path; `getMessages()` with and without `since` (instant chat polling) |
| usePolling hook | `src/hooks/usePolling.test.ts` | callback on mount, callback after interval, disabled does not run, stops on unmount |

### Mobile app

| Area | File | What’s tested |
|------|------|----------------|
| API | `src/api.test.ts` | `getImageUrl`, `getMessages` (with/without `since`), `deleteMessageThread` (params, error) |
| Auth | `src/contexts/AuthContext.test.tsx` | initial load, login success, logout, clearError |
| Bookings | `src/pages/Bookings.test.tsx` | loading/empty, error, list with listing info |

---

## Adding tests for a new feature

### Backend (new feature in a service)

1. Create or open the service file (e.g. `src/things/things.service.ts`).
2. Create or open the spec file: `src/things/things.service.spec.ts`.
3. Use the same pattern as existing specs:
   - `Test.createTestingModule({ providers: [Service, { provide: PrismaService, useValue: mockPrisma }] })`
   - Mock only what the service uses (e.g. `prisma.listing.create`, `prisma.user.findUnique`).
   - Write `describe` blocks per method and `it` per case (success, not found, forbidden, validation).
4. Run: `npm test` (from project root).

Example for a new method:

```ts
it('does X when Y', async () => {
  (prisma.someModel.someMethod as jest.Mock).mockResolvedValue(mockValue);
  const result = await service.someMethod(args);
  expect(result).toEqual(expected);
  expect(prisma.someModel.someMethod).toHaveBeenCalledWith(expectedArgs);
});
```

### Backend (new controller)

- You can add `things.controller.spec.ts` and mock the service:  
  `{ provide: ThingsService, useValue: mockThingsService }`.
- Focus on status codes and delegated calls; keep heavy logic in the service and test it in `things.service.spec.ts`.

### Frontend (new API or helper)

1. Add a test file next to the module, e.g. `src/api.test.ts` or `src/utils/format.test.ts`.
2. Import the function and test branches (success, empty, error path).
3. Mock `fetch` or `localStorage` with `vi.spyOn` / `vi.stubGlobal` if needed.
4. Run: `npm test` from `public-website`.

### Frontend (new React component or page)

1. Install (if not already): `@testing-library/react`, `@testing-library/jest-dom`.
2. Create `ComponentName.test.tsx` next to the component.
3. Render with `<BrowserRouter>` if the component uses routing, and mock any API calls.
4. Assert on visible text, links, or behaviour (e.g. `expect(screen.getByText('...')).toBeInTheDocument()`).

---

## Quick checklist for a new feature

- [ ] Backend: add or extend `*.service.spec.ts` for new/updated service methods.
- [ ] Backend: if you add a new controller, consider a `*.controller.spec.ts` that mocks the service.
- [ ] Frontend: add or extend `*.test.ts` for new API helpers or utils.
- [ ] Frontend: add `*.test.tsx` for new components/pages that contain important logic or UI.
- [ ] Run `npm test` (backend), `npm test` in `public-website`, and `npm test` in `mobile-app` before committing.

---

## Troubleshooting

- **Backend: “PrismaService is not defined”**  
  Ensure the spec provides a mock: `{ provide: PrismaService, useValue: mockPrisma }`.

- **Backend: “Cannot find module”**  
  Run `npm install` from the project root.

- **Frontend: “describe is not defined”**  
  In `vite.config.ts`, ensure `test.globals: true` is set (so `describe`, `it`, `expect` are global).

- **Frontend: tests time out**  
  Avoid real `fetch` in unit tests; mock it with `vi.stubGlobal('fetch', mockFetch)`.
