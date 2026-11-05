import{$ as c,H as e,C as O,A as v,b as f,c as I,W as G,d as q,R as U,a as b,i as K,w as N,o as V,e as M,f as z,g as P,h as B,j as Q,s as Y}from"./ui-Cn6HRK0o.js";import{f as Z,w as _,l as J,m as X,r as ss,a as as}from"./loader-BFTIi7Ru.js";function ts(){const h=l=>"M"+l.map(([o,r])=>`${o} ${-r}`).join(" L")+" Z",i=P.map(h);return`<svg viewBox="-1.6 -1.6 3.2 3.2" aria-hidden="true"><defs>
    <linearGradient id="lmB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2a31"/><stop offset=".5" stop-color="#0e0e12"/><stop offset="1" stop-color="#050506"/></linearGradient>
    <linearGradient id="lmF" gradientUnits="userSpaceOnUse" x1="-1.6" y1="-1.6" x2="1.6" y2="1.6">
      <stop offset=".40" stop-color="#ff5a14" stop-opacity="0"/><stop offset=".48" stop-color="#ff6a1f" stop-opacity=".75"/><stop offset=".5" stop-color="#ffc08a" stop-opacity="1"/>
      <stop offset=".52" stop-color="#ff6a1f" stop-opacity=".75"/><stop offset=".60" stop-color="#ff5a14" stop-opacity="0"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-3.2 -3.2; 3.2 3.2" dur="5.5s" repeatCount="indefinite"/></linearGradient></defs>
    ${i.map(l=>`<path d="${l}" fill="url(#lmB)" stroke="rgba(255,110,40,.55)" stroke-width=".018" stroke-linejoin="round"/>`).join("")}
    ${i.map(l=>`<path d="${l}" fill="url(#lmF)" style="mix-blend-mode:screen"/>`).join("")}</svg>`}function os({lenis:h,chrome:i,reduce:l}){const o=c("#lite");o.hidden=!1;const r=z.map(s=>`<span>${s}</span><i aria-hidden="true">+</i>`).join("");o.innerHTML=`
  <section class="l-sec l-hero" aria-label="Introduction">
    <div class="l-mark"><div class="glow"></div>${ts()}</div>
    <h1 class="l-h1 rv" aria-label="Designed to grow your business"><span aria-hidden="true">${e.line1}<br>${e.fixed}<span class="l-word" id="lWord"></span></span></h1>
    <div class="l-btns rv"><a class="btn roll" href="${O.contactUrl}"><span data-t="Discuss your project"></span><b>→</b></a><a class="btn roll callBtn" href="tel:${O.tel}"><span data-t="Book a free call"></span><b>→</b></a></div>
    <div class="l-meta rv">
      <div class="box2"><div class="c1"><span class="cap13">${e.est}</span></div><div class="cap13">${e.years}</div></div>
      <p class="p18">${e.blurb}</p>
    </div>
    <div class="cap l-hold rv">${e.hold}<br>${e.dare}</div>
  </section>
  <section class="l-sec l-about" aria-label="About">
    <div class="cap rv">About</div>
    <p class="h89 l-big" id="lAbout"></p>
    <div class="l-cols">
      <div class="cap lh17 rv">${v.left}</div>
      <div class="rv"><p class="p18">${v.mission}</p><a class="btn roll" href="${f}/about"><span data-t="More about us"></span><b>→</b></a></div>
    </div>
    <div class="cap lh17 l-focus rv">${v.focus}</div>
  </section>
  <div class="l-mq" aria-label="Design. Develop. Deliver."><div class="l-mq-in" aria-hidden="true">${r}${r}${r}${r}</div></div>
  <section class="l-sec l-light" aria-label="Key facts">
    <h2 class="h89 rv">Key facts</h2>
    <p class="p17 rv">A snapshot of our<br>experience and impact.</p>
    <div class="l-cards">${Z(!1)}</div>
    <div class="cap rv" style="margin-top:64px;color:#272727">Our clients</div>
    <div class="l-partners rv">${I.map(s=>`<span style="${s[1]}">${s[0]}</span>`).join("")}</div>
  </section>
  <section class="l-sec l-work" aria-label="Selected work">
    <h2 class="h89 rv">Selected work<br>&amp; explorations</h2>
    <a class="btn roll rv" href="${f}/projects"><span data-t="View all projects"></span><b>→</b></a>
    <div class="l-wtrack">${G.map(s=>_(s)).join("")}</div>
  </section>
  <section class="l-sec l-svc" aria-label="Our services">
    <div class="cap center rv">Our services</div>
    <h2 class="l-svwords rv">${q.join("<br>").replace(/&/g,"&amp;")}</h2>
    <div class="l-labs">${J()}</div>
    <a class="btn roll rv" href="${f}/services"><span data-t="View services"></span><b>→</b></a>
  </section>
  <section class="l-sec l-testi" aria-label="Client testimonials" id="lTesti"></section>
  <section class="l-sec l-dim" aria-label="Design in motion">
    <h2 class="rv">Design<br>in motion</h2>
    <p class="cap rv" style="margin-top:22px">Exploring ideas through<br>daily design practice.</p>
    <div class="l-grid" id="lGrid"></div>
    <p class="p17 rv">Concepts, applications and interface designs crafted for our clients.</p>
    <a class="btn roll rv" href="${f}/projects"><span data-t="View portfolio"></span><b>→</b></a>
  </section>`,X(c("#lTesti"),!1);const d=c("#lGrid");U.slice(0,6).forEach(s=>{const a=ss(s);a.classList.add("rv"),d.appendChild(a)}),new ResizeObserver(()=>{const s=d.firstElementChild;s&&d.style.setProperty("--k",(s.clientWidth/380).toFixed(4))}).observe(d),b(".l-cards .kcard, .l-labs .lab, .l-wtrack .wcard, #lTesti > *").forEach(s=>s.classList.add("rv")),K(o);const p=c("#lWord");let u=0;const y=s=>{p.innerHTML=[...s].map(a=>`<span style="transition-delay:${(Math.random()*.3).toFixed(2)}s">${a}</span>`).join("")};y(e.words[0]),l||setInterval(()=>{p.classList.add("out"),setTimeout(()=>{u=(u+1)%e.words.length,y(e.words[u]),p.offsetWidth,p.classList.remove("out")},620)},3400);const x=c("#lAbout"),k=N(x,v.text),S=b(".l-cards .odo").map((s,a)=>({...V(s,M[a].value,M[a].suffix),card:s.closest(".kcard"),t0:null})),T=new IntersectionObserver(s=>s.forEach(a=>{a.isIntersecting&&(a.target.classList.add("in"),T.unobserve(a.target))}),{rootMargin:"0px 0px -8% 0px",threshold:.12}),L=()=>b(".rv",o).forEach(s=>T.observe(s)),F=b(".l-light, .l-work, .l-testi, .l-dim",o);let E=null;const C=as();let H=performance.now(),m=!1;l?(C.skip(),L(),m=!0):i.lock(!0);const A=s=>{h.raf(s);const a=(s-H)/1e3;!m&&C.frame(a)&&(m=!0,i.lock(!1),L());const R=innerHeight,j=x.getBoundingClientRect(),W=B((R*.85-j.top)/(j.height+R*.25)),D=k.length;k.forEach((t,n)=>{const g=B(W*D*1.15-n);t.style.color=`rgba(216,216,216,${(.1+.9*g).toFixed(3)})`});for(const t of S){if(t.t0==null)if(t.card.classList.contains("in"))t.t0=a;else continue;const n=a-t.t0;t.cols.forEach((g,w)=>{g.style.transform=`translateY(${(-(10+t.ds[w])*Q(Y(n,.3+w*.12,1.8+w*.12))*46.875).toFixed(2)}px)`})}const $=F.some(t=>{const n=t.getBoundingClientRect();return n.top<44&&n.bottom>44});$!==E&&(E=$,i.nav.classList.toggle("lt",$)),requestAnimationFrame(A)};requestAnimationFrame(A)}export{os as startLite};
