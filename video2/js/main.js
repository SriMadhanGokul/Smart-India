// Timeline for the whole 76s video. render(t) is a pure function of time: DOM layers for the site UI,
// WebGL for the S logo, glass type, stone and storm.
import * as THREE from 'three';
import { clamp, lerp, seg, eio, eout, bump, kf, curve, rnd, reseed } from './util.js';
import { MARK, markSVG, HERO, ABOUT, MARQUEE, LOADER_LABELS, FACTS, CLIENTS, WORK, SERVICES_WORDS, SERVICES, TESTIMONIAL, RIBBON } from './content.js';
import { renderer, renderLayers, PX, W, H } from './gl.js';
import { GlassText } from './glass.js';
import { makeHero } from './hero.js';
import { makeServices } from './services.js';
import { flashAt } from './storm.js';

const $ = s => document.querySelector(s);
const DURATION = 76;
await document.fonts.ready;
await Promise.all(['400 300px "Familjen Grotesk"', '500 100px "Familjen Grotesk"', '400 20px "Martian Mono"', '400 20px Inter'].map(f => document.fonts.load(f)));

/* ---------------- helpers ---------------- */
reseed(11);
function letters(el, text) {
  el.innerHTML = '';
  return [...text].map(ch => { const s = document.createElement('span'); s.className = 'hw'; s.textContent = ch; s.dataset.d = rnd(); el.appendChild(s); return s; });
}
function letterIn(arr, t, t0, spread = .9, dur = .55, out = null) {
  arr.forEach(s => {
    const d = +s.dataset.d;
    let p = eout(seg(t, t0 + d * spread, t0 + d * spread + dur));
    if (out) p *= 1 - eout(seg(t, out + d * .45, out + d * .45 + .4));
    s.style.opacity = p; s.style.filter = p < 1 ? `blur(${(1 - p) * 16}px)` : 'none';
  });
}
function odometer(el, value, suffix) {
  const ds = String(value).split('').map(Number);
  el.innerHTML = ds.map(() => `<span class="col">${Array.from({ length: 20 }, (_, k) => `<span>${k % 10}</span>`).join('')}</span>`).join('') + (suffix ? `<sup>${suffix}</sup>` : '');
  return { cols: [...el.querySelectorAll('.col')], ds };
}
const setMask = (el, m) => { el.style.maskImage = m; el.style.webkitMaskImage = m; };

/* ---------------- five-slat wipes (measured from the reference) ---------------- */
const SLAT = H / 5;
function blinds(t, { S, D, P }) {
  const st = []; let done = true, any = false, top = 0;
  for (let k = 0; k < 5; k++) {
    const y0 = k * SLAT, y1 = y0 + SLAT, x = seg(t, S[k], S[k] + D[k]), f = SLAT * (1 - Math.pow(1 - x, P[k]));
    if (x < 1) done = false; if (x > 0) any = true; if (k === 0) top = f;
    st.push(`transparent ${y0}px`, `transparent ${y1 - f}px`, `#000 ${y1 - f}px`, `#000 ${y1}px`);
  }
  return { mask: `linear-gradient(to bottom,${st.join(',')})`, done, any, top };
}
const BL1 = { S: [30.38, 29.62, 29.0, 28.68, 28.45], D: [3.6, 3.8, 3.2, 2.6, 1.95], P: [1.3, 1.3, 1.3, 1.4, 1.4] };
const BL2 = { S: [67.34, 67.21, 67.14, 67.01, 66.886], D: [.55, .55, .55, .55, .55], P: [1.4, 1.4, 1.4, 1.4, 1.4] };

/* ---------------- scroll timelines ---------------- */
const DARK = curve([[18.85, 0], [19.5, 300], [20.0, 380], [21, 500], [22.25, 690], [23, 760], [23.75, 850], [24.25, 950], [25, 1060], [26, 1180], [26.6, 1290], [27, 1430], [27.5, 1640], [28, 1728]]);
const LIGHT = [[30.4, -1146], [33.0, -412], [33.3, -401], [35.3, -80], [36.6, -80], [38.6, 768], [40.4, 1116]];
// horizontal scroll measured from the reference (it moves in wheel-like bursts)
const WORK_X = curve([[40.4, 0], [40.8, -60], [41.0, -169], [41.2, -269], [41.6, -365], [42.0, -597], [42.4, -763], [42.8, -907], [43.2, -1079],
  [44.0, -1339], [44.5, -1747], [44.8, -2115], [45.4, -2423], [46.5, -2875], [47.9, -3810]]);
const LD_W = curve([[4.05, 260], [4.25, 504], [4.4, 620], [4.5, 1100], [4.62, 1500], [4.75, 1920]]);
const LD_H = curve([[4.05, 260], [4.25, 348], [4.4, 390], [4.5, 600], [4.62, 760], [4.75, 868]]);
const LD_G = curve([[4.0, 214], [4.25, 170], [4.5, 68], [4.75, 4]]);

/* ---------------- DOM: nav + loader ---------------- */
$('#navLogo').innerHTML = `<span id="navMark" style="display:flex">${markSVG(26, 'currentColor')}</span><span>SMARTINDIA</span><sup style="font-size:9px;font-weight:400;margin-left:-4px">®</sup>`;
$('#ldLbl').innerHTML = LOADER_LABELS.join(' &nbsp;·&nbsp; ');
{
  const s = 56, o = 130, d = p => 'M' + p.map(([x, y]) => `${(o + x * s).toFixed(1)} ${(o - y * s).toFixed(1)}`).join(' L') + ' Z';
  $('#ldMark').innerHTML = `<svg width="260" height="260" viewBox="0 0 260 260"><defs>
    <pattern id="stp" width="260" height="7" patternUnits="userSpaceOnUse"><rect width="260" height="3.4" fill="#fff"/></pattern>
    ${MARK.map((_, i) => `<mask id="m${i}"><rect id="mr${i}" x="0" y="0" width="260" height="0" fill="url(#stp)"/><rect id="ms${i}" x="0" y="0" width="260" height="0" fill="#fff"/></mask>`).join('')}</defs>
    ${MARK.map((p, i) => `<path class="ldO" d="${d(p)}" fill="none" stroke="#9a9a9a" stroke-width="1" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
      <path class="ldF" d="${d(p)}" fill="#3d3d3d" mask="url(#m${i})"/>`).join('')}</svg>`;
}

/* ---------------- DOM: hero + about + marquee ---------------- */
const hl1 = letters($('#hl1'), HERO.line1), hlFix = letters($('#hlFix'), HERO.fixed);
const wordSpans = HERO.words.map(w => { const sp = document.createElement('span'); $('#wordBox').appendChild(sp); return letters(sp, w); });
$('#heroEst').innerHTML = HERO.est; $('#heroYears').innerHTML = HERO.years; $('#heroBlurb').innerHTML = HERO.blurb;
$('#heroHold').innerHTML = HERO.hold; $('#heroDare').innerHTML = HERO.dare;
const aboutWords = ABOUT.text.split(' ').map(w => { const s = document.createElement('span'); s.textContent = w + ' '; $('#aboutTxt').appendChild(s); return s; });
$('#aboutLeft').innerHTML = ABOUT.left; $('#aboutMission').innerHTML = ABOUT.mission; $('#aboutFocus').innerHTML = ABOUT.focus;
const mqSpans = [];
for (let r = 0; r < 3; r++) MARQUEE.forEach(w => {
  for (const ch of w) { const s = document.createElement('span'); s.textContent = ch; $('#mq').appendChild(s); mqSpans.push(s); }
  const i = document.createElement('i'); i.textContent = '+'; $('#mq').appendChild(i);
});

/* ---------------- DOM: key facts, clients, selected work ---------------- */
const kfTitle = letters($('#kfTitle'), 'Key facts');
const odos = [];
const ring = c => `<svg width="22" height="18" viewBox="0 0 22 18"><path d="M11 1 L13.5 7 L20 7.3 L15 11.4 L16.8 17.5 L11 14 L5.2 17.5 L7 11.4 L2 7.3 L8.5 7 Z" fill="none" stroke="${c}" stroke-width="1.2"/></svg>`;
$('#kwrap').innerHTML = FACTS.map((f, i) => {
  const left = [370, 766, 1160][i];
  if (i === 0) return `<div class="kcard" style="left:${left}px"><img src="assets/${f.img}" style="inset:0;width:100%;height:100%"><div class="sh"></div>
    <div class="a cap" style="left:20px;top:22px">${f.label}</div><div class="a" style="left:20px;bottom:72px">${ring('#d8d8d8')}</div>
    <div class="a p17" style="left:20px;bottom:22px;width:190px">${f.text}</div><div class="a odo" style="right:20px;bottom:18px"></div></div>`;
  if (i === 1) return `<div class="kcard" style="left:${left}px;background:#e2e2e2;color:#434343">
    <div class="a cap" style="left:0;width:100%;top:22px;text-align:center">${f.label}</div>
    <div class="a" style="left:91px;top:122px;width:190px;height:190px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 40px rgba(0,0,0,.05)"><div class="odo"></div></div>
    <div class="a p17" style="left:0;width:100%;bottom:22px;text-align:center">${f.text}</div></div>`;
  return `<div class="kcard" style="left:${left}px;background:#3c3c3c"><div class="a cap" style="right:20px;top:22px">${f.label}</div>
    <img src="assets/${f.img}" style="left:30px;top:62px;width:312px;height:270px;filter:grayscale(.15)">
    <div class="a p17" style="left:20px;bottom:22px;color:rgba(216,216,216,.6)">${f.text}</div><div class="a odo" style="right:20px;bottom:18px"></div></div>`;
}).join('');
[...document.querySelectorAll('#kwrap .odo')].forEach((el, i) => odos.push({ ...odometer(el, FACTS[i].value, FACTS[i].suffix), t0: 33.3 + i * .3 }));
const cards = [...document.querySelectorAll('#kwrap .kcard')];
$('#partners').innerHTML = CLIENTS.map(c => `<span style="${c[1]}">${c[0]}</span>`).join('<span style="width:1px;height:24px;background:rgba(0,0,0,.14)"></span>');
{
  const T = $('#wtrack');
  T.innerHTML = `<div class="a" style="left:0;top:0;width:952px;height:868px;background:linear-gradient(90deg,#f1f1f1,#e5e5e5);border-right:1px solid rgba(0,0,0,.08)">
      <div class="a h89" id="wkTitle" style="left:0;width:952px;top:380px;text-align:center;font-weight:500;color:#434343"></div>
      <div class="a" style="left:0;width:952px;top:578px;display:flex;justify-content:center;color:#434343"><span class="btn" style="width:190px">View all projects <b>→</b></span></div></div>`
    + WORK.map((w, k) => `<div class="wcard" style="left:${1027 + k * 952}px"><div class="wimg"><img src="assets/${w.img}"><div class="fr"></div><b>${w.overlay}</b></div>
      <div class="h34" style="margin-top:42px;color:#434343">${w.title}</div><div class="p17" style="width:300px;margin-top:16px;color:#434343">${w.text}</div>
      <div class="a" style="right:0;top:640px;color:#434343"><span class="btn" style="width:180px">Explore project <b>→</b></span></div></div>`).join('')
    + [952, 1904, 2856, 3735].map(x => `<div class="a" style="left:${x}px;top:0;width:1px;height:868px;background:rgba(0,0,0,.07)"></div>`).join('')
    + `<div class="a" style="left:3810px;top:0;width:950px;height:868px;background:linear-gradient(90deg,#f3f3f3,#e4e4e4)">
      <div class="a h34" style="left:257px;width:435px;top:392px;text-align:center;color:#434343">Discover our complete collection of digital experiences, brands, and platforms.</div>
      <div class="a" style="left:0;width:950px;top:542px;display:flex;justify-content:center;color:#434343"><span class="btn" style="width:190px">View all projects <b>→</b></span></div></div>`;
}
const wcards = [...document.querySelectorAll('#wtrack .wcard')];
wcards.forEach(c => { c.style.transformOrigin = '50% 40%'; });
// gently damped spring (≈2–3% overshoot, no bounce), normalised so spring(1) === 1
const spring = p => (1 - Math.exp(-5.5 * p) * Math.cos(5 * p)) / (1 - Math.exp(-5.5) * Math.cos(5));
const wkTitle = $('#wkTitle'), wkL1 = document.createElement('div'), wkL2 = document.createElement('div');
wkTitle.append(wkL1, wkL2);
const wkLetters = [...letters(wkL1, 'Selected work'), ...letters(wkL2, '& explorations')];

/* ---------------- DOM: services ---------------- */
const svSpans = [];
$('#svWrap').innerHTML = '';
for (const w of SERVICES_WORDS) {
  const line = document.createElement('div'); line.className = 'sv';
  for (const ch of w) { const s = document.createElement('span'); s.textContent = ch; line.appendChild(s); svSpans.push(s); }
  $('#svWrap').appendChild(line);
}
$('#svcB1').innerHTML = '<span id="b1a">✦ Designed with intent. Built to grow.</span><span id="b1b" style="position:absolute;left:0;width:100%">✦ Different services. One standard of craft.</span>';
const ICON = {
  rings: '<circle cx="40" cy="40" r="36"/><circle cx="40" cy="40" r="27"/><circle cx="40" cy="40" r="18"/><circle cx="40" cy="40" r="9"/>',
  squares: '<rect x="4" y="4" width="72" height="72"/><rect x="14" y="14" width="52" height="52"/><rect x="24" y="24" width="32" height="32"/><rect x="34" y="34" width="12" height="12"/>',
  phone: '<rect x="20" y="4" width="40" height="72" rx="8"/><rect x="27" y="12" width="26" height="52" rx="3"/><circle cx="40" cy="69" r="2.5"/>',
  bars: '<line x1="12" y1="70" x2="12" y2="48"/><line x1="26" y1="70" x2="26" y2="36"/><line x1="40" y1="70" x2="40" y2="24"/><line x1="54" y1="70" x2="54" y2="40"/><line x1="68" y1="70" x2="68" y2="10"/>',
  target: '<circle cx="40" cy="40" r="34"/><circle cx="40" cy="40" r="20"/><circle cx="40" cy="40" r="6"/><line x1="40" y1="0" x2="40" y2="80"/><line x1="0" y1="40" x2="80" y2="40"/>',
  spiral: '<path d="M40 40 m0 -6 a6 6 0 1 1 -6 6 a12 12 0 1 1 12 12 a18 18 0 1 1 -18 -18 a24 24 0 1 1 24 24 a30 30 0 1 1 -30 -30"/>',
};
const labEls = SERVICES.map(([h, p, ic]) => {
  const d = document.createElement('div'); d.className = 'lab';
  d.innerHTML = `<h5>${h}</h5><svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.3">${ICON[ic]}</svg><p class="p17">${p}</p>`;
  $('#labs').appendChild(d); return d;
});

/* ---------------- DOM: testimonial glimpse ---------------- */
$('#trPage').innerHTML += `
  <div class="a" style="left:200px;top:560px;display:flex;gap:90px;filter:blur(7px);opacity:.45;font-size:30px;font-weight:700;color:#444"><span>FashionNova</span><span>TechSolutions</span><span>GreenGrocer</span></div>
  <div class="a" style="left:674px;top:686px;width:556px;height:1px;background:rgba(0,0,0,.12)"></div><div class="a" style="left:944px;top:674px;font-size:18px;color:#777">×</div>
  ${TESTIMONIAL.clients.map((c, i) => `<div class="a cap" style="left:192px;top:${774 + i * 32}px;color:${i === TESTIMONIAL.active ? '#434343' : '#aaa'}">${c}${i === TESTIMONIAL.active ? ' &nbsp;→' : ''}</div>`).join('')}
  <div class="a h34" id="trQ" style="left:964px;top:774px;width:749px">${TESTIMONIAL.quote}</div>
  <div class="a" style="left:964px;top:930px;display:flex;gap:12px;align-items:center"><img src="assets/${TESTIMONIAL.img}" style="width:40px;height:40px;object-fit:cover"><div class="p17"><b style="font-weight:500">${TESTIMONIAL.name}</b><br><span style="color:#777">${TESTIMONIAL.role}</span></div></div>
  <div class="a" style="left:190px;top:1022px;width:150px;height:74px;display:flex;border:1px solid rgba(0,0,0,.18)"><div style="flex:1;display:flex;align-items:center;justify-content:center;border-right:1px solid rgba(0,0,0,.18)">←</div><div style="flex:1;display:flex;align-items:center;justify-content:center">→</div></div>
  <div class="a" style="left:964px;top:1066px"><span class="btn" style="width:180px">Become a client <b>→</b></span></div>
  <div class="a" style="left:38px;top:1242px;width:1844px;height:1px;background:rgba(0,0,0,.12)"></div><div class="a" style="left:946px;top:1231px;font-size:18px;color:#777">+</div>`;

/* ---------------- DOM: design in motion ---------------- */
const dimAL = letters($('#dimA'), 'Design in'), dimBL = letters($('#dimB'), 'motion');
const ribEls = RIBBON.map(r => {
  const d = document.createElement('div'); d.className = 'rc';
  if (r.startsWith('T:')) {
    const w = r.slice(2);
    d.innerHTML = w === '2026' ? `<div style="padding:18px;height:100%;background:#f4f4f2;color:#111"><div style="font-family:'Martian Mono';font-size:9px">SMARTINDIA — NEW WORK</div><div style="font-size:120px;font-weight:600;letter-spacing:-.06em;line-height:1;margin-top:60px">2026</div></div>`
      : w === 'SMART®' ? `<div style="padding:20px;height:100%;background:linear-gradient(135deg,#2a1b14,#4a2a1c);color:#fff"><div style="font-size:76px;font-weight:800;letter-spacing:-.06em;margin-top:70px">SMART®</div><div style="font-family:'Martian Mono';font-size:9px;margin-top:6px">BRAND THAT DEFINES GROWTH</div></div>`
      : w === 'DESIGN' ? `<div style="padding:20px;height:100%;background:linear-gradient(135deg,#e8a4c9,#c45d9a);color:#fff"><div style="font-size:52px;font-weight:700;letter-spacing:-.06em;line-height:.9;margin-top:60px">DESIGN.<br>DEVELOP.<br>DELIVER.</div></div>`
      : w === 'SEARCH' ? `<div style="padding:20px;height:100%;background:#eef1ea;color:#1d2a1a"><div style="font-family:'Martian Mono';font-size:9px">SEO — LOCAL &amp; ORGANIC</div><div style="font-size:64px;font-weight:700;letter-spacing:-.06em;line-height:.9;margin-top:56px">Search<br>first.</div></div>`
      : w === 'CONVERT' ? `<div style="padding:20px;height:100%;background:linear-gradient(135deg,#14213d,#2b3f73);color:#fff"><div style="font-family:'Martian Mono';font-size:9px">WEB &amp; APP STUDIO</div><div style="font-size:54px;font-weight:600;letter-spacing:-.06em;line-height:.92;margin-top:58px">Built to<br>convert.</div></div>`
      : `<div style="padding:20px;height:100%;background:#ff6b1e;color:#111"><div style="font-family:'Martian Mono';font-size:9px">SMARTINDIA.DIGITAL</div><div style="font-size:58px;font-weight:800;letter-spacing:-.06em;line-height:.9;margin-top:60px">Made in<br>Tirupur.</div></div>`;
  } else d.innerHTML = `<img src="assets/${r}"${r.endsWith('.png') ? ' style="background:#000"' : ''}>`;
  $('#ribIn').appendChild(d); return d;
});
const RIB_GRID = [[-385, -143], [1, -143], [386, -143], [-385, 138], [1, 136], [448, 176]];
const D2R = Math.PI / 180, RING_R = 1500;
const _ring = new THREE.Matrix4(), _card = new THREE.Matrix4(), _tr = new THREE.Matrix4(), _sc = new THREE.Matrix4(), _cp = new THREE.Vector3(), _cq = new THREE.Quaternion(), _ce = new THREE.Euler(),
  _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _gp = new THREE.Vector3(), _id = new THREE.Quaternion(), _one = new THREE.Vector3(1, 1, 1);

const inEls = [...document.querySelectorAll('[data-in]')];
await Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; })));

/* ---------------- WebGL objects ---------------- */
const hero = makeHero();
const svc = makeServices();
const glassMarquee = new GlassText(mqSpans, { family: 'Familjen Grotesk', fontPx: 150, refr: .022, frost: 8, ghost: .55, body: .34 });
const glassWords = new GlassText(svSpans, { family: 'Familjen Grotesk', fontPx: 150, refr: .026, frost: 9, ghost: .6, body: .36 });

// letters fly apart when the stone hits the words (direction away from the impact point)
reseed(404);
const IMPACT = [906, 321];
// a few letters fly down past the camera and loom huge, like the reference's giant V and T
const fly = svSpans.map(() => { const big = rnd() < .16; return { a: rnd() * 6.283, sp: .6 + rnd() * .9, big, vz: big ? 9 + rnd() * 1.8 : rnd() * 3 - .5, rx: (rnd() - .5) * (big ? 1.6 : 7), ry: (rnd() - .5) * (big ? 1.6 : 7), rz: (rnd() - .5) * 3, d: rnd() * .35 }; });
let curT = 0;
const wordFx = (i, L) => {
  const f = fly[i], s = seg(curT, 58.45 + f.d * .5, 61.6 + f.d);
  if (s <= 0) return null;
  const p = 1 - Math.pow(1 - s, 1.7);
  let dx = L.base.cx - IMPACT[0], dy = L.base.cy - IMPACT[1];
  const l = Math.hypot(dx, dy) || 1; dx = dx / l * .75 + Math.cos(f.a) * .25; dy = dy / l * .75 + Math.sin(f.a) * .25;
  const dist = (380 + 700 * f.sp) * p / PX(0);
  if (f.big) return { dx: dx * dist * .3, dy: -1.0 * p, dz: f.vz * p, rx: f.rx * p, ry: f.ry * p, rz: f.rz * p, op: (1 - seg(curT, 60.9 + f.d, 61.5 + f.d)) * .85 };
  return { dx: dx * dist, dy: -dy * dist - p * p * .6, dz: f.vz * p, rx: f.rx * p, ry: f.ry * p, rz: f.rz * p, op: 1 - seg(curT, 60.6 + f.d, 61.6 + f.d) };
};

/* ---------------- master render ---------------- */
function render(t) {
  curT = t;
  const dS = DARK(t), lS = kf(t, LIGHT);
  const B1 = blinds(t, BL1), B2 = blinds(t, BL2);
  const showDark = !B1.done, showLight = B1.any && t < 49.4, showSvc = t > 47.9 && !B2.done, showTrans = B2.any && t < 68.1, showDim = t > 67.95;

  /* loader */
  const ld = $('#loader'); ld.style.display = t < 5.05 ? 'block' : 'none';
  if (t < 5.05) {
    const spread = eio(seg(t, .55, 1.35)), grow = eio(seg(t, 1.2, 1.8)), e2 = seg(t, 4.05, 4.75);
    const w = t < 4.05 ? lerp(196, 260, grow) : LD_W(t), h = t < 4.05 ? w : LD_H(t), cy = lerp(400, 434, e2);
    const bx = $('#ldBox'); bx.style.left = (960 - w / 2) + 'px'; bx.style.top = (cy - h / 2) + 'px'; bx.style.width = w + 'px'; bx.style.height = h + 'px';
    $('#ldFrame').setAttribute('width', w); $('#ldFrame').setAttribute('height', h);
    $('#ldFaint').setAttribute('width', w); $('#ldFaint').setAttribute('height', h);
    $('#ldFaint').style.opacity = seg(t, 1.2, 1.6) * (1 - seg(t, 3.95, 4.1));
    $('#ldTop').setAttribute('d', `M0 0 H${w}`); $('#ldRight').setAttribute('d', `M${w} 0 V${h}`); $('#ldTick').setAttribute('d', `M0 ${h - 24} V${h}`);
    $('#ldTop').setAttribute('stroke-dashoffset', 1 - eio(seg(t, 2.0, 2.3))); $('#ldRight').setAttribute('stroke-dashoffset', 1 - eio(seg(t, 2.3, 2.5)));
    const fo = 1 - seg(t, 3.95, 4.1);
    $('#ldTop').style.opacity = fo; $('#ldRight').style.opacity = fo; $('#ldTick').setAttribute('opacity', seg(t, 2.8, 2.9) * fo);
    // crosses: cluster at the centre, spread to the corners, flip + -> × -> +
    const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    const rot = 45 * (eio(seg(t, 2.4, 2.6)) - eio(seg(t, 3.4, 3.6)));
    corners.forEach(([sx, sy], i) => {
      const x = $('#x' + i), off = lerp(i % 2 ? 86 : -86, sx * (w / 2 + 14), spread), oy = lerp(-3 + sy * 3, sy * (h / 2 + 14), spread);
      x.style.left = (960 + off) + 'px'; x.style.top = (cy + oy) + 'px';
      x.style.opacity = seg(t, .25, .5) * (1 - seg(t, 4.6, 4.9)); x.style.transform = `rotate(${rot}deg)`;
    });
    // logo: outline draws, then striped glitch fill per piece
    document.querySelectorAll('.ldO').forEach((p, i) => { p.setAttribute('stroke-dashoffset', 1 - eio(seg(t, 1.3 + i * .18, 2.0 + i * .18))); p.style.opacity = 1 - seg(t, 2.9, 3.2); });
    const fill = [[2.25, 2.75], [2.6, 3.0], [2.35, 2.85]];
    fill.forEach(([a, b], i) => { const p = seg(t, a, b); $('#mr' + i).setAttribute('height', 260 * p); $('#ms' + i).setAttribute('height', 260 * seg(t, b - .05, b + .15)); });
    const ex = eio(seg(t, 4.15, 4.9));
    $('#ldMark').style.left = (w / 2 - 130) + 'px'; $('#ldMark').style.top = (h / 2 - 130) + 'px';
    $('#ldMark').style.opacity = 1 - seg(t, 4.55, 4.9);
    document.querySelectorAll('.ldF').forEach((p, i) => { const d = [[-1, 1], [0, 0], [1, -1]][i]; p.setAttribute('transform', `translate(${d[0] * ex * 34},${-d[1] * ex * 34}) rotate(${(i - 1) * ex * 14} 130 130)`); });
    const fillOn = seg(t, 3.9, 4.05), g = Math.round(LD_G(t));
    $('#ldFill').style.opacity = fillOn; $('#ldFill').style.background = `rgb(${g},${g},${g})`;
    $('#ldLbl').style.opacity = seg(t, 1.9, 2.3) * (1 - seg(t, 3.95, 4.15));
    $('#ldNum').style.opacity = seg(t, .6, 1) * (1 - seg(t, 3.95, 4.15));
    reseed(Math.floor(t * 30));
    const num = Math.round(eio(seg(t, .6, 3.6)) * 100);
    $('#ldNum').textContent = t < 3.6 ? String(Math.min(999, num + Math.floor(rnd() * 9))).padStart(3, '0') : '100';
  }

  /* layers */
  $('#dark').style.display = showDark ? 'block' : 'none';
  $('#light').style.display = showLight ? 'block' : 'none'; setMask($('#light'), B1.done ? 'none' : B1.mask);
  $('#svc').style.display = showSvc ? 'block' : 'none'; $('#svText').style.display = showSvc ? 'block' : 'none';
  $('#trans').style.display = showTrans ? 'block' : 'none'; setMask($('#trans'), B2.done ? 'none' : B2.mask);
  $('#dim').style.display = showDim ? 'block' : 'none';

  for (const el of inEls) { const a = +el.dataset.in, e = eout(seg(t, a, a + .8)); el.style.opacity = e; el.style.transform = `translateY(${(1 - e) * 24}px)`; el.style.filter = e < 1 ? `blur(${(1 - e) * 6}px)` : 'none'; }

  /* dark page */
  if (showDark) {
    $('#darkPage').style.transform = `translateY(${-dS}px)`;
    letterIn(hl1, t, 7.25); letterIn(hlFix, t, 7.4);
    wordSpans.forEach((arr, k) => { const [ti, to] = HERO.times[k]; letterIn(arr, t, ti, .6, .5, to); });
    const rv = seg(t, 19.8, 23.6);
    aboutWords.forEach((w, i) => { const p = clamp(rv * aboutWords.length * 1.12 - i); w.style.color = `rgba(216,216,216,${.1 + .9 * p})`; });
    $('#mq').style.transform = `translateX(${-60 - (t - 24) * 52}px)`;
    const fl = bump(t, 5.6, 7.75, .3), fx = seg(t, 5.6, 7.75);
    $('#flare').style.opacity = fl; $('#flare').style.left = lerp(1620, 1350, fx) + 'px'; $('#flare').style.top = '120px';
  }

  /* light page */
  if (showLight) {
    $('#lightPage').style.transform = `translateY(${-lS}px)`;
    letterIn(kfTitle, t, 31.85, .7, .5);
    cards.forEach((c, i) => {
      const p = eio(seg(t, 32.6 + i * .45, 35.0 + i * .45)), fin = [[0, 0], [0, 0], [-14, 4]][i];
      c.style.opacity = seg(t, 32.5 + i * .45, 33.3 + i * .45);
      c.style.transform = `translateY(${(1 - p) * 40}px) rotateX(${lerp(74, fin[1], p)}deg) rotateY(${lerp(i === 0 ? -10 : i === 2 ? 10 : 0, fin[0], p)}deg) rotateZ(${lerp(i === 0 ? -3 : i === 2 ? 3 : 0, 0, p)}deg)`;
    });
    odos.forEach(o => o.cols.forEach((c, j) => { const e = eout(seg(t, o.t0 + j * .12, o.t0 + j * .12 + 1.5)); c.style.transform = `translateY(${-(10 + o.ds[j]) * e * 46.875}px)`; }));
    letterIn(wkLetters, t, 39.0, .8, .55);
    const hx = WORK_X(t);
    $('#wtrack').style.transform = `translateX(${hx}px)`;
    // card entrance, driven by each card's own screen position (so they follow the scroll one by one):
    // rise from the bottom along the reference's measured curve, then spring from 0.8 to full size
    wcards.forEach((c, k) => {
      const x = 1027 + k * 952 + hx + (k === 0 ? (1 - eio(seg(t, 38.2, 40.6))) * 900 : 0);
      const rise = x > 1810 ? 1 : Math.exp(-(1810 - x) / 280);
      const s = lerp(.8, 1, spring(clamp((1320 - x) / 470)));
      c.style.transform = `translateY(${rise * 500}px) scale(${s})`;
    });
    const uOn = t > 41.2 && t < 46.6;
    $('#url').style.display = uOn ? 'block' : 'none'; $('#url').textContent = 'https://smartindia.digital/projects/details';
  }

  /* services */
  if (showSvc) {
    const pl = lerp(1920, 0, eio(seg(t, 47.9, 49.3)));
    $('#svc').style.clipPath = `inset(0 0 0 ${pl}px)`; $('#svText').style.clipPath = `inset(0 0 0 ${pl}px)`;
    const g1 = seg(t, 49.9, 50.6), g2 = seg(t, 50.5, 51.3), gv = Math.round(lerp(255, 200, g1));
    $('#svc').style.background = `rgba(${gv},${gv},${gv},${1 - g2})`;
    const tc = Math.round(lerp(17, 200, seg(t, 50.95, 51.2))), domA = 1 - seg(t, 51.15, 51.5);
    svSpans.forEach(s => { s.style.color = `rgba(${tc},${tc},${tc},${domA})`; });
    const light = tc > 120;
    for (const id of ['#svcLbl', '#svcB1', '#svcB2']) $(id).style.color = light ? '#d8d8d8' : '#111';
    const sw = seg(t, 51.6, 52.4);
    $('#b1a').style.opacity = 1 - sw; $('#b1a').style.filter = `blur(${sw * 6}px)`; $('#b1b').style.opacity = sw; $('#b1b').style.filter = `blur(${(1 - sw) * 6}px)`;
    // two lanes beside the stone (never over it): left lane rises, right lane descends, ~4 labels on screen
    labEls.forEach((el, i) => {
      const lane = i % 2, s = 62.4 + i * .5, p = (t - s) / 2.0;
      const x = lane ? 1590 : 330, y = lane ? lerp(150, 700, p) : lerp(700, 150, p);
      const on = p <= 0 || p >= 1 ? 0 : Math.min(eout(seg(p, 0, .16)), 1 - eout(seg(p, .84, 1))) * (1 - seg(t, 66.0, 66.45));
      el.style.transform = `translate3d(${x - 230}px,${y - 125}px,0) rotateX(${(lane ? -1 : 1) * (p - .5) * 10}deg)`;
      el.style.opacity = on;
    });
  }

  /* testimonial glimpse */
  if (showTrans) { $('#trPage').style.transform = `translateY(${-kf(t, [[67.45, 0], [67.95, 940]])}px)`; $('#trQ').style.opacity = 1 - seg(t, 67.6, 67.8); }

  /* design in motion */
  if (showDim) {
    const u = t - 68.1;
    $('#dim').style.opacity = seg(t, 67.95, 68.1);
    letterIn(dimAL, t, 68.0, .35, .4); letterIn(dimBL, t, 68.05, .35, .4);
    $('#dimA').style.left = kf(t, [[67.95, 60], [68.4, 168], [69.0, 466], [72, 1365], [74, 1965]], x => x) + 'px';
    $('#dimB').style.left = kf(t, [[67.95, 1290], [68.4, 1200], [69.0, 912], [72, 45], [74, -535]], x => x) + 'px';
    const tx = 1 - seg(t, 73, 74.2); $('#dimA').style.opacity = tx; $('#dimB').style.opacity = tx; $('#dimS').style.opacity = tx;
    $('#dimLine').style.opacity = seg(t, 74.4, 75.2);
    $('#dimArc').setAttribute('d', `M ${200 + u * 20} 80 C ${700} ${-20 + u * 8}, ${1400} ${200}, ${1800 - u * 30} ${120 + u * 6}`);
    const RK = [68.1, 68.4, 69.0, 69.5, 70.5, 72.0, 73.3], rk = v => kf(t, RK.map((k, i) => [k, v[i]]));
    const RX = rk([-20, -20, -20, -20, -16, -26, -40]), RZ = rk([-28, -28, -26, -24, -10, -30, -30]);
    _cp.set(rk([-400, -350, -220, -100, -50, 0, -120]), rk([260, 230, 170, 120, -470, -720, -1430]), rk([-3400, -3200, -2900, -2700, -1500, -1000, -3300]));
    _ring.compose(_cp, _cq.setFromEuler(_ce.set(RX * D2R, 0, RZ * D2R)), _one);
    const headA = (-35 + seg(t, 68.15, 69.4) * 125) * D2R;
    ribEls.forEach((el, i) => {
      let a = i / ribEls.length * Math.PI * 2 + u * 1.1; a = Math.atan2(Math.sin(a), Math.cos(a));
      const rev = t > 69.4 ? 1 : clamp((headA - a) / .35);
      _card.makeRotationY(a).multiply(_tr.makeTranslation(0, 70 * Math.sin(a * 2 + u * .9), RING_R)).premultiply(_ring);
      if (rev < 1) _card.multiply(_sc.makeScale(.6 + .4 * rev, .6 + .4 * rev, 1));
      if (i < RIB_GRID.length) {
        const st = eio(seg(t, 73.4 + i * .12, 74.6 + i * .12));
        _card.decompose(_p, _q, _s); _p.lerp(_gp.set(RIB_GRID[i][0], RIB_GRID[i][1], 0), st); _q.slerp(_id, st); _s.lerp(_one, st); _card.compose(_p, _q, _s);
        el.style.opacity = Math.max(rev, st);
      } else el.style.opacity = (1 - seg(t, 73.4, 74.4)) * rev;
      el.style.transform = `matrix3d(${_card.elements.join(',')})`;
    });
  }

  /* nav */
  const lightNav = (B1.top > 130 && t < 50.6) || B2.top > 130;
  $('#nav').style.display = t > 5.2 ? 'block' : 'none'; $('#nav').style.opacity = seg(t, 5.25, 5.7);
  $('#nav').style.color = lightNav ? '#111' : '#d8d8d8';
  $('#navTalk').style.background = lightNav ? '#111' : '#fff'; $('#navTalk').style.color = lightNav ? '#fff' : '#000';
  $('#navMenu').style.border = `.8px solid ${lightNav ? 'rgba(0,0,0,.55)' : '#fff'}`;
  $('#navSnd').style.background = lightNav ? 'rgba(0,0,0,.08)' : 'rgba(216,216,216,.1)';
  $('#navMark').style.opacity = 1 - bump(t, 5.4, 7.0, .2);      // the 3D S leaves the header logo and returns
  $('#scroll').style.opacity = t > 5.3 ? 1 : 0; $('#thumb').style.top = (10 + clamp((t - 5) / 71) * (868 - 150)) + 'px'; $('#thumb').style.background = lightNav ? '#9a9a9a' : '#5d5d5d';

  /* WebGL */
  if (showDark && t > 5.3) {
    hero.update(t, { dS });
    const mqVisible = dS > 1000;
    glassMarquee.scene.visible = mqVisible;
    if (mqVisible) { glassMarquee.layout(); glassMarquee.update(t, { opacity: 1 }); }
    renderLayers(hero.scene, [glassMarquee.scene]);
  } else if (showSvc && t > 50.2) {
    const on = seg(t, 50.4, 51.4), flash = on > .5 ? flashAt(t) : 0;
    glassWords.layout();
    glassWords.update(t, { opacity: seg(t, 51.15, 51.5), flash, fx: wordFx });
    svc.render(t, { on, flash, overlays: [glassWords.scene] });
  } else {
    renderer.setRenderTarget(null); renderer.setClearColor(0x000000, 1); renderer.clear();
  }
}

window.renderAt = render;
window.DURATION = DURATION;
render(0);
window.ready = true;
const q = new URLSearchParams(location.search);
if (q.has('play')) { const t0 = performance.now(), s = +(q.get('t') || 0); const loop = () => { render((s + (performance.now() - t0) / 1000) % DURATION); requestAnimationFrame(loop); }; loop(); }
else if (q.has('at')) render(+q.get('at'));
