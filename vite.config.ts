import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Pinned so the origin registered as a Kakao Maps 사이트 도메인 stays valid.
  // `strictPort` makes a conflict fail loudly instead of silently moving to 5174,
  // which would break the SDK's domain check.
  server: { port: 5173, strictPort: true },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
