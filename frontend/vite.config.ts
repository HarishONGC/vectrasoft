import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devPort = Number(env.VITE_DEV_PORT ?? 5173)
  const tunnelHost = env.VITE_DEV_TUNNEL_HOST

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['vite.svg'],
        manifest: {
          name: 'CCTV Monitoring Dashboard',
          short_name: 'CCTV Dashboard',
          description: 'Centralized CCTV monitoring dashboard (offline-capable UI)',
          theme_color: '#0b1220',
          background_color: '#0b1220',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/vite.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          // SPA offline navigation: serve index.html for app routes.
          navigateFallback: '/index.html',
          // Keep caching simple and predictable.
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,txt,woff,woff2}'],
        },
        // We want offline in prod builds; dev SW is optional.
        devOptions: { enabled: false },
      }),
    ],
    server: {
      host: true,
      port: devPort,
      strictPort: true,
      hmr: tunnelHost
        ? {
            host: tunnelHost,
            protocol: 'wss',
            clientPort: 443,
          }
        : undefined,
    },
  }
})
