// Site chrome shared by both layouts: header, menu overlay, ambient sound, footer, analytics.
import { NAV, SOCIAL, CONTACT, FOOTER, markSVG } from './content.js';
import { $, $$, initRoll } from './ui.js';

function setRoll(el, text) { el.dataset.t = text; el.__roll = false; initRoll(el.parentElement); }

export function initChrome({ lenis }) {
  const nav = $('#nav'), menu = $('#menu'), menuBtn = $('#navMenu');
  $('#navLogo').innerHTML = `<span id="navMark" style="display:flex">${markSVG(26, 'currentColor')}</span><span>SMARTINDIA</span>`;
  for (const a of $$('.callBtn')) a.href = `tel:${CONTACT.tel}`;

  /* ---------- menu ---------- */
  $('#menuLinks').innerHTML = NAV.map(([t, href], i) =>
    `<li style="--i:${i}"><a class="roll" href="${href}"><small>${String(i + 1).padStart(2, '0')}</small><span data-t="${t}"></span></a></li>`).join('');
  const mail = $('#menuMail'), tel = $('#menuTel');
  mail.href = `mailto:${CONTACT.email}`; mail.innerHTML = `<span data-t="${CONTACT.email}"></span>`;
  tel.href = `tel:${CONTACT.tel}`; tel.innerHTML = `<span data-t="${CONTACT.phone}"></span>`;
  $('#menuAddr').innerHTML = `${CONTACT.city}<br>${CONTACT.hours}`;
  const socialHTML = SOCIAL.map(([n, h]) => `<a class="roll" href="${h}"${h === '#' ? ' data-soon' : ' target="_blank" rel="noopener"'}><span data-t="${n}"></span></a>`).join('');
  $('#menuSocial').innerHTML = socialHTML;

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
    if (!audio) { audio = new Audio('/media/ambient.mp3'); audio.loop = true; audio.volume = 0; }
    const on = snd.getAttribute('aria-pressed') !== 'true';
    snd.setAttribute('aria-pressed', String(on)); snd.setAttribute('aria-label', on ? 'Mute ambient sound' : 'Play ambient sound');
    if (on) { audio.play().then(() => fade(.4)).catch(() => {}); } else fade(0, () => audio.pause());
  });

  /* ---------- footer ---------- */
  $('#fKicker').textContent = FOOTER.kicker;
  $('#fHead').textContent = FOOTER.heading;
  const fm = $('#fMail'), ft = $('#fTel');
  fm.href = `mailto:${CONTACT.email}`; fm.innerHTML = `<span data-t="${CONTACT.email}"></span>`;
  ft.href = `tel:${CONTACT.tel}`; ft.innerHTML = `<span data-t="${CONTACT.phone}"></span>`;
  $('#fSocial').innerHTML = socialHTML;
  $('#fCopy').textContent = `© ${new Date().getFullYear()} SMARTINDIA.DIGITAL`;
  $('#fAddr').textContent = CONTACT.city;
  // social profiles are not set yet: keep the links inert instead of jumping to the top
  for (const a of $$('[data-soon]')) a.addEventListener('click', e => e.preventDefault());

  const clock = $('#clock'), fmt = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
  const tick = () => { clock.textContent = `IST → ${fmt.format(new Date()).toUpperCase()}`; };
  tick(); setInterval(tick, 15000);

  footerLines();
  initRoll();
  if (import.meta.env.PROD) analytics();

  // lock(true) holds the page still (intro); scrolling resumes when neither the intro nor the menu holds it
  return { nav, isMenuOpen: () => open, lock(on) { introLock = on; sync(); } };
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
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw(now) {
    if (!on) return;
    const t = reduce ? 0 : now / 1000, n = 34, gap = h / n;
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

// The client's existing Microsoft Clarity and Meta Pixel, loaded only in production builds.
function analytics() {
  (function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, document, 'clarity', 'script', 'xxhznt5zik');
  !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', '1062073803017574'); window.fbq('track', 'PageView');
}
