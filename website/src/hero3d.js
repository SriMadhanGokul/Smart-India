// The floating 3D S behind an inner page's hero. Loaded only in the full (desktop) layout, after the page is visible.
import { camera, canvas, renderer, resize, view } from './gl/core.js';
import { makeLogo } from './gl/logo.js';

export async function startHero3D() {
  resize();
  addEventListener('resize', resize);
  const logo = makeLogo();
  await renderer.compileAsync(logo.scene, camera).catch(() => {});
  const t0 = performance.now();
  let shown = null;
  canvas.classList.add('on');
  return {
    // y: page scroll; heroH: hero height. The S rises with the page and stops drawing once the hero has gone.
    frame(now, y, heroH) {
      const vis = y < heroH + 60;
      if (vis !== shown) { canvas.style.visibility = vis ? 'visible' : 'hidden'; shown = vis; }
      if (!vis) return;
      logo.update(8.4 + (now - t0) / 1000, 18.85, y, { x: 960, y: 292, s: 1.02, lift: y / view.u * .72 });
      renderer.render(logo.scene, camera);
    },
  };
}
