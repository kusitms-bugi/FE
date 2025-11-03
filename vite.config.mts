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
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: {
        exportType: 'default',
        ref: true,
      },
      // esbuild options, to transform jsx to js
      esbuildOptions: {
        jsx: 'automatic',
      },
      // A minimatch pattern, or array of patterns, which specifies the files in the build the plugin should include.
      include: '**/*.svg?react',
    }),
  ],
  resolve: {
    alias: {
      '@ui/': path.resolve(__dirname, 'src/renderer/src/components') + '/',
      '@ui': path.resolve(__dirname, 'src/renderer/src/components'),
      '@assets/': path.resolve(__dirname, 'src/renderer/src/assets') + '/',
      '@assets': path.resolve(__dirname, 'src/renderer/src/assets'),
      ui: path.resolve(__dirname, 'src/renderer/src/components'),
    },
  },
  server: {
    port: 3000,
    host: 'localhost',
  },
  build: {
    outDir: '../dist/renderer',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // SVG 파일은 별도 처리 (svgr이 처리)
          if (assetInfo.name?.endsWith('.svg')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
