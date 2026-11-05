import{H as l,A as p,h as i,g as M,i as V,W as K,S as G,R as N,F as S,j as U,b as W,d as z,s as P}from"./util-kqe-r8ua.js";import{m as Q}from"./mark-DB-y1u2-.js";import{$ as o,a as v,i as Y,w as _,o as J}from"./ui-LUlElLsz.js";import{f as X,w as Z,l as ss,m as as,r as ts}from"./blocks-DC8z-enS.js";function os({lenis:j,chrome:b,clock:f,loader:w,reduce:x,takeOver:D}){const r=o("#lite");r.hidden=!1;const c=U.map(s=>`<span>${s}</span><i aria-hidden="true">+</i>`).join("");r.innerHTML=`
  <section class="l-sec l-hero" aria-label="Introduction">
    <div class="l-mark">${Q()}</div>
    <h1 class="l-h1 rv" aria-label="Designed to grow your business"><span aria-hidden="true">${l.line1}<br>${l.fixed}<span class="l-word" id="lWord"></span></span></h1>
    <div class="l-btns rv"><a class="btn roll" href="${i(M.discuss)}"><span data-t="Discuss your project"></span><b>→</b></a><a class="btn roll" href="${i(M.call)}"><span data-t="Book a free call"></span><b>→</b></a></div>
    <div class="l-meta rv">
      <div class="box2"><div class="c1"><span class="cap13">${l.est}</span></div><div class="cap13">${l.years}</div></div>
      <p class="p18">${l.blurb}</p>
    </div>
    <div class="cap l-hold rv">${l.hold}<br>${l.dare}</div>
  </section>
  <section class="l-sec l-about" aria-label="About">
    <div class="cap rv">About</div>
    <p class="h89 l-big" id="lAbout"></p>
    <div class="l-cols">
      <div class="cap lh17 rv">${p.left}</div>
      <div class="rv"><p class="p18">${p.mission}</p><a class="btn roll" href="${i("about/")}"><span data-t="More about us"></span><b>→</b></a></div>
    </div>
    <div class="cap lh17 l-focus rv">${p.focus}</div>
  </section>
  <div class="l-mq" aria-label="Design. Develop. Deliver."><div class="l-mq-in" aria-hidden="true">${c}${c}${c}${c}</div></div>
  <section class="l-sec l-light" aria-label="Key facts">
    <h2 class="h89 rv">Key facts</h2>
    <p class="p17 rv">A snapshot of our<br>experience and impact.</p>
    <div class="l-cards">${X(!1)}</div>
    <div class="cap rv" style="margin-top:64px;color:#272727">Our clients</div>
    <div class="l-partners rv">${V.map(s=>`<span style="${s[1]}">${s[0]}</span>`).join("")}</div>
  </section>
  <section class="l-sec l-work" aria-label="Selected work">
    <h2 class="h89 rv">Selected work<br>&amp; explorations</h2>
    <a class="btn roll rv" href="${i("projects/")}"><span data-t="View all projects"></span><b>→</b></a>
    <div class="l-wtrack">${K.map(s=>Z(s)).join("")}</div>
  </section>
  <section class="l-sec l-svc" aria-label="Our services">
    <div class="cap center rv">Our services</div>
    <h2 class="l-svwords rv">${G.join("<br>").replace(/&/g,"&amp;")}</h2>
    <div class="l-labs">${ss()}</div>
    <a class="btn roll rv" href="${i("services/")}"><span data-t="View services"></span><b>→</b></a>
  </section>
  <section class="l-sec l-testi" aria-label="Client testimonials" id="lTesti"></section>
  <section class="l-sec l-dim" aria-label="Design in motion">
    <h2 class="rv">Design<br>in motion</h2>
    <p class="cap rv" style="margin-top:22px">Exploring ideas through<br>daily design practice.</p>
    <div class="l-grid" id="lGrid"></div>
    <p class="p17 rv">Concepts, applications and interface designs crafted for our clients.</p>
    <a class="btn roll rv" href="${i("projects/")}"><span data-t="View portfolio"></span><b>→</b></a>
  </section>`,as(o("#lTesti"),!1);const n=o("#lGrid");N.slice(0,6).forEach(s=>{const a=ts(s);a.classList.add("rv"),n.appendChild(a)}),new ResizeObserver(()=>{const s=n.firstElementChild;s&&n.style.setProperty("--k",(s.clientWidth/380).toFixed(4))}).observe(n),v(".l-cards .kcard, .l-labs .lab, .l-wtrack .wcard, #lTesti > *").forEach(s=>s.classList.add("rv")),Y(r);const d=o("#lWord");let h=0;const y=s=>{d.innerHTML=[...s].map(a=>`<span style="transition-delay:${(Math.random()*.3).toFixed(2)}s">${a}</span>`).join("")};y(l.words[0]),x||setInterval(()=>{d.classList.add("out"),setTimeout(()=>{h=(h+1)%l.words.length,y(l.words[h]),d.offsetWidth,d.classList.remove("out")},620)},3400);const E=o("#lAbout"),T=_(E,p.text),F=v(".l-cards .odo").map((s,a)=>({...J(s,S[a].value,S[a].suffix),card:s.closest(".kcard"),t0:null})),L=new IntersectionObserver(s=>s.forEach(a=>{a.isIntersecting&&(a.target.classList.add("in"),L.unobserve(a.target))}),{rootMargin:"0px 0px -8% 0px",threshold:.12}),k=()=>v(".rv",r).forEach(s=>L.observe(s)),I=v(".l-light, .l-work, .l-testi, .l-dim",r);let A=null;D(),f.ready=!0;let u=!1,C=!0;x&&(w.skip(),k(),u=!0);const R=s=>{j.raf(s),f.tick(s);const a=f.T;!u&&w.frame(a)&&(u=!0,b.lock(!1),k()),C&&(C=!1,b.reveal());const O=innerHeight,H=E.getBoundingClientRect(),B=W((O*.85-H.top)/(H.height+O*.25)),q=T.length;T.forEach((t,e)=>{const $=W(B*q*1.15-e);t.style.color=`rgba(216,216,216,${(.1+.9*$).toFixed(3)})`});for(const t of F){if(t.t0==null)if(t.card.classList.contains("in"))t.t0=a;else continue;const e=a-t.t0;t.cols.forEach(($,g)=>{$.style.transform=`translateY(${(-(10+t.ds[g])*z(P(e,.3+g*.12,1.8+g*.12))*46.875).toFixed(2)}px)`})}const m=I.some(t=>{const e=t.getBoundingClientRect();return e.top<44&&e.bottom>44});m!==A&&(A=m,b.nav.classList.toggle("lt",m)),requestAnimationFrame(R)};requestAnimationFrame(R)}export{os as start};
