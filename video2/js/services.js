// Services scene: storm backdrop, the falling/turning stone (measured from the reference frame by frame),
// impact dust, and lightning that lights the clouds and the stone. The glass service words are drawn as an
// overlay that depth-tests against this scene, so the stone really passes through the letters.
import * as THREE from 'three';
import { backdrop, toWorld, renderLayers } from './gl.js';
import { clamp, seg, eio, curve, rnd, reseed } from './util.js';
import { makeStone } from './stone.js';
import { makeStorm } from './storm.js';

// Stone path: screen centre (px), depth, rotation — keyed to the reference at 51.6 … 61.4s
const KT = [50.85, 51.6, 52.6, 54.6, 56.4, 57.6, 58.4, 59.1, 59.6, 60.6, 61.4];
const K = (vals) => curve(KT.map((t, i) => [t, vals[i]]));
const STONE = {
  x: K([956, 956, 948, 926, 947, 930, 906, 940, 917, 950, 957]),
  y: K([-40, 70, 134, 252, 317, 331, 321, 360, 375, 430, 433]),
  // depths fitted so the projected size matches the reference; the front face meets the text plane at ~58.4s
  z: K([-18, -18, -13.3, -10.4, -1.2, -.4, .1, 4.0, 4.75, 5.9, 6.25]),
  rx: K([.6, .62, .7, 1.0, 1.36, 1.28, 1.05, .55, .2, .06, .03]),
  ry: K([.75, .78, .85, .45, .12, .08, -.25, -.18, -.1, .02, 0]),
  rz: K([.25, .28, .35, .5, -.48, -.55, .72, .75, .35, .05, .03]),
};

export function makeServices() {
  const back = new THREE.Scene(), front = new THREE.Scene();
  const bgU = { uFlash: { value: 0 } };
  back.add(backdrop(`uniform float uFlash;
    void main(){vec2 p=vUv-.5;float v=1.-dot(p,p)*1.2;vec3 c=vec3(.0065,.0068,.0075)*v+vec3(.02,.022,.026)*uFlash;
    gl_FragColor=vec4(c,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    }`, bgU));

  back.add(new THREE.AmbientLight(0xffffff, .12));
  const keyL = new THREE.DirectionalLight(0xffffff, 4.0); keyL.position.set(-5, 7, 6); back.add(keyL);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1); rim.position.set(6, -2, -4); back.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, .45); fill.position.set(4, -3, 8); back.add(fill);
  const flashL = new THREE.DirectionalLight(0xdfe8ff, 0); flashL.position.set(1, 9, 2); back.add(flashL);

  const stone = makeStone();
  back.add(stone.mesh);
  window.__stone = stone.mesh;   // inspection hook for measuring the projected stone box

  reseed(91);
  const DN = 1100, dpos = new Float32Array(DN * 3), dvel = [];
  for (let i = 0; i < DN; i++) { const a = rnd() * 6.283, z = rnd() * 2 - 1, r = Math.sqrt(1 - z * z); dvel.push([r * Math.cos(a) * (1 + rnd() * 3), r * Math.sin(a) * (1 + rnd() * 3), z * (1 + rnd() * 2)]); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dmat = new THREE.PointsMaterial({ color: 0xcfcac2, size: .03, transparent: true, depthWrite: false });
  const dust = new THREE.Points(dg, dmat); dust.frustumCulled = false; back.add(dust);

  const storm = makeStorm(back, front);

  return {
    stoneZ: t => STONE.z(t),
    render(t, { on, flash, overlays }) {
      bgU.uFlash.value = flash;
      storm.update(t, { on, flash, darkness: 1 });
      flashL.intensity = flash * 5.5;
      keyL.intensity = 5.2 + flash * 1.5;

      const vis = t > 50.85;
      stone.mesh.visible = vis;
      if (vis) {
        const z = STONE.z(t), [x, y] = toWorld(STONE.x(t), STONE.y(t), z);
        const w = seg(t, 61.4, 67);                       // gentle settle wobble once face-on
        stone.mesh.position.set(x, y, z);
        stone.mesh.rotation.set(STONE.rx(t) + .02 * Math.sin(t * .5) * w, STONE.ry(t) + .035 * Math.sin(t * .4) * w, STONE.rz(t) + .015 * Math.sin(t * .33) * w);
        stone.setCarve([eio(seg(t, 62.0, 62.62)), eio(seg(t, 62.85, 63.25)), eio(seg(t, 62.55, 63.12))]);
        const dp = seg(t, 58.3, 61.6);
        dust.visible = dp > 0 && dp < 1; dmat.opacity = (1 - dp) * .85;
        const sz = STONE.z(58.4) + .5, [sx, sy] = toWorld(906, 321, sz);
        for (let i = 0; i < DN; i++) { const v = dvel[i]; dpos[i * 3] = sx + v[0] * dp * 2.6; dpos[i * 3 + 1] = sy + v[1] * dp * 2.6 - dp * dp * .9; dpos[i * 3 + 2] = sz + v[2] * dp * 2; }
        dg.attributes.position.needsUpdate = true;
      } else dust.visible = false;

      renderLayers(back, [...overlays, front]);
    },
  };
}
