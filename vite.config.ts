import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json' assert { type: 'json' };

const buildDate = new Date().toISOString().split('T')[0].replace(/-/g, '.');
const buildRev = `v${pkg.version}+build.${buildDate}`;

export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_REV__: JSON.stringify(buildRev),
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toLocaleString('de-DE')),
  },
  server: {
    port: 5173,
    open: true
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          exportTools: ['xlsx', 'jspdf', 'jspdf-autotable'],
          icons: ['lucide-react']
        }
      }
    }
  }
});
