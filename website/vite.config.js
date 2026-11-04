import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',          // top-level await in the entry module
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900, // three.js lives in the desktop chunk
  },
});
