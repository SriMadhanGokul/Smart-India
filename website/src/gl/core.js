// Shared WebGL core: one fixed canvas behind the page, a camera framed to the page's design frame, and a
// colour+depth capture target that the glass type refracts and depth-tests against.
//
// The desktop page is laid out on a 1920×868 design frame, scaled uniformly by `u` and centred in the viewport
// (see main.js). The camera's FOV is derived from the same frame, so one design pixel is the same size in the
// DOM and in 3D at every viewport size, and the 3D motion keyframes measured on the reference stay valid.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const REF_W = 1920, REF_H = 868;
export const canvas = document.getElementById('gl');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

export const camera = new THREE.PerspectiveCamera(30, 1, .1, 200);
camera.position.set(0, 0, 14);
const TAN = Math.tan(THREE.MathUtils.degToRad(15));

// w/h: viewport (CSS px); u: design-px → CSS-px scale; ox/oy: offset of the centred design frame; fh: frame height
export const view = { w: 1, h: 1, dpr: 1, u: 1, ox: 0, oy: 0, fh: REF_H };
export const PX = z => view.fh / (2 * (14 - z) * TAN);                    // CSS px per world unit at depth z
export const toWorld = (sx, sy, z) => [(sx - view.w / 2) / PX(z), (view.h / 2 - sy) / PX(z), z];
export const ref = (x, y) => [view.ox + x * view.u, view.oy + y * view.u];   // design px (centred frame) → viewport px

export const envTex = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
export const sceneRT = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthTexture: new THREE.DepthTexture(1, 1) });
const resizeHooks = [];
export const onResize = fn => resizeHooks.push(fn);

export function resize() {
  view.w = innerWidth; view.h = innerHeight;
  view.u = Math.min(view.w / REF_W, view.h / REF_H);
  view.ox = (view.w - REF_W * view.u) / 2; view.oy = (view.h - REF_H * view.u) / 2; view.fh = REF_H * view.u;
  view.dpr = Math.min(devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(view.dpr);
  renderer.setSize(view.w, view.h, false);
  camera.aspect = view.w / view.h;
  camera.fov = 2 * THREE.MathUtils.radToDeg(Math.atan(TAN * view.h / view.fh));
  camera.updateProjectionMatrix();
  const bw = Math.round(view.w * view.dpr), bh = Math.round(view.h * view.dpr);
  sceneRT.setSize(bw, bh);
  sceneRT.depthTexture.image.width = bw; sceneRT.depthTexture.image.height = bh;
  for (const fn of resizeHooks) fn(bw, bh);
}

// Full-screen background quad drawn in clip space (ignores the camera).
export function backdrop(fragment, uniforms) {
  const m = new THREE.ShaderMaterial({
    uniforms, depthWrite: false, depthTest: false,
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy*2.,0.9999,1.);}',
    fragmentShader: `varying vec2 vUv;${fragment}`,
  });
  const q = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m);
  q.frustumCulled = false; q.renderOrder = -100;
  return q;
}

// Render `scene` into the capture target and to the screen, then draw overlay scenes on top.
export function renderLayers(scene, overlays = []) {
  renderer.autoClear = true;
  renderer.setRenderTarget(sceneRT);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
  renderer.autoClear = false;
  for (const o of overlays) if (o.visible !== false) renderer.render(o, camera);
  renderer.autoClear = true;
}

export function clear() {
  renderer.setRenderTarget(null); renderer.setClearColor(0x040508, 1); renderer.clear();
}
