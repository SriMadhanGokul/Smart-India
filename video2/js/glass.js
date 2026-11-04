// Glass display type. Every DOM letter span gets a WebGL tile aligned to its real layout box; the tile is
// shaded as frosted glass that refracts the 3D scene behind it, and it depth-tests against that scene so
// the stone / S logo can pass *through* the words while the letters stay readable (ghosted outline).
import * as THREE from 'three';
import { sceneRT, PX, W, H } from './gl.js';

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
  constructor(spans, { family, weight = 400, fontPx, scale = 2, refr = .02, frost = 7, ghost = .55, body = .2, tint = [.92, .93, .96], shadow = .45 }) {
    this.spans = spans;
    const AF = fontPx * scale, pad = Math.round(AF * .22);
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
    const mask = new THREE.CanvasTexture(c), blur = new THREE.CanvasTexture(b);

    this.shared = {
      uMask: { value: mask }, uBlur: { value: blur }, uScene: { value: sceneRT.texture }, uDepth: { value: sceneRT.depthTexture },
      uRes: { value: new THREE.Vector2(W, H) }, uTexel: { value: new THREE.Vector2(1 / c.width, 1 / c.height) },
      uTime: { value: 0 }, uFlash: { value: 0 }, uRefr: { value: refr }, uFrost: { value: frost }, uGhost: { value: ghost },
      uBody: { value: body }, uTint: { value: new THREE.Vector3(...tint) }, uShadow: { value: shadow },
    };
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
      return { span, shadow: mk(SHADOW_FRAG, 1), glass: mk(GLASS_FRAG, 2), wPx: cl.w / scale, hPx: cl.h / scale, base: null };
    });
    this.pad = pad / scale;
  }

  // Read the DOM layout (call while the text is laid out; it may be transparent).
  layout() {
    for (const L of this.letters) {
      const r = L.span.getBoundingClientRect();
      L.base = { cx: r.left - this.pad + L.wPx / 2, cy: r.top - this.pad + L.hPx / 2 };
    }
  }

  // fx(i, letter) may return {dx,dy,dz (world), rx,ry,rz, op}; positions start on the z=0 text plane.
  update(t, { opacity = 1, flash = 0, fx = null } = {}) {
    this.shared.uTime.value = t; this.shared.uFlash.value = flash;
    const px0 = PX(0);
    this.letters.forEach((L, i) => {
      const o = fx ? fx(i, L) || {} : {};
      const op = opacity * (o.op ?? 1);
      const x = (L.base.cx - W / 2) / px0 + (o.dx || 0), y = (H / 2 - L.base.cy) / px0 + (o.dy || 0), z = o.dz || 0;
      for (const [mesh, k] of [[L.glass, 0], [L.shadow, 1]]) {
        mesh.visible = op > .002;
        mesh.material.uniforms.uOpacity.value = op;
        mesh.scale.set(L.wPx / px0, L.hPx / px0, 1);
        mesh.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
        mesh.position.set(x + k * 9 / px0, y - k * 13 / px0, z - k * .02);
      }
    });
  }
}
