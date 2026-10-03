import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'civika-logo.png'],
      manifest: {
        name: 'Colegio Cívika - Sistema Escolar',
        short_name: 'Cívika',
        description: 'Sistema de Gestión Escolar para Colegio Cívika',
        theme_color: '#5b21b6',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'civika-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      html2canvas: 'html2canvas-pro',
    },
  },
})

