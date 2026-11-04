// Dark-section scene: navy-black backdrop, light streaks, floating shards and the glossy S logo with the
// fire effect (molten bands sweeping the beams, glowing end caps, ember rims).
// Real time drives the intro (it leaves the header logo, flies apart in fire, assembles) and the idle loop;
// scroll position (as "video time" vt) drives its journey down through About into the glass marquee.
import * as THREE from 'three';
import { envTex, backdrop, toWorld, view, ref, PX } from './core.js';
import { clamp, lerp, seg, eio, bump, curve, rnd, reseed } from '../lib/util.js';
import { MARK } from '../content.js';

function fireMaterial() {
  const m = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0e, metalness: .9, roughness: .22, clearcoat: 1, clearcoatRoughness: .08 });
  const u = {
    uBand: { value: new THREE.Vector4(1, 0, 0, 99) }, uBandI: { value: 0 }, uBandW: { value: .3 },
    uBand2: { value: new THREE.Vector4(1, 0, 0, 99) }, uBand2I: { value: 0 }, uBand2W: { value: .3 }, uRim: { value: .3 },
  };
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vObj;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj=position;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObj;uniform vec4 uBand,uBand2;uniform float uBandI,uBandW,uBand2I,uBand2W,uRim;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float b1=exp(-pow((dot(vObj,uBand.xyz)-uBand.w)/uBandW,2.))*uBandI;
        float b2=exp(-pow((dot(vObj,uBand2.xyz)-uBand2.w)/uBand2W,2.))*uBand2I;
        float b=b1+b2;
        vec3 fire=mix(vec3(.9,.16,.02),vec3(1.,.52,.16),clamp(b*.6,0.,1.));
        totalEmissiveRadiance+=fire*b*1.35;
        float rimF=pow(1.-abs(dot(normal,normalize(vViewPosition))),3.);
        totalEmissiveRadiance+=vec3(.95,.2,.05)*rimF*uRim*(.6+b);`);
  };
  m.customProgramCacheKey = () => 'fire-beam';
  m.userData.u = u;
  return m;
}

const glowTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,190,110,1)'); gr.addColorStop(.22, 'rgba(255,110,30,.6)'); gr.addColorStop(.6, 'rgba(255,60,10,.12)'); gr.addColorStop(1, 'rgba(255,40,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();

const N = (x, y) => { const l = Math.hypot(x, y); return [x / l, y / l, 0]; };
// [t0, t1, dir, from, to, width, intensity]; intro bands use intro time, hero bands loop, travel bands follow scroll
const BANDS = [
  [[5.6, 7.4, N(.6, -.8), -1.6, 1.0, .32, 1.8], [10.0, 11.1, N(1, 0), -1.25, -.85, .22, 2.4], [11.7, 12.6, N(0, 1), .85, 1.25, .22, 1.5],
    [15.5, 16.5, N(.7, .7), -.4, .55, .14, 2.3], [16.45, 17.7, N(1, 0), -1.1, 1.1, .26, 1.8], [21.2, 22.6, N(1, 0), 1.1, -1.1, .3, 1.2],
    [25.4, 26.8, N(0, -1), -1.2, -.1, .3, 1.1]],
  [[10.2, 11.0, N(1, 0), .5, .9, .2, 2.6], [18.5, 19.5, N(1, 0), -.9, .9, .3, 1.1], [23.3, 24.6, N(1, 0), -.9, .9, .3, 1.2], [27.6, 28.8, N(1, 0), .9, -.9, .3, 1.5]],
  [[5.8, 7.6, N(-.6, .8), -1.6, 1.0, .32, 1.8], [12.0, 12.8, N(0, -1), .9, 1.2, .22, 1.4], [16.6, 17.8, N(1, 0), 1.1, -1.1, .26, 1.8],
    [22.8, 24.0, N(-1, 0), -1.0, 1.0, .3, 1.2], [26.6, 27.9, N(1, 0), -1.0, 1.0, .3, 1.3]],
];
const CENTROID = [[-.1, .78], [0, 0], [.1, -.78]];
const SPLIT = [[-1.2, 1, .6], [.2, 0, 1.3], [1.2, -1, -.6]];
// journey after the hero, in reference screen coordinates (1920×868), keyed by scroll "video time"
const TRAVEL = {
  x: curve([[18.85, 1010], [20.6, 1240], [23.2, 700], [25.6, 1150], [27.3, 960], [28.6, 960], [30, 960], [31.5, 980]]),
  y: curve([[18.85, 480], [20.6, 600], [23.2, 640], [25.6, 600], [27.3, 460], [28.6, 425], [30, 420], [31.5, 430]]),
  z: curve([[18.85, -1], [20.6, -2], [23.2, -3], [25.6, -2.2], [27.3, -1.2], [28.6, -.3], [30, 1.6], [31.5, 3]]),
  s: curve([[18.85, 1.55], [20.6, 1.3], [23.2, 1.15], [25.6, 1.15], [27.3, 1.25], [28.6, 1.3], [31.5, 1.3]]),
  sep: curve([[18.85, 0], [20.6, .55], [23.2, .7], [25.6, .45], [27.3, .15], [28.6, 0], [30, .1], [31.5, .25]]),
};
const HERO_CYCLE = 11;   // seconds; the hero's fire/breathe choreography (8.4–19.4) loops while idle

export function makeLogo() {
  const scene = new THREE.Scene();
  scene.environment = envTex;
  scene.add(backdrop(`void main(){vec2 p=vUv;vec3 c=mix(vec3(.0042,.0048,.0085),vec3(.015,.017,.028),smoothstep(0.,1.,p.y*.55+p.x*.45));
    c+=vec3(.009,.010,.015)*exp(-pow((p.x-p.y*.85)-.18,2.)/.03);
    gl_FragColor=vec4(c,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    }`, {}));
  scene.add(new THREE.AmbientLight(0xffffff, .15));
  const key = new THREE.DirectionalLight(0xffffff, .9); key.position.set(6, 8, 6); scene.add(key);
  const orange = new THREE.PointLight(0xff5a14, 55, 9, 1.6), orange2 = new THREE.PointLight(0xff7a2a, 32, 7, 1.6);
  scene.add(orange, orange2);

  reseed(21);
  const streakTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 4; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 256, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 4); return new THREE.CanvasTexture(c); })();
  const streaks = [];
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: streakTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
    m.userData = { x: (rnd() - .5) * 40, y: (rnd() - .5) * 20, L: 3 + rnd() * 8, a: -.9 - rnd() * .6, v: .6 + rnd() * 1.6, o: .08 + rnd() * .22 };
    m.position.z = -12; scene.add(m); streaks.push(m);
  }
  const black = new THREE.MeshPhysicalMaterial({ color: 0x0c0c0e, metalness: .9, roughness: .2, clearcoat: 1, clearcoatRoughness: .08 });
  const shardMat = black.clone(); shardMat.envMapIntensity = .35;
  const shards = [];
  for (let i = 0; i < 34; i++) {
    const L = 1.2 + rnd() * 3.4, w = .05 + rnd() * .12;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, L, w * (1 + rnd() * 2)), shardMat);
    m.userData = { p: [(rnd() - .5) * 20, (rnd() - .5) * 12 - rnd() * 14, -10 + rnd() * 13], r: [rnd() * 6, rnd() * 6, rnd() * 6], s: [(rnd() - .5) * .3, (rnd() - .5) * .3, (rnd() - .5) * .3], par: .4 + rnd() * .8 };
    if (rnd() < .28) { const e = new THREE.Mesh(new THREE.BoxGeometry(w * 1.05, L * .18, w * .3), new THREE.MeshBasicMaterial({ color: 0xff6a1f })); e.position.y = L * (rnd() - .5) * .6; m.add(e); }
    scene.add(m); shards.push(m);
  }

  const logo = new THREE.Group(); scene.add(logo);
  const pieces = MARK.map((poly, i) => {
    const sh = new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: .46, bevelEnabled: true, bevelThickness: .035, bevelSize: .035, bevelSegments: 3 });
    g.translate(0, 0, -.23);
    const mat = fireMaterial();
    const holder = new THREE.Group(); holder.add(new THREE.Mesh(g, mat));
    const halos = [0, 1].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 })); holder.add(s); return s; });
    logo.add(holder);
    return { holder, mat, halos, spin: [rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1] };
  });

  const bandsAt = (k, t, lo, hi) => {
    const act = BANDS[k].filter(b => b[0] >= lo && b[0] < hi)
      .map(([t0, t1, dir, a, b, w, I]) => ({ I: t > t0 && t < t1 ? I * bump(t, t0, t1, .3) : 0, dir, pos: lerp(a, b, eio(seg(t, t0, t1))), w }))
      .filter(x => x.I > .001).sort((p, q) => q.I - p.I);
    return [act[0], act[1]];
  };

  return {
    scene,
    // ti: intro clock in "video seconds" (5.3 = loader done); vt: scroll position as video time; dS: dark-page scroll px
    update(ti, vt, dS) {
      const tc = ti < 8.4 ? ti : 8.4 + ((ti - 8.4) % HERO_CYCLE);
      scene.environmentIntensity = .07 + .23 * seg(ti, 6.6, 9.0);
      // intro (leaves the header mark, flies apart in fire, assembles) → idle hover → scroll journey.
      // The states are blended, so scrolling early never makes the logo jump.
      let st;
      if (ti < 8.4) {
        const a = eio(seg(ti, 5.45, 6.7)), b = eio(seg(ti, 6.7, 8.4)), ny = 53 - view.oy / view.u;  // header mark sits in the top-anchored nav
        st = { x: lerp(lerp(52, 900, a), 1010, b), y: lerp(lerp(ny, 450, a), 480, b), z: -1, s: lerp(lerp(.116, 1.05, a), 1.55, b), sep: bump(ti, 5.75, 8.2, .3) * 1.5 };
      } else st = { x: 1010 + 30 * Math.sin(ti * .3), y: 480, z: -1, s: 1.55, sep: bump(tc, 10.2, 12.8) * 1.25 + bump(tc, 15.2, 17.6) * .9 };
      if (vt > 18.85) {
        const w = eio(seg(vt, 18.85, 19.7));
        for (const k in TRAVEL) st[k] = lerp(st[k], TRAVEL[k](vt), w);
      }
      logo.visible = ti > 5.42;
      const [px, py] = ref(st.x, st.y), [x, y, z] = toWorld(px, py, st.z);
      logo.position.set(x, y, z);
      logo.scale.setScalar(st.s);
      logo.rotation.set(.55 + .25 * Math.sin(ti * .37), -.6 + .55 * Math.sin(ti * .29 + .5), .12 * Math.sin(ti * .21));
      pieces.forEach((P, k) => {
        const d = SPLIT[k];
        P.holder.position.set(d[0] * st.sep, d[1] * st.sep, d[2] * st.sep);
        P.holder.rotation.set(P.spin[0] * st.sep * .6, P.spin[1] * st.sep * .5, P.spin[2] * st.sep * .4);
        const pair = ti < 8.4 ? bandsAt(k, ti, 0, 8) : bandsAt(k, tc, 8, 20);   // fire keeps sweeping in real time
        const U = P.mat.userData.u;
        [[pair[0], U.uBand, U.uBandI, U.uBandW], [pair[1], U.uBand2, U.uBand2I, U.uBand2W]].forEach(([b, vec, I, Wd], j) => {
          const halo = P.halos[j];
          if (!b) { I.value = 0; halo.material.opacity = 0; return; }
          vec.value.set(b.dir[0], b.dir[1], b.dir[2], b.pos); I.value = b.I; Wd.value = b.w;
          const c = CENTROID[k], along = b.pos - (c[0] * b.dir[0] + c[1] * b.dir[1]);
          halo.position.set(c[0] + b.dir[0] * along, c[1] + b.dir[1] * along, .3);
          halo.material.opacity = clamp(b.I * .32); halo.scale.setScalar(.8 + b.w * 2.6);
        });
        U.uRim.value = .22 + .12 * Math.sin(ti * 2.1 + k);
      });
      orange.position.set(x + 2.2 * Math.sin(ti * .9), y + 1.5 * Math.cos(ti * .7), z + 3);
      orange2.position.set(x - 1.8 * Math.cos(ti * .6), y - 1.2, z + 2.5);
      const PXU = PX(0);
      shards.forEach(m => {
        const u = m.userData, a = seg(ti, 5.4, 7.0);
        m.position.set(u.p[0], u.p[1] + dS / PXU * u.par, u.p[2] - (1 - a) * 10);
        m.rotation.set(u.r[0] + ti * u.s[0], u.r[1] + ti * u.s[1], u.r[2] + ti * u.s[2]);
      });
      const so = seg(ti, 5.6, 6.6);
      streaks.forEach(m => {
        const u = m.userData, d = (ti * u.v) % 30;
        m.position.set(u.x + Math.cos(u.a) * d, u.y + dS / PXU * .25 + Math.sin(u.a) * d, -12);
        m.rotation.z = u.a; m.scale.set(u.L, .012, 1);
        m.material.opacity = so * u.o * (.6 + .4 * Math.sin(ti * 1.3 + u.x));
      });
    },
  };
}
