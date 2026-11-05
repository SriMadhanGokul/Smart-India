import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { pageInputs, sitePages } from './site/plugin.js';

const root = fileURLToPath(new URL('.', import.meta.url));

// `--mode pages` builds the GitHub Pages preview: served under /Smart-India/ and kept out of search results
// so it never competes with the real site.
export default defineConfig(({ mode }) => {
  const pages = mode === 'pages';
  return {
    appType: 'mpa',                 // every page is a real HTML file; unknown URLs are 404s, not the homepage
    base: pages ? '/Smart-India/' : '/',
    plugins: [
      sitePages(root),
      ...(pages ? [{
        name: 'noindex-preview',
        transformIndexHtml: html => html.replace('</title>', '</title>\n<meta name="robots" content="noindex">'),
      }] : []),
    ],
    build: {
      target: 'es2022',             // top-level await in the entry module
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 900,   // three.js lives in the desktop chunk
      rollupOptions: { input: pageInputs(root) },
    },
  };
});
