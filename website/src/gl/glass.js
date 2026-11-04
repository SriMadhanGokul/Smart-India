// Glass display type. Every DOM letter span gets a WebGL tile aligned to its live layout box; the tile is
// shaded as frosted glass that refracts the 3D scene behind it and depth-tests against it, so the stone /
// S logo can pass *through* the words while the letters stay readable (ghosted outline where occluded).
// Glyphs are rasterised once at high resolution and scaled to the element's current font size.
import * as THREE from 'three';
import { sceneRT, PX, view, onResize } from './core.js';

const VERT = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';

const GLASS_FRAG = `
uniform sampler2D uMask,uBlur,uScene,uDepth;
uniform vec2 uRes,uTexel;
uniform float uTime,uOpacity,uGhost,uRefr,uFrost,uFlash,uBody;
uniform vec3 uTint;
varying vec2 vUv;
float Hh(vec2 p){return texture2D(uBlur,p).a;}
void main(){
  float a=texture2D(uMask,vUv).a;
  if(a<0.003)discard;
  vec2 e=uTexel*3.0;
  float hx=Hh(vUv+vec2(e.x,0.))-Hh(vUv-vec2(e.x,0.));
  float hy=Hh(vUv+vec2(0.,e.y))-Hh(vUv-vec2(0.,e.y));
  vec3 n=normalize(vec3(-hx*2.6,-hy*2.6,1.));
  float h=Hh(vUv);
  vec2 suv=gl_FragCoord.xy/uRes;
  float occ=step(texture2D(uDepth,suv).x,gl_FragCoord.z-1e-5);
  vec2 off=n.xy*uRefr;
  vec3 bg=vec3(texture2D(uScene,suv+off*1.14).r,texture2D(uScene,suv+off).g,texture2D(uScene,suv+off*.86).b);
  vec3 fr=vec3(0.);
  for(int i=0;i<8;i++){float an=float(i)*.785+.3;fr+=texture2D(uScene,suv+off+vec2(cos(an),sin(an))*uFrost/uRes).rgb;}
  fr/=8.;
  vec3 body=mix(bg,fr,.65);
  vec3 L=normalize(vec3(-.5,.72,.55));
  float spec=pow(max(dot(reflect(-L,n),vec3(0.,0.,1.)),0.),30.);
  float spec2=pow(max(dot(reflect(-normalize(vec3(.65,-.45,.6)),n),vec3(0.,0.,1.)),0.),16.)*.4;
  float fres=pow(1.-n.z,1.25);
  float band=suv.x+suv.y*.55;
  float sweep=exp(-pow(band-(mod(uTime*.16,2.6)-.4),2.)/.0025);
  float depth=smoothstep(.12,.9,h);
  vec3 col=body*(.8+.2*depth)+uTint*uBody*(.75+.25*depth)
          +vec3(1.)*(fres*.9+spec*1.15+spec2+sweep*.3)
          +vec3(.82,.9,1.)*uFlash*(.25+.6*fres);
  float alpha=a*uOpacity;
  if(occ>.5){col=vec3(1.)*(fres*1.2+spec*.9)+uTint*uBody*.6;alpha*=uGhost;}
  gl_FragColor=vec4(col,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const SHADOW_FRAG = `
uniform sampler2D uBlur,uDepth;uniform vec2 uRes;uniform float uOpacity,uShadow;varying vec2 vUv;
void main(){float a=texture2D(uBlur,vUv).a;vec2 suv=gl_FragCoord.xy/uRes;
  float occ=step(texture2D(uDepth,suv).x,gl_FragCoord.z-1e-5);
  gl_FragColor=vec4(0.,0.,0.,a*uShadow*uOpacity*(1.-occ));}`;

export class GlassText {
  constructor(spans, { family, weight = 400, atlasPx = 280, refr = .02, frost = 7, ghost = .55, body = .34, tint = [.92, .93, .96], shadow = .45 }) {
    this.spans = spans;
    const AF = atlasPx, pad = Math.round(AF * .22);
    const font = `${weight} ${AF}px "${family}"`;
    const c = document.createElement('canvas'), g = c.getContext('2d');
    g.font = font;
    const m = g.measureText('H');
    const asc = m.fontBoundingBoxAscent, desc = m.fontBoundingBoxDescent;
    const chars = [...new Set(spans.map(s => s.textContent))];
    const rowH = Math.ceil(asc + desc + 2 * pad), cols = 6, cells = {};
    let x = 0, y = 0, maxW = 0;
    chars.forEach((ch, i) => {
      if (i % cols === 0 && i) { x = 0; y += rowH; }
      const w = Math.ceil(g.measureText(ch).width + 2 * pad);
      cells[ch] = { x, y, w, h: rowH };
      x += w; maxW = Math.max(maxW, x);
    });
    c.width = maxW; c.height = y + rowH;
    g.font = font; g.fillStyle = '#fff'; g.textBaseline = 'alphabetic';
    for (const ch of chars) g.fillText(ch, cells[ch].x + pad, cells[ch].y + pad + asc);
    const b = document.createElement('canvas'); b.width = c.width; b.height = c.height;
    const bg = b.getContext('2d'); bg.filter = `blur(${Math.round(AF * .05)}px)`; bg.drawImage(c, 0, 0);

    this.shared = {
      uMask: { value: new THREE.CanvasTexture(c) }, uBlur: { value: new THREE.CanvasTexture(b) },
      uScene: { value: sceneRT.texture }, uDepth: { value: sceneRT.depthTexture },
      uRes: { value: new THREE.Vector2(1, 1) }, uTexel: { value: new THREE.Vector2(1 / c.width, 1 / c.height) },
      uTime: { value: 0 }, uFlash: { value: 0 }, uRefr: { value: refr }, uFrost: { value: frost }, uGhost: { value: ghost },
      uBody: { value: body }, uTint: { value: new THREE.Vector3(...tint) }, uShadow: { value: shadow },
    };
    const setRes = (bw, bh) => this.shared.uRes.value.set(bw, bh);
    setRes(Math.round(view.w * view.dpr), Math.round(view.h * view.dpr));
    onResize(setRes);

    this.scene = new THREE.Scene();
    this.letters = spans.map(span => {
      const cl = cells[span.textContent];
      const geo = new THREE.PlaneGeometry(1, 1), uv = geo.attributes.uv;
      const u0 = cl.x / c.width, u1 = (cl.x + cl.w) / c.width, v1 = 1 - cl.y / c.height, v0 = 1 - (cl.y + cl.h) / c.height;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) ? u1 : u0, uv.getY(i) ? v1 : v0);
      const mk = (frag, order) => {
        const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({
          uniforms: { ...this.shared, uOpacity: { value: 1 } }, vertexShader: VERT, fragmentShader: frag,
          transparent: true, depthTest: false, depthWrite: false,
        }));
        mesh.renderOrder = order; mesh.frustumCulled = false; this.scene.add(mesh);
        return mesh;
      };
      // metrics in em (relative to the atlas font size) so tiles follow responsive type
      return { span, shadow: mk(SHADOW_FRAG, 1), glass: mk(GLASS_FRAG, 2), wEm: cl.w / AF, hEm: cl.h / AF, base: null };
    });
    this.padEm = pad / AF;
  }

  // Cache each letter's CSS font size (call after fonts load and on resize).
  measure() { for (const L of this.letters) L.fs = parseFloat(getComputedStyle(L.span).fontSize); }

  // Read the live DOM layout (the text may be transparent, but must be laid out). The spans must be plain
  // inline boxes, so their rect is the font's content area. k = the CSS scale applied by the design frame.
  layout(k = 1) {
    for (const L of this.letters) {
      if (L.fs == null) L.fs = parseFloat(getComputedStyle(L.span).fontSize);
      const r = L.span.getBoundingClientRect(), fs = L.fs * k;
      const pad = this.padEm * fs, w = L.wEm * fs, h = L.hEm * fs;
      L.base = { cx: r.left - pad + w / 2, cy: r.top - pad + h / 2, w, h };
    }
  }

  // fx(i, letter) may return {dx,dy,dz (world), rx,ry,rz, op}; tiles start on the z=0 text plane.
  update(t, { opacity = 1, flash = 0, fx = null } = {}) {
    this.shared.uTime.value = t; this.shared.uFlash.value = flash;
    const px0 = PX(0), sh = Math.max(6, px0 * .07);
    this.letters.forEach((L, i) => {
      const o = fx ? fx(i, L) || {} : {};
      const op = opacity * (o.op ?? 1), B = L.base;
      const x = (B.cx - view.w / 2) / px0 + (o.dx || 0), y = (view.h / 2 - B.cy) / px0 + (o.dy || 0), z = o.dz || 0;
      for (const [mesh, k] of [[L.glass, 0], [L.shadow, 1]]) {
        mesh.visible = op > .002;
        mesh.material.uniforms.uOpacity.value = op;
        mesh.scale.set(B.w / px0, B.h / px0, 1);
        mesh.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
        mesh.position.set(x + k * sh * .6 / px0, y - k * sh / px0, z - k * .02);
      }
    });
  }
}
