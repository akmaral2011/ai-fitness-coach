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
      manifest: {
        name: 'AI Fitness Coach',
        short_name: 'FitCoach',
        theme_color: '#000000',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
