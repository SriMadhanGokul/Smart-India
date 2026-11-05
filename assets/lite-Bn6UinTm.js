const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/mobile3d-pQIDxfZr.js","assets/logo-CeGCn0A7.js","assets/util-DIeFgw-V.js","assets/dim-BWz6MrNS.js","assets/ui-SEU51CHn.js"])))=>i.map(i=>d[i]);
import{_ as J}from"./preload-helper-BLxlCSKO.js";import{H as l,A as $,h as o,g as F,i as X,W as Z,R as H,F as B,j as y,S as P,b as V,d as ss,s as as}from"./util-DIeFgw-V.js";import{m as ts}from"./mark-DTuFeZM5.js";import{$ as r,a as m,i as is,w as es,o as ls,S as _}from"./ui-SEU51CHn.js";import{f as rs,w as os,m as ns,r as K,l as G}from"./blocks-Bqo9-Qdz.js";const N=t=>[...t].map(n=>`<span>${n==="&"?"&amp;":n}</span>`).join(""),E="<i></i><i></i><i></i><i></i><i></i>",ds=()=>`<div class="wipeb to-light" id="mMq" data-theme="dark" aria-label="Design. Develop. Deliver."><div class="wipe-in">
    <div class="mqt"><div class="mqt-in" id="mMqRow" aria-hidden="true">${[0,1].map(()=>y.map(t=>`${N(t)}<i>+</i>`).join("")).join("")}</div></div>
    <div class="slt">${E}</div>
  </div></div>`,cs=()=>{const t=y.map(n=>`<span>${n}</span><i aria-hidden="true">+</i>`).join("");return`<div class="l-mq" aria-label="Design. Develop. Deliver." data-theme="dark"><div class="l-mq-in" aria-hidden="true">${t}${t}${t}${t}</div></div>`},ps=()=>`<div class="m-wrap" id="mSvc" data-theme="light"><section class="m-stage" id="mSvcIn" aria-label="Our services">
    <div class="cap center m-lbl">Our services</div>
    <h2 class="m-words" id="mWords" aria-label="Design. Mobile and web application development.">${P.map(t=>`<div>${N(t)}</div>`).join("")}</h2>
    <div class="cap center m-b1"><span id="b1a">✦ Designed with intent. Built to grow.</span><span id="b1b">✦ Different services. One standard of craft.</span></div>
    <a class="btn roll m-vs" href="${o("services/")}"><span data-t="View services"></span><b>→</b></a>
    <div class="m-labs">${G()}</div>
    <div class="slt m-slt c-white">${E}</div>
  </section></div>`,vs=()=>`<section class="l-sec l-svc" aria-label="Our services" data-theme="dark">
    <div class="cap center rv">Our services</div>
    <h2 class="l-svwords rv">${P.join("<br>").replace(/&/g,"&amp;")}</h2>
    <div class="l-labs">${G()}</div>
    <a class="btn roll rv" href="${o("services/")}"><span data-t="View services"></span><b>→</b></a>
  </section>`,ms=()=>`<div class="m-wrap" id="mDim" data-theme="light"><section class="m-stage" id="dim" aria-label="Design in motion">
    <p class="p17 center m-dimtop">Concepts, applications and interface designs crafted for our clients.</p>
    <div class="fr c">
      <svg class="a" width="1920" height="868" style="left:0;top:0" aria-hidden="true"><path id="dimArc" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1.2"/></svg>
      <h2 class="a dimT" id="dimA" style="top:286px" aria-label="Design in motion"></h2>
      <div class="a dimT" id="dimB" style="top:462px" aria-hidden="true"></div>
      <div class="a center" id="dimS" style="left:791px;top:417px;width:340px">Exploring ideas through<br>daily design practice.</div>
      <div class="a" id="rib"><div id="ribIn"></div></div>
    </div>
    <a class="btn roll m-vs" href="${o("projects/")}"><span data-t="View portfolio"></span><b>→</b></a>
    <div class="slt m-slt c-dark">${E}</div>
  </section></div>`,hs=()=>`<section class="l-sec l-dim" aria-label="Design in motion" data-theme="light">
    <h2 class="rv">Design<br>in motion</h2>
    <p class="cap rv" style="margin-top:22px">Exploring ideas through<br>daily design practice.</p>
    <div class="l-grid" id="lGrid"></div>
    <p class="p17 rv">Concepts, applications and interface designs crafted for our clients.</p>
    <a class="btn roll rv" href="${o("projects/")}"><span data-t="View portfolio"></span><b>→</b></a>
  </section>`;async function ws({lenis:t,chrome:n,clock:w,loader:T,reduce:L,takeOver:U}){const d=document.documentElement.classList.contains("gl"),h=r("#lite");h.hidden=!1,r("#stageWrap")?.remove(),h.innerHTML=`
  <section class="l-sec l-hero" aria-label="Introduction" data-theme="dark">
    ${d?'<div class="m-flare" id="mFlare"></div>':`<div class="l-mark">${ts()}</div>`}
    <h1 class="l-h1 rv" aria-label="Designed to grow your business"><span aria-hidden="true">${l.line1}<br>${l.fixed}<span class="l-word" id="lWord"></span></span></h1>
    <div class="l-btns rv"><a class="btn roll" href="${o(F.discuss)}"><span data-t="Discuss your project"></span><b>→</b></a><a class="btn roll" href="${o(F.call)}"><span data-t="Book a free call"></span><b>→</b></a></div>
    <div class="l-meta rv">
      <div class="box2"><div class="c1"><span class="cap13">${l.est}</span></div><div class="cap13">${l.years}</div></div>
      <p class="p18">${l.blurb}</p>
    </div>
    <div class="cap l-hold rv">${l.hold}<br>${l.dare}</div>
    ${d?'<div class="heroDot l-dot rv" aria-hidden="true"><i></i></div>':""}
  </section>
  <section class="l-sec l-about" aria-label="About" data-theme="dark">
    <div class="cap rv">About</div>
    <p class="h89 l-big" id="lAbout"></p>
    <div class="l-cols">
      <div class="cap lh17 rv">${$.left}</div>
      <div class="rv"><p class="p18">${$.mission}</p><a class="btn roll" href="${o("about/")}"><span data-t="More about us"></span><b>→</b></a></div>
    </div>
    <div class="cap lh17 l-focus rv">${$.focus}</div>
  </section>
  ${d?ds():cs()}
  <section class="l-sec l-light" aria-label="Key facts" data-theme="light">
    <h2 class="h89 rv">Key facts</h2>
    <p class="p17 rv">A snapshot of our<br>experience and impact.</p>
    <div class="l-cards">${rs(!1)}</div>
    <div class="cap rv" style="margin-top:64px;color:#272727">Our clients</div>
    <div class="l-partners rv">${X.map(s=>`<span style="${s[1]}">${s[0]}</span>`).join("")}</div>
  </section>
  <section class="l-sec l-work" aria-label="Selected work" data-theme="light">
    <h2 class="h89 rv">Selected work<br>&amp; explorations</h2>
    <a class="btn roll rv" href="${o("projects/")}"><span data-t="View all projects"></span><b>→</b></a>
    <div class="l-wtrack">${Z.map(s=>os(s)).join("")}</div>
    <div class="l-disc center"><p class="h34 rv">Discover our complete collection of digital experiences, brands, and platforms.</p><a class="btn roll rv" href="${o("projects/")}"><span data-t="View all projects"></span><b>→</b></a></div>
  </section>
  ${d?ps():vs()}
  <section class="l-sec l-testi" aria-label="Client testimonials" id="lTesti" data-theme="light"></section>
  ${d?ms():hs()}`,ns(r("#lTesti"),!1);let R=[];if(d)R=H.map(s=>r("#ribIn").appendChild(K(s)));else{const s=r("#lGrid");H.slice(0,6).forEach(a=>{const e=K(a);e.classList.add("rv"),s.appendChild(e)}),new ResizeObserver(()=>{const a=s.firstElementChild;a&&s.style.setProperty("--k",(a.clientWidth/380).toFixed(4))}).observe(s)}m(".l-cards .kcard, .l-labs .lab, .l-wtrack .wcard, #lTesti > *").forEach(s=>s.classList.add("rv")),is(h);const f=r("#lWord");let D=0;const C=s=>{f.innerHTML=[...s].map(a=>`<span style="transition-delay:${(Math.random()*.3).toFixed(2)}s">${a}</span>`).join("")};C(l.words[0]),L||setInterval(()=>{f.classList.add("out"),setTimeout(()=>{D=(D+1)%l.words.length,C(l.words[D]),f.offsetWidth,f.classList.remove("out")},620)},3400);const j=r("#lAbout"),A=es(j,$.text),z=m(".l-cards .odo").map((s,a)=>({...ls(s,B[a].value,B[a].suffix),card:s.closest(".kcard"),t0:null})),p=r(".l-cards");if(d&&p.scrollWidth>p.clientWidth+8){const s=[...p.children];let a=0,e=!1;for(const c of["pointerdown","touchstart","wheel"])p.addEventListener(c,()=>{e=!0},{passive:!0,once:!0});setInterval(()=>{const c=p.getBoundingClientRect();e||document.hidden||c.bottom<0||c.top>innerHeight||(a=(a+1)%s.length,p.scrollTo({left:s[a].offsetLeft-(p.clientWidth-s[a].offsetWidth)/2,behavior:"smooth"}))},3600)}const M=new IntersectionObserver(s=>s.forEach(a=>{a.isIntersecting&&(a.target.classList.add("in"),M.unobserve(a.target))}),{rootMargin:"0px 0px -8% 0px",threshold:.12}),W=()=>m(".rv",h).forEach(s=>M.observe(s));let S=null;if(d)try{const{startMobile3D:s}=await J(async()=>{const{startMobile3D:a}=await import("./mobile3d-pQIDxfZr.js");return{startMobile3D:a}},__vite__mapDeps([0,1,2,3,4]));S=await s({mqSpans:m("#mMqRow > span"),svSpans:m("#mWords span"),perRep:y.join("").length,ribCards:R})}catch(s){console.error(s);try{sessionStorage.setItem("si-no3d","1"),location.reload();return}catch{}}const Q=[...m("[data-theme]",h),r("#footer")];let I=null;U(),w.ready=!0;let x=!1,O=!0;L&&(T.skip(),W(),x=!0);const q=s=>{t.raf(s);const a=Math.min(.1,w.tick(s)),e=w.T;!x&&T.frame(e)&&(x=!0,n.lock(!1),W()),S?.frame(s,e,a,t.scroll),O&&(O=!1,n.reveal());const c=innerHeight,u=j.getBoundingClientRect();if(u.bottom>0&&u.top<c){const i=V((c*.85-u.top)/(u.height+c*.25)),v=A.length;A.forEach((k,b)=>{const Y=V(i*v*1.15-b);_(k,"color",`rgba(216,216,216,${(.1+.9*Y).toFixed(3)})`)})}for(const i of z){if(i.t0==null)if(i.card.classList.contains("in"))i.t0=e;else continue;const v=e-i.t0;i.cols.forEach((k,b)=>_(k,"transform",`translateY(${(-(10+i.ds[b])*ss(as(v,.3+b*.12,1.8+b*.12))*46.875).toFixed(2)}px)`))}let g=!1;for(const i of Q){const v=i.getBoundingClientRect();if(v.top<=44&&v.bottom>44){g=i.dataset.theme!=="dark";break}}g!==I&&(I=g,n.nav.classList.toggle("lt",g)),requestAnimationFrame(q)};requestAnimationFrame(q)}export{ws as start};
