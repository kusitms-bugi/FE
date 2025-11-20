import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  root: 'src/renderer',
  plugins: [svgr(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@ui/': path.resolve(__dirname, 'src/renderer/src/components') + '/',
      '@ui': path.resolve(__dirname, 'src/renderer/src/components'),
      '@assets/': path.resolve(__dirname, 'src/renderer/src/assets') + '/',
      '@assets': path.resolve(__dirname, 'src/renderer/src/assets'),
      '@api/': path.resolve(__dirname, 'src/renderer/src/api') + '/',
      '@api': path.resolve(__dirname, 'src/renderer/src/api'),
      '@utils/': path.resolve(__dirname, 'src/renderer/src/utils') + '/',
      '@utils': path.resolve(__dirname, 'src/renderer/src/utils'),
      ui: path.resolve(__dirname, 'src/renderer/src/components'),
    },
  },
  server: {
    port: 3000,
    host: 'localhost',
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    sourcemap: true,
    emptyOutDir: true,
  },
});
