// The floating 3D S behind an inner page's hero, on every layout with WebGL. Loaded after the page is visible.
import { autoResize, camera, canvas, governor, PX, renderer, resize, view } from './gl/core.js';
import { makeLogo } from './gl/logo.js';

export async function startHero3D() {
  resize();
  autoResize();
  const logo = makeLogo(view.lite ? { shardCount: 18 } : undefined);
  await renderer.compileAsync(logo.scene, camera).catch(() => {});
  const t0 = performance.now();
  let shown = null;
  canvas.classList.add('on');
  return {
    // y: page scroll; heroH: hero height. The S rises with the page and stops drawing once the hero has gone.
    frame(now, y, heroH) {
      const vis = y < heroH + 60;
      if (vis !== shown) { canvas.style.visibility = vis ? 'visible' : 'hidden'; shown = vis; }
      if (!vis) { governor(0); return; }
      let pose = { x: 960, y: 292, s: 1.02 };
      if (view.lite) {       // phones: the gap above the title, set by .ph-body's top margin in pages.css
        const size = Math.min(view.w * .62, 340), mid = Math.max(92, innerHeight * .13) + size / 2;
        pose = { x: 960, y: (mid - view.oy) / view.u, s: size / (2.4 * PX(-1)), xk: .5 };
      }
      logo.update(8.4 + (now - t0) / 1000, 18.85, y, { ...pose, lift: y / view.u * .72 });
      renderer.render(logo.scene, camera);
      governor(now);
    },
  };
}
