// Small DOM helpers shared by the desktop and lite layouts.
import { seg, eout, rnd } from './lib/util.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Style writer that skips unchanged values (most per-frame properties settle quickly).
export function S(el, k, v) {
  const c = el.__s || (el.__s = {});
  if (c[k] !== v) { c[k] = v; el.style[k] = v; }
}
export const show = (el, on) => S(el, 'display', on ? '' : 'none');

// Split text into per-letter spans (inline-block so each can blur/fade on its own).
export function letters(el, text, cls = 'hw') {
  el.textContent = '';
  return [...text].map(ch => {
    const s = document.createElement('span');
    if (cls) s.className = cls;
    s.textContent = ch; s.dataset.d = rnd(); el.appendChild(s);
    return s;
  });
}

// Letters blur in with a random stagger; optional blur-out at `out`. Pure function of t.
export function letterIn(arr, t, t0, spread = .9, dur = .55, out = null) {
  for (const s of arr) {
    const d = +s.dataset.d;
    let p = eout(seg(t, t0 + d * spread, t0 + d * spread + dur));
    if (out != null) p *= 1 - eout(seg(t, out + d * .45, out + d * .45 + .4));
    S(s, 'opacity', p.toFixed(3));
    S(s, 'filter', p < .999 ? `blur(${((1 - p) * 16).toFixed(1)}px)` : 'none');
  }
}

// Rolling digit columns; each column scrolls through two decades and lands on its digit.
export function odometer(el, value, suffix) {
  const ds = String(value).split('').map(Number);
  el.innerHTML = ds.map(() => `<span class="col">${Array.from({ length: 20 }, (_, k) => `<span>${k % 10}</span>`).join('')}</span>`).join('')
    + (suffix ? `<sup>${suffix}</sup>` : '');
  el.setAttribute('aria-label', `${value}${suffix || ''}`);
  return { cols: $$('.col', el), ds };
}

export const setMask = (el, m) => { S(el, 'maskImage', m); S(el, 'webkitMaskImage', m); };

// Five horizontal slats that each fill upward from their bottom edge (measured from the reference).
export function blinds(t, { S: st, D, P }, H) {
  const SL = H / 5, stops = []; let done = true, any = false, top = 0;
  for (let k = 0; k < 5; k++) {
    const y0 = k * SL, y1 = y0 + SL, x = seg(t, st[k], st[k] + D[k]), f = SL * (1 - Math.pow(1 - x, P[k]));
    if (x < 1) done = false; if (x > 0) any = true; if (k === 0) top = f;
    stops.push(`transparent ${y0.toFixed(1)}px`, `transparent ${(y1 - f).toFixed(1)}px`, `#000 ${(y1 - f).toFixed(1)}px`, `#000 ${y1.toFixed(1)}px`);
  }
  return { mask: `linear-gradient(to bottom,${stops.join(',')})`, done, any, top };
}

// Trigger clock: runs forward in real time while `on`, rewinds (faster) while off.
export class Clock {
  constructor(dur, back = 2) { this.t = 0; this.dur = dur; this.back = back; }
  step(on, dt) { this.t = on ? Math.min(this.dur, this.t + dt) : Math.max(0, this.t - dt * this.back); return this.t; }
}

// Hover text-roll: <span data-t="Label"> becomes two stacked copies that slide up on hover.
export function initRoll(root = document) {
  for (const el of $$('[data-t]', root)) {
    if (el.__roll) continue;
    el.__roll = true;
    const t = el.dataset.t;
    el.innerHTML = `<i>${t}</i><i aria-hidden="true">${t}</i>`;
  }
}

// Split text into word spans (used for colour reveals and the testimonial swap).
export function words(el, text) {
  el.textContent = '';
  return text.split(' ').map((w, i, a) => {
    const s = document.createElement('span');
    s.textContent = w + (i < a.length - 1 ? ' ' : '');
    el.appendChild(s);
    return s;
  });
}
