// Lite layout for phones, tablets and reduced-motion visitors: the same story and content as the desktop
// stage, stacked in normal document flow with light-weight reveals (no WebGL).
import { HERO, ABOUT, MARQUEE, FACTS, CLIENTS, WORK, SERVICES_WORDS, RIBBON, CONTACT, MARK, SITE } from './content.js';
import { $, $$, words, odometer, initRoll } from './ui.js';
import { factCardsHTML, workCardHTML, labsHTML, ribbonCard, mountTestimonials } from './blocks.js';
import { makeLoader } from './loader.js';
import { clamp, seg, eout } from './lib/util.js';

// The S mark as an SVG: dark glossy beams with an ember rim and a fire band sweeping across.
function markArt() {
  const d = p => 'M' + p.map(([x, y]) => `${x} ${-y}`).join(' L') + ' Z';
  const paths = MARK.map(d);
  return `<svg viewBox="-1.6 -1.6 3.2 3.2" aria-hidden="true"><defs>
    <linearGradient id="lmB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2a31"/><stop offset=".5" stop-color="#0e0e12"/><stop offset="1" stop-color="#050506"/></linearGradient>
    <linearGradient id="lmF" gradientUnits="userSpaceOnUse" x1="-1.6" y1="-1.6" x2="1.6" y2="1.6">
      <stop offset=".40" stop-color="#ff5a14" stop-opacity="0"/><stop offset=".48" stop-color="#ff6a1f" stop-opacity=".75"/><stop offset=".5" stop-color="#ffc08a" stop-opacity="1"/>
      <stop offset=".52" stop-color="#ff6a1f" stop-opacity=".75"/><stop offset=".60" stop-color="#ff5a14" stop-opacity="0"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-3.2 -3.2; 3.2 3.2" dur="5.5s" repeatCount="indefinite"/></linearGradient></defs>
    ${paths.map(p => `<path d="${p}" fill="url(#lmB)" stroke="rgba(255,110,40,.55)" stroke-width=".018" stroke-linejoin="round"/>`).join('')}
    ${paths.map(p => `<path d="${p}" fill="url(#lmF)" style="mix-blend-mode:screen"/>`).join('')}</svg>`;
}

export function startLite({ lenis, chrome, reduce }) {
  const L = $('#lite');
  L.hidden = false;
  const half = MARQUEE.map(w => `<span>${w}</span><i aria-hidden="true">+</i>`).join('');
  L.innerHTML = `
  <section class="l-sec l-hero" aria-label="Introduction">
    <div class="l-mark"><div class="glow"></div>${markArt()}</div>
    <h1 class="l-h1 rv" aria-label="Designed to grow your business"><span aria-hidden="true">${HERO.line1}<br>${HERO.fixed}<span class="l-word" id="lWord"></span></span></h1>
    <div class="l-btns rv"><a class="btn roll" href="${CONTACT.contactUrl}"><span data-t="Discuss your project"></span><b>→</b></a><a class="btn roll callBtn" href="tel:${CONTACT.tel}"><span data-t="Book a free call"></span><b>→</b></a></div>
    <div class="l-meta rv">
      <div class="box2"><div class="c1"><span class="cap13">${HERO.est}</span></div><div class="cap13">${HERO.years}</div></div>
      <p class="p18">${HERO.blurb}</p>
    </div>
    <div class="cap l-hold rv">${HERO.hold}<br>${HERO.dare}</div>
  </section>
  <section class="l-sec l-about" aria-label="About">
    <div class="cap rv">About</div>
    <p class="h89 l-big" id="lAbout"></p>
    <div class="l-cols">
      <div class="cap lh17 rv">${ABOUT.left}</div>
      <div class="rv"><p class="p18">${ABOUT.mission}</p><a class="btn roll" href="${SITE}/about"><span data-t="More about us"></span><b>→</b></a></div>
    </div>
    <div class="cap lh17 l-focus rv">${ABOUT.focus}</div>
  </section>
  <div class="l-mq" aria-label="Design. Develop. Deliver."><div class="l-mq-in" aria-hidden="true">${half}${half}${half}${half}</div></div>
  <section class="l-sec l-light" aria-label="Key facts">
    <h2 class="h89 rv">Key facts</h2>
    <p class="p17 rv">A snapshot of our<br>experience and impact.</p>
    <div class="l-cards">${factCardsHTML(false)}</div>
    <div class="cap rv" style="margin-top:64px;color:#272727">Our clients</div>
    <div class="l-partners rv">${CLIENTS.map(c => `<span style="${c[1]}">${c[0]}</span>`).join('')}</div>
  </section>
  <section class="l-sec l-work" aria-label="Selected work">
    <h2 class="h89 rv">Selected work<br>&amp; explorations</h2>
    <a class="btn roll rv" href="${SITE}/projects"><span data-t="View all projects"></span><b>→</b></a>
    <div class="l-wtrack">${WORK.map(w => workCardHTML(w)).join('')}</div>
  </section>
  <section class="l-sec l-svc" aria-label="Our services">
    <div class="cap center rv">Our services</div>
    <h2 class="l-svwords rv">${SERVICES_WORDS.join('<br>')}</h2>
    <div class="l-labs">${labsHTML()}</div>
    <a class="btn roll rv" href="${SITE}/services"><span data-t="View services"></span><b>→</b></a>
  </section>
  <section class="l-sec l-testi" aria-label="Client testimonials" id="lTesti"></section>
  <section class="l-sec l-dim" aria-label="Design in motion">
    <h2 class="rv">Design<br>in motion</h2>
    <p class="cap rv" style="margin-top:22px">Exploring ideas through<br>daily design practice.</p>
    <div class="l-grid" id="lGrid"></div>
    <p class="p17 rv">Concepts, campaigns and interface designs crafted for our clients.</p>
    <a class="btn roll rv" href="${SITE}/projects"><span data-t="View portfolio"></span><b>→</b></a>
  </section>`;

  mountTestimonials($('#lTesti'), false);
  const grid = $('#lGrid');
  RIBBON.slice(0, 6).forEach(r => { const c = ribbonCard(r); c.classList.add('rv'); grid.appendChild(c); });
  // typographic cards are designed at 380×260: scale them to the grid cell
  new ResizeObserver(() => { const c = grid.firstElementChild; if (c) grid.style.setProperty('--k', (c.clientWidth / 380).toFixed(4)); }).observe(grid);
  $$('.l-cards .kcard, .l-labs .lab, .l-wtrack .wcard, #lTesti > *').forEach(e => e.classList.add('rv'));
  initRoll(L);

  /* hero word cycle: letters blur out, the next word blurs in */
  const wordEl = $('#lWord');
  let wi = 0;
  const setWord = w => { wordEl.innerHTML = [...w].map(ch => `<span style="transition-delay:${(Math.random() * .3).toFixed(2)}s">${ch}</span>`).join(''); };
  setWord(HERO.words[0]);
  if (!reduce) setInterval(() => {
    wordEl.classList.add('out');
    setTimeout(() => { wi = (wi + 1) % HERO.words.length; setWord(HERO.words[wi]); void wordEl.offsetWidth; wordEl.classList.remove('out'); }, 620);
  }, 3400);

  /* about: words light up as the paragraph scrolls through the viewport */
  const aboutEl = $('#lAbout'), aboutWords = words(aboutEl, ABOUT.text);

  /* odometers count when their card is revealed */
  const odos = $$('.l-cards .odo').map((e, i) => ({ ...odometer(e, FACTS[i].value, FACTS[i].suffix), card: e.closest('.kcard'), t0: null }));

  /* reveals start once the loader has opened */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  const startReveals = () => $$('.rv', L).forEach(e => io.observe(e));

  /* header colour over light sections */
  const lightSecs = $$('.l-light, .l-work, .l-testi, .l-dim', L);
  let navLt = null;

  const loader = makeLoader();
  let t0 = performance.now(), revealed = false;
  if (reduce) { loader.skip(); startReveals(); revealed = true; } else chrome.lock(true);

  const frame = now => {
    lenis.raf(now);
    const T = (now - t0) / 1000;
    if (!revealed && loader.frame(T)) { revealed = true; chrome.lock(false); startReveals(); }
    const H = innerHeight;
    // about colour reveal
    const r = aboutEl.getBoundingClientRect(), p = clamp((H * .85 - r.top) / (r.height + H * .25));
    const n = aboutWords.length;
    aboutWords.forEach((w, i) => { const q = clamp(p * n * 1.15 - i); w.style.color = `rgba(216,216,216,${(.1 + .9 * q).toFixed(3)})`; });
    // odometers
    for (const o of odos) {
      if (o.t0 == null) { if (o.card.classList.contains('in')) o.t0 = T; else continue; }
      const lt = T - o.t0;
      o.cols.forEach((c, j) => { c.style.transform = `translateY(${(-(10 + o.ds[j]) * eout(seg(lt, .3 + j * .12, 1.8 + j * .12)) * 46.875).toFixed(2)}px)`; });
    }
    // header
    const lt = lightSecs.some(s => { const b = s.getBoundingClientRect(); return b.top < 44 && b.bottom > 44; });
    if (lt !== navLt) { navLt = lt; chrome.nav.classList.toggle('lt', lt); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
