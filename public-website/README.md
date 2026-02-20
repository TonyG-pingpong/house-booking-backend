# Stay & Book – Public booking website

Frontend for the house booking backend. Browse listings, sign up or log in, and book stays.

## Setup

1. From the repo root, start the backend:
   ```bash
   npm run start:dev
   ```
2. From this folder, install and run the website:
   ```bash
   cd public-website
   npm install
   npm run dev
   ```
3. Open http://localhost:5173 (or the URL Vite prints). The app talks to the API at `http://localhost:3000` by default.

## Config

- **VITE_API_URL** – Backend base URL (default: `http://localhost:3000`). Set in `.env` if your API runs elsewhere.

## Build

```bash
npm run build
```

Output is in `dist/`. Serve with any static host or `npm run preview` to test.
