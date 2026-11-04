// Shared WebGL core: one renderer/camera for every scene, plus a colour+depth render target that the
// glass text samples (refraction) and depth-tests against (stone/logo passing through the letters).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const W = 1920, H = 868;
export const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

export const camera = new THREE.PerspectiveCamera(30, W / H, .1, 200);
camera.position.set(0, 0, 14);
const TAN = Math.tan(THREE.MathUtils.degToRad(15));
export const PX = z => H / (2 * (14 - z) * TAN);              // screen px per world unit at depth z
export const toWorld = (sx, sy, z) => [(sx - W / 2) / PX(z), (H / 2 - sy) / PX(z), z];

export const envTex = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;

export const sceneRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, depthTexture: new THREE.DepthTexture(W, H) });

// Full-screen background quad drawn in clip space (ignores the camera).
export function backdrop(fragment, uniforms) {
  const m = new THREE.ShaderMaterial({
    uniforms, depthWrite: false, depthTest: false,
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy*2.,0.9999,1.);}',
    fragmentShader: `varying vec2 vUv;${fragment}`,
  });
  const q = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m);
  q.frustumCulled = false;
  q.renderOrder = -100;
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
