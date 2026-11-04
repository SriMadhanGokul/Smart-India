// Entry: choose the layout, wait for the fonts (the glass type rasterises glyphs), start smooth scrolling,
// then hand over to the desktop stage or the lite layout.
import 'lenis/dist/lenis.css';
import Lenis from 'lenis';
import { initChrome } from './chrome.js';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);

const root = document.documentElement;
const webgl = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
// The pinned 3D story needs a landscape screen of laptop size or larger; everything else gets the lite layout.
const wantsLite = () => reduce.matches || !webgl || innerWidth < 1100 || innerWidth / innerHeight < 1.2;
const lite = wantsLite();
root.classList.add(lite ? 'lite' : 'full');

const fonts = ['400 150px "Familjen Grotesk"', '500 100px "Familjen Grotesk"', '400 20px "Martian Mono"', '400 20px Inter', '500 20px Inter'];
await Promise.race([
  document.fonts.ready.then(() => Promise.all(fonts.map(f => document.fonts.load(f)))),
  new Promise(r => setTimeout(r, 4000)),
]);

const lenis = new Lenis({ lerp: .1, smoothWheel: true, syncTouch: false });
const chrome = initChrome({ lenis });
if (lite) (await import('./lite.js')).startLite({ lenis, chrome, reduce: reduce.matches });
else (await import('./desktop.js')).startDesktop({ lenis, chrome });

// Crossing the layout threshold (e.g. resizing a desktop window to phone width) reloads into the other layout.
let rt = 0;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (wantsLite() !== lite) location.reload(); }, 400); });
reduce.addEventListener?.('change', () => location.reload());
