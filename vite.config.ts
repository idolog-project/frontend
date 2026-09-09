import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Only VITE_-prefixed names reach the client bundle; this one is read here in
  // the config, where it never leaves the dev server.
  const { VITE_API_PROXY_TARGET: target } = loadEnv(mode, process.cwd(), 'VITE_')

  return {
  plugins: [react(), tailwindcss()],
  // Pinned so the origin registered as a Kakao Maps 사이트 도메인 stays valid.
  // `strictPort` makes a conflict fail loudly instead of silently moving to 5174,
  // which would break the SDK's domain check.
  server: {
    port: 5173,
    strictPort: true,
    /**
     * Point `/api` at a real backend by setting `VITE_API_PROXY_TARGET` in
     * `.env.local`. Proxying rather than calling the deployed origin directly
     * keeps the browser on one origin, so the session cookie is first-party and
     * CORS never enters the picture.
     *
     * Unset — the usual case — leaves the app on MSW, which answers `/api`
     * inside the page and never reaches the dev server at all.
     */
    ...(target
      ? {
          proxy: {
            '/api': {
              target,
              changeOrigin: true,
              secure: true,
              // The backend redirects to Google; that has to reach the browser
              // rather than being followed here, where there is no user to
              // consent.
              followRedirects: false,
            },
          },
        }
      : {}),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  }
})
