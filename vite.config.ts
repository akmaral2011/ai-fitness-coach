import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import checker from 'vite-plugin-checker';
import { compression } from 'vite-plugin-compression2';
import mkcert from 'vite-plugin-mkcert';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import { reactClickToComponent } from 'vite-plugin-react-click-to-component';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    ViteEjsPlugin(),
    checker({ typescript: true }),
    mode === 'development' && mkcert(),
    mode === 'development' && reactClickToComponent(),
    mode === 'production' && compression(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'AI Fitness Coach',
        short_name: 'FitCoach',
        description: 'AI-powered fitness coaching with real-time form analysis',
        theme_color: '#10b981',
        background_color: '#0d0d14',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/app/dashboard',
        scope: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-dom')) return 'vendor-react';
          if (id.includes('react-router') || id.includes('@remix-run')) return 'vendor-router';
          if (id.includes('@tanstack')) return 'vendor-query';
          if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('zustand')) return 'vendor-state';
          if (id.includes('@mediapipe')) return 'vendor-mediapipe';
          return 'vendor-misc';
        },
      },
    },
  },
}));
