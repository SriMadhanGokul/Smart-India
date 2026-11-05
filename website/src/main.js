// Homepage entry: start the loader on the very first frame, wait for the fonts (the glass type rasterises glyphs),
// start smooth scrolling, then hand over to the desktop stage or the lite layout.
import 'lenis/dist/lenis.css';
import Lenis from 'lenis';
import { initChrome } from './chrome.js';
import { LOADER_END, makeClock, makeLoader } from './loader.js';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);

const root = document.documentElement;
// The head script chose a layout from the window size; a browser can still refuse a WebGL context.
const webgl = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (!webgl && root.classList.contains('full')) root.classList.replace('full', 'lite');
const lite = root.classList.contains('lite');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

// The intro plays once per visit: coming back to the homepage goes straight to the hero.
const seen = root.classList.contains('seen');
try { sessionStorage.setItem('si-seen', '1'); } catch { /* private mode: the intro simply plays again */ }

const clock = makeClock(seen ? LOADER_END : 0);
const loader = makeLoader();
let handedOver = false;
if (!seen && !reduce.matches) {
  const pre = now => { if (handedOver) return; clock.tick(now); loader.frame(clock.T); requestAnimationFrame(pre); };
  requestAnimationFrame(pre);
}

const lenis = new Lenis({ lerp: .1, smoothWheel: true, syncTouch: false });
const chrome = initChrome({ lenis });
chrome.lock(!seen && !reduce.matches);

const fonts = ['400 150px "Familjen Grotesk"', '500 100px "Familjen Grotesk"', '400 20px "Martian Mono"', '400 20px Inter', '500 20px Inter'];
await Promise.race([
  document.fonts.ready.then(() => Promise.all(fonts.map(f => document.fonts.load(f)))),
  new Promise(r => setTimeout(r, 4000)),
]);

// Let the loader get moving before the heavy 3D setup starts; it holds before its reveal until the page is ready.
if (!seen && !reduce.matches && !lite) await new Promise(r => { const wait = () => (clock.T > 1.1 ? r() : requestAnimationFrame(wait)); wait(); });
const page = lite ? await import('./lite.js') : await import('./desktop.js');
await page.start({ lenis, chrome, clock, loader, seen, reduce: reduce.matches, takeOver() { handedOver = true; } });

// Crossing the layout threshold (e.g. resizing a desktop window to phone width) reloads into the other layout.
let rt = 0;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (window.__wantsLite() !== lite && webgl) location.reload(); }, 400); });
reduce.addEventListener?.('change', () => location.reload());
