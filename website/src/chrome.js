// Site chrome behaviour shared by every page: menu overlay, ambient sound, footer, page transitions, analytics.
// The markup itself is rendered at build time (site/layout.js).
import { MEDIA } from './content.js';
import { $, $$, initRoll } from './ui.js';

const root = document.documentElement;
const BASE = import.meta.env.BASE_URL;
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function setRoll(el, text) { el.dataset.t = text; el.__roll = false; initRoll(el.parentElement); }

export function initChrome({ lenis }) {
  const nav = $('#nav'), menu = $('#menu'), menuBtn = $('#navMenu');

  /* ---------- menu ---------- */
  let open = false, introLock = false;
  const sync = () => (open || introLock ? lenis.stop() : lenis.start());
  const setMenu = on => {
    if (on === open) return;
    open = on;
    menu.classList.toggle('open', on); nav.classList.toggle('open', on);
    menu.setAttribute('aria-hidden', String(!on)); menuBtn.setAttribute('aria-expanded', String(on));
    setRoll($('#navMenuT'), on ? 'Close' : 'Menu');
    sync();
    if (on) setTimeout(() => $('#menuLinks a')?.focus({ preventScroll: true }), 500);
    else menuBtn.focus({ preventScroll: true });
  };
  menuBtn.addEventListener('click', () => setMenu(!open));
  addEventListener('keydown', e => { if (e.key === 'Escape' && open) setMenu(false); });
  menu.addEventListener('keydown', e => {           // keep keyboard focus inside the open menu
    if (e.key !== 'Tab') return;
    const f = [menuBtn, ...$$('a', menu)], i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  });

  /* ---------- ambient sound ---------- */
  const snd = $('#navSnd'); let audio = null, fadeId = 0;
  const fade = (to, done) => {
    cancelAnimationFrame(fadeId);
    const from = audio.volume, t0 = performance.now();
    const step = now => { const p = Math.min(1, (now - t0) / 900); audio.volume = from + (to - from) * p; if (p < 1) fadeId = requestAnimationFrame(step); else done?.(); };
    fadeId = requestAnimationFrame(step);
  };
  snd.addEventListener('click', () => {
    if (!audio) { audio = new Audio(`${MEDIA}ambient.mp3`); audio.loop = true; audio.volume = 0; }
    const on = snd.getAttribute('aria-pressed') !== 'true';
    snd.setAttribute('aria-pressed', String(on)); snd.setAttribute('aria-label', on ? 'Mute ambient sound' : 'Play ambient sound');
    if (on) { audio.play().then(() => fade(.4)).catch(() => {}); } else fade(0, () => audio.pause());
  });

  /* ---------- page transition: five slats close, the next page opens them ---------- */
  const wipe = $('#wipe');
  document.addEventListener('click', e => {
    const a = e.target.closest?.('a[href]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.hasAttribute('data-soon')) { e.preventDefault(); return; }     // social profiles are not set yet
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !u.pathname.startsWith(BASE)) return;
    if (u.pathname === location.pathname) {
      e.preventDefault();
      if (open) setMenu(false);
      const target = u.hash && document.querySelector(u.hash);
      lenis.scrollTo(target || 0, { immediate: reduceMotion(), force: true, offset: target ? -Math.round(innerHeight * .1) : 0 });
      return;
    }
    if (reduceMotion()) return;
    e.preventDefault();
    try { sessionStorage.setItem('si-wipe', '1'); } catch { /* private mode: page simply opens without the wipe */ }
    wipe.classList.add('in');
    setTimeout(() => { location.href = a.href; }, 720);
  });
  // back/forward restores a frozen page with the slats still closed
  addEventListener('pageshow', e => {
    if (!e.persisted) return;
    wipe.classList.remove('in'); root.classList.remove('wiped');
    try { sessionStorage.removeItem('si-wipe'); } catch { /* nothing to clear */ }
  });

  /* ---------- footer ---------- */
  const clock = $('#clock'), fmt = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
  const tick = () => { clock.textContent = `IST → ${fmt.format(new Date()).toUpperCase()}`; };
  tick(); setInterval(tick, 15000);

  footerLines();
  initRoll();
  // only the real site reports to the client's accounts: never local builds or preview hosts
  if (import.meta.env.PROD && /(^|\.)smartindia\.digital$/.test(location.hostname)) analytics();

  return {
    nav,
    isMenuOpen: () => open,
    // lock(true) holds the page still (intro); scrolling resumes when neither the intro nor the menu holds it
    lock(on) { introLock = on; sync(); },
    // open the slats once the new page is ready to be seen
    reveal() {
      if (!root.classList.contains('wiped')) return;
      root.classList.remove('wiped');
      try { sessionStorage.removeItem('si-wipe'); } catch { /* nothing to clear */ }
    },
  };
}

// Footer background: fine horizontal lines that ripple, and swell gently around the pointer.
function footerLines() {
  const cv = $('#lines'), g = cv.getContext('2d'), foot = $('#footer');
  let on = false, mx = -1e4, my = -1e4, w = 0, h = 0, raf = 0;
  const size = () => { const r = foot.getBoundingClientRect(); w = cv.width = Math.round(r.width); h = cv.height = Math.round(r.height); };
  new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) { size(); cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); } }).observe(foot);
  addEventListener('resize', () => on && size());
  foot.addEventListener('pointermove', e => { const r = foot.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  foot.addEventListener('pointerleave', () => { mx = my = -1e4; });
  const still = reduceMotion();
  function draw(now) {
    if (!on) return;
    const t = still ? 0 : now / 1000, n = 34, gap = h / n;
    g.clearRect(0, 0, w, h);
    g.lineWidth = 1;
    for (let i = 1; i < n; i++) {
      const y0 = i * gap, a = .035 + .05 * Math.pow(i / n, 2);
      g.strokeStyle = `rgba(216,216,216,${a.toFixed(3)})`;
      g.beginPath();
      for (let x = 0; x <= w; x += 24) {
        const d = Math.hypot(x - mx, y0 - my), lift = Math.exp(-d * d / 26000) * 26;
        const y = y0 + Math.sin(x * .0042 + t * .45 + i * .55) * (2 + i * .12) - lift;
        x ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
    raf = requestAnimationFrame(draw);
  }
}

// The client's existing Microsoft Clarity and Meta Pixel.
function analytics() {
  (function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, document, 'clarity', 'script', 'xxhznt5zik');
  !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', '1062073803017574'); window.fbq('track', 'PageView');
}
