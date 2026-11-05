// The S mark as an SVG, for layouts without WebGL: dark glossy beams with an ember rim and a fire band sweeping across.
import { MARK } from './data.js';

export function markArt() {
  const d = p => 'M' + p.map(([x, y]) => `${x} ${-y}`).join(' L') + ' Z';
  const paths = MARK.map(d);
  return `<div class="glow"></div><svg viewBox="-1.6 -1.6 3.2 3.2" aria-hidden="true"><defs>
    <linearGradient id="lmB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2a31"/><stop offset=".5" stop-color="#0e0e12"/><stop offset="1" stop-color="#050506"/></linearGradient>
    <linearGradient id="lmF" gradientUnits="userSpaceOnUse" x1="-1.6" y1="-1.6" x2="1.6" y2="1.6">
      <stop offset=".40" stop-color="#ff5a14" stop-opacity="0"/><stop offset=".48" stop-color="#ff6a1f" stop-opacity=".75"/><stop offset=".5" stop-color="#ffc08a" stop-opacity="1"/>
      <stop offset=".52" stop-color="#ff6a1f" stop-opacity=".75"/><stop offset=".60" stop-color="#ff5a14" stop-opacity="0"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-3.2 -3.2; 3.2 3.2" dur="5.5s" repeatCount="indefinite"/></linearGradient></defs>
    ${paths.map(p => `<path d="${p}" fill="url(#lmB)" stroke="rgba(255,110,40,.55)" stroke-width=".018" stroke-linejoin="round"/>`).join('')}
    ${paths.map(p => `<path d="${p}" fill="url(#lmF)" style="mix-blend-mode:screen"/>`).join('')}</svg>`;
}
