import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const config: UserConfig & { test?: Record<string, unknown> } = {
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  server: {
    port: 5174,
    strictPort: false,
  },
}
export default defineConfig(config)
