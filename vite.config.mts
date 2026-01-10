import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  root: 'src/renderer',
  plugins: [
    svgr(),
    react(),
    tailwindcss(),
    visualizer({
      open: true,
      filename: 'dist/renderer/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
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
      '@shared/': path.resolve(__dirname, 'src/renderer/src/shared') + '/',
      '@shared': path.resolve(__dirname, 'src/renderer/src/shared'),
      '@entities/': path.resolve(__dirname, 'src/renderer/src/entities') + '/',
      '@entities': path.resolve(__dirname, 'src/renderer/src/entities'),
      '@features/': path.resolve(__dirname, 'src/renderer/src/features') + '/',
      '@features': path.resolve(__dirname, 'src/renderer/src/features'),
      '@widgets/': path.resolve(__dirname, 'src/renderer/src/widgets') + '/',
      '@widgets': path.resolve(__dirname, 'src/renderer/src/widgets'),
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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 페이지 레벨 코드 스플리팅
          if (id.includes('/pages/main-page')) {
            return 'main-page';
          }
          if (id.includes('/pages/login-page')) {
            return 'login-page';
          }
          if (id.includes('/pages/widget-page')) {
            return 'widget-page';
          }
          if (id.includes('/pages/calibration-page')) {
            return 'calibration-page';
          }
          if (id.includes('/pages/onboarding')) {
            return 'onboarding';
          }
          if (id.includes('/pages/email-verification')) {
            return 'email-verification';
          }
          if (id.includes('/pages/signup-page')) {
            return 'signup-page';
          }
          if (id.includes('/pages/resend-verification-page')) {
            return 'resend-verification';
          }
          // Recharts 라이브러리 분리
          if (id.includes('node_modules/recharts')) {
            return 'recharts';
          }
          // react-dom 분리
          if (id.includes('node_modules/react-dom')) {
            return 'react-dom';
          }
          // react 및 관련 라이브러리 분리
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/scheduler')
          ) {
            return 'react-vendor';
          }
        },
      },
    },
  },
});
