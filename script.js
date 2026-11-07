  const frases = [
    'Preciso de um cardápio digital com QR Code para a minha lanchonete.',
    'Quero um site profissional para o meu negócio.',
    'Como organizar o Instagram da minha clínica?',
    'As fotos dos meus produtos não mostram o que eles têm de melhor.'
  ];

  const VEL_DIGITAR = 38;   // ms por letra
  const PAUSA_LENDO = 2600; // ms com a frase completa na tela
  const VEL_APAGAR  = 14;   // ms por passo (apaga 2 letras por vez)
  const PAUSA_TROCA = 250;  // ms antes da próxima frase

  const el = document.getElementById('digita-texto');
  const espera = ms => new Promise(r => setTimeout(r, ms));

  async function digitar() {
    // quem prefere menos movimento vê só a primeira frase, parada
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = frases[0];
      return;
    }
    let i = 0;
    while (true) {
      const frase = frases[i];
      for (let c = 0; c <= frase.length; c++) {        // digita
        el.textContent = frase.slice(0, c);
        await espera(VEL_DIGITAR);
      }
      await espera(PAUSA_LENDO);
      for (let c = frase.length; c > 0; c -= 2) {      // apaga
        el.textContent = frase.slice(0, c);
        await espera(VEL_APAGAR);
      }
      el.textContent = '';
      await espera(PAUSA_TROCA);
      i = (i + 1) % frases.length;
    }
  }
  digitar();

(() => {
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 // Mobile menu
 const menu=$('#mobileMenu'), menuBtn=$('#menuBtn');
 menuBtn.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));menuBtn.textContent=open?'×':'☰'});
 $$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');menuBtn.textContent='☰'}));
 // Animação individual das descrições e textos de destaque em cada tópico
 const descriptionTargets=$$('.section-head p:last-child, .card-content p, .value p, .chips span, .contact-item, .contact-info>p');
 const descriptionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('desc-visible');descriptionObserver.unobserve(entry.target)}
 }),{threshold:.16,rootMargin:'0px 0px -25px 0px'});
 descriptionTargets.forEach((el,i)=>{el.classList.add('description-animate');el.style.setProperty('--desc-delay',(i%6)*85+'ms');descriptionObserver.observe(el)});
  // Como trabalhamos: cada etapa abre como banner e acende a constelação ao entrar na tela
 const banners=$$('.banner');
 const bannerObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   const idx=banners.indexOf(entry.target);
   // acende também as etapas anteriores, caso o visitante tenha rolado rápido
   for(let k=0;k<=idx;k++){
     banners[k].classList.add('in');
     if(k>0){banners[k].classList.add('link-top');banners[k-1].classList.add('link-bottom')}
   }
   banners.slice(0,idx+1).forEach(b=>bannerObserver.unobserve(b));
 }),{threshold:.35});
 banners.forEach(el=>bannerObserver.observe(el));

 // Scroll reveal
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});
 $$('.reveal').forEach((el,i)=>{el.style.transitionDelay=(i%3)*90+'ms';observer.observe(el)});
 // Carrossel manual: só se move por ação do visitante (setas, pontos, toque ou mouse)
 const rail=$('#carousel'), cards=$$('.service-card',rail), dots=$('#dots');
 rail.setAttribute('aria-roledescription','carrossel de serviços');
 let index=0, scrollTick=false, dragging=false, moved=false, startX=0, startScroll=0;
 function setActive(i){
   index=i;
   cards.forEach((c,n)=>c.classList.toggle('active',n===i));
   $$('#dots button').forEach((d,n)=>d.classList.toggle('active',n===i));
 }
 function nearestIndex(){
   const center=rail.getBoundingClientRect().left+rail.clientWidth/2;
   let best=0,dist=Infinity;
   cards.forEach((card,i)=>{const r=card.getBoundingClientRect(),d=Math.abs((r.left+r.width/2)-center);if(d<dist){dist=d;best=i}});
   setActive(best);
 }
 function go(i,instant){
   const target=Math.max(0,Math.min(cards.length-1,i));
   rail.scrollTo({left:cards[target].offsetLeft-rail.offsetLeft-rail.clientLeft-(rail.clientWidth-cards[target].offsetWidth)/2,behavior:instant?'auto':'smooth'});
   setActive(target);
 }
 cards.forEach((c,i)=>{
   const d=document.createElement('button');d.type='button';
   d.setAttribute('aria-label','Mostrar serviço '+(i+1));
   d.addEventListener('click',()=>go(i));dots.append(d);
 });
 $('#prev').addEventListener('click',()=>go(index-1));
 $('#next').addEventListener('click',()=>go(index+1));
 rail.addEventListener('keydown',e=>{
   if(e.key==='ArrowRight'){e.preventDefault();go(index+1)}
   else if(e.key==='ArrowLeft'){e.preventDefault();go(index-1)}
 });
 rail.addEventListener('scroll',()=>{
   if(!scrollTick){requestAnimationFrame(()=>{nearestIndex();scrollTick=false});scrollTick=true}
 },{passive:true});
 // Arrastar com mouse em computadores; no celular permanece o gesto nativo de deslizar.
 rail.addEventListener('pointerdown',e=>{
   if(e.pointerType!=='mouse')return;
   dragging=true;moved=false;startX=e.clientX;startScroll=rail.scrollLeft;rail.classList.add('dragging');
 });
 window.addEventListener('pointermove',e=>{
   if(!dragging)return;
   if(Math.abs(e.clientX-startX)>6)moved=true;
   rail.scrollLeft=startScroll-(e.clientX-startX);
 });
 window.addEventListener('pointerup',()=>{dragging=false;rail.classList.remove('dragging')});
 cards.forEach((c,i)=>c.addEventListener('click',e=>{
   if(moved){moved=false;e.preventDefault();return}
   if(!e.target.closest('a'))go(i);
 }));
 go(0,true);
 // Parallax nos destaques: acompanha a rolagem e, no desktop, o movimento do mouse.
 const parallaxItems=$$('.parallax-layer');
 const scenes=$$('.banner');
 const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let parallaxFrame=0, pointerX=0, pointerY=0;
 function updateParallax(){
   parallaxFrame=0;
   if(reduceMotion)return;
   const vh=window.innerHeight||1;
   scenes.forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;const p=(vh-r.top)/(vh+r.height);el.style.setProperty('--prog',Math.min(1,Math.max(0,p)).toFixed(3))});

   parallaxItems.forEach(el=>{
     const r=el.getBoundingClientRect();
     if(r.bottom < -120 || r.top > vh+120)return;
     const speed=Number(el.dataset.parallax||0), mouse=Number(el.dataset.mouse||0);
     const center=(r.top+r.height/2-vh/2)/vh;
     const py=Math.max(-30,Math.min(30,-center*speed*vh + pointerY*mouse*0.6));
     const px=pointerX*mouse;
     el.style.setProperty('--py',py.toFixed(1)+'px');
     el.style.setProperty('--px',px.toFixed(1)+'px');
   });
 }
 function requestParallax(){if(!parallaxFrame)parallaxFrame=requestAnimationFrame(updateParallax)}
 addEventListener('scroll',requestParallax,{passive:true});
 addEventListener('resize',requestParallax);
 if(matchMedia('(hover:hover) and (pointer:fine)').matches){
   addEventListener('pointermove',e=>{
     pointerX=(e.clientX/innerWidth-.5)*2;
     pointerY=(e.clientY/innerHeight-.5)*2;
     requestParallax();
   },{passive:true});
 }
 requestParallax();
 // Contact form -> WhatsApp
 $('#contactForm').addEventListener('submit',e=>{
   e.preventDefault();
   const f=new FormData(e.currentTarget);
   const servico=f.get('servico')||'a definir';
   const msg=`Olá! Sou ${f.get('nome')}. Meu negócio: ${f.get('negocio')}. Tenho interesse em: ${servico}.${f.get('mensagem')?' Mensagem: '+f.get('mensagem'):''}`;
   const win=window.open('https://wa.me/5522997023811?text='+encodeURIComponent(msg),'_blank');
    if(win){ try{ win.opener=null; }catch(err){} }
   const status=$('#formStatus');
   if(win){status.textContent='WhatsApp aberto! Se a aba não aparecer, permita pop-ups neste site.';setTimeout(()=>status.textContent='',7000)}
   else{status.textContent='Não foi possível abrir o WhatsApp. Use o botão verde no canto inferior direito.'}
 });
 // Cenas de público: dois segmentos por tela, revelados ao entrar na área visível.
 const chipLabels=$$('.chips span').map(el=>el.textContent.trim());
 const audienceGroups=[chipLabels.slice(0,2),chipLabels.slice(2,4),chipLabels.slice(4,6),chipLabels.slice(6,7)];
 const audienceTitles=['Negócios que recebem e vendem','Marcas que precisam se destacar','Profissionais que inspiram confiança','Ideias prontas para crescer'];
 const audienceCopy=['Apresentação visual, cardápios digitais e experiências simples para transformar visitas em pedidos.','Conteúdo consistente e comunicação visual para mostrar o valor de cada produto e serviço.','Presença digital profissional para facilitar o contato e fortalecer a credibilidade.','Estrutura digital para tirar projetos do papel e acompanhar a evolução do negócio.'];
 const audienceRoot=$('#audienceScenes');
 if(audienceRoot){
   audienceGroups.forEach((group,i)=>{
     const scene=document.createElement('article');scene.className='audience-scene';scene.dataset.index=String(i+1).padStart(2,'0');
     const inner=document.createElement('div');inner.className='audience-inner';
     const kicker=document.createElement('p');kicker.className='audience-kicker';kicker.textContent='L&I CRIATIVE STUDIO · QUEM ATENDEMOS';
     const title=document.createElement('h3');title.textContent=audienceTitles[i];
     const desc=document.createElement('p');desc.className='hero-copy';desc.textContent=audienceCopy[i];
     const tags=document.createElement('div');tags.className='audience-tags';
     group.forEach(label=>{const tag=document.createElement('span');tag.textContent=label;tags.append(tag)});
     inner.append(kicker,title,desc,tags);scene.append(inner);audienceRoot.append(scene);
   });
   if('IntersectionObserver' in window){
     const audienceObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');audienceObserver.unobserve(entry.target)}}),{threshold:.22});
     $$('.audience-scene').forEach(scene=>audienceObserver.observe(scene));
   }else $$('.audience-scene').forEach(scene=>scene.classList.add('visible'));
 }
 // Inclinação 3D dos cards no desktop; no toque, os cards mantêm navegação natural.
 if(matchMedia('(hover:hover) and (pointer:fine)').matches && !reduceMotion){
   $$('.service-card,.value').forEach(card=>{
     card.addEventListener('pointermove',e=>{
       const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
       card.style.transform=`perspective(900px) rotateX(${(0.5-y)*7}deg) rotateY(${(x-0.5)*9}deg) translateY(-5px) scale(1.015)`;
       card.style.setProperty('--shine-x',(x*100)+'%');
     });
     card.addEventListener('pointerleave',()=>{card.style.transform=''});
   });
   const heroArt=$('.hero-art');
   if(heroArt){heroArt.addEventListener('pointermove',e=>{const r=heroArt.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;heroArt.style.transform=`perspective(1100px) rotateY(${x*8}deg) rotateX(${-y*7}deg)`});heroArt.addEventListener('pointerleave',()=>heroArt.style.transform='')}
 }
 // zoom de profundidade suave nas cenas do processo, sincronizado à rolagem
 function updateSceneDepth(){
   if(reduceMotion)return;
   scenes.forEach(scene=>{const r=scene.getBoundingClientRect(),vh=innerHeight||1;if(r.bottom<0||r.top>vh)return;const progress=Math.max(0,Math.min(1,(vh-r.top)/(vh+r.height)));scene.style.setProperty('--scene-zoom',(1.08-progress*.08).toFixed(3))});
 }
 addEventListener('scroll',updateSceneDepth,{passive:true});addEventListener('resize',updateSceneDepth);updateSceneDepth();
 // year
 $('#year').textContent=new Date().getFullYear();
  // Fundo animado: constelação de estrelas contínua (sem formar a logo no fundo).
 const canvas=$('#particles'), ctx=canvas.getContext('2d');
 const sReduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const LINK=150, STAR='199,243,107', LINE='70,112,45';
 const rnd=(a,b)=>a+Math.random()*(b-a);
 let W=0,H=0,pts=[],lastNow=0;
 function build(){
   W=innerWidth; H=innerHeight;
   const dpr=Math.min(2,window.devicePixelRatio||1);
   canvas.width=W*dpr; canvas.height=H*dpr;
   canvas.style.width=W+'px'; canvas.style.height=H+'px';
   ctx.setTransform(dpr,0,0,dpr,0,0);
   pts=[];
   const n=sReduce?85:110;
   for(let i=0;i<n;i++) pts.push({x:Math.random()*W,y:Math.random()*H,vx:sReduce?0:rnd(-3,3),vy:sReduce?0:rnd(-3,3),r:rnd(.45,1.45),phase:Math.random()*6.28,speed:sReduce?0:rnd(.35,1.1),alpha:rnd(.25,.8)});
 }
 function frame(now){
   const dt=Math.min(.05,(now-(lastNow||now))/1000); lastNow=now;
   ctx.clearRect(0,0,W,H);
   for(const p of pts){
     p.x+=p.vx*dt; p.y+=p.vy*dt; p.phase+=p.speed*dt;
     if(p.x<-8)p.x=W+8; if(p.x>W+8)p.x=-8;
     if(p.y<-8)p.y=H+8; if(p.y>H+8)p.y=-8;
     p.alpha=.35+.45*(.5+.5*Math.sin(p.phase));
   }
   for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
     const a=pts[i],b=pts[j],d=Math.hypot(a.x-b.x,a.y-b.y);
     if(d<LINK){ctx.strokeStyle='rgba('+LINE+','+((1-d/LINK)*.42*Math.min(a.alpha,b.alpha))+')';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
   }
   for(const p of pts){ctx.fillStyle='rgba('+STAR+','+p.alpha+')';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
   if(!sReduce) requestAnimationFrame(frame);
 }
 addEventListener('resize',build); build();
 if(sReduce){frame(performance.now());}else requestAnimationFrame(frame);


})();

(() => {
 const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const rail = document.getElementById('carousel');
 const prevOld = document.getElementById('prev'), nextOld = document.getElementById('next'), dotsOld = document.getElementById('dots');
 if(!rail || !prevOld || !nextOld || !dotsOld) return;

 const cards=[...rail.querySelectorAll('.service-card')];
 const N=cards.length;
 const stage=document.createElement('div');
 stage.className='svc-stage'; stage.id='svcStage'; stage.tabIndex=0;
 stage.setAttribute('aria-label','Carrossel de serviços');
 cards.forEach(c=>stage.append(c));
 rail.replaceWith(stage);

 const prev=prevOld.cloneNode(true), next=nextOld.cloneNode(true);
 prevOld.replaceWith(prev); nextOld.replaceWith(next);
 const dotsWrap=document.createElement('div');
 dotsWrap.className='dots'; dotsWrap.id='svcDots'; dotsWrap.setAttribute('aria-label','Selecionar serviço');
 dotsOld.replaceWith(dotsWrap);
 const dots=cards.map((_,i)=>{ const b=document.createElement('button'); b.type='button'; b.setAttribute('aria-label','Serviço '+(i+1)); b.addEventListener('click',()=>go(i)); dotsWrap.append(b); return b; });

 let idx=0, x0=null, hover=false, inView=true;
 const vidOf=c=>c.querySelector('video.card-media');
 const wrapIdx=d=>{ d=((d%N)+N)%N; return d>N/2 ? d-N : d; };

 // toca só o vídeo do cartão ativo, e só quando está visível e o mouse não está em cima
 function syncPlay(){
   cards.forEach(c=>{
     const v=vidOf(c); if(!v) return;
     if(c.classList.contains('active') && inView && !hover && !reduce){
       v.play().catch(()=>{ // se o navegador bloquear, avança depois de um tempo
         setTimeout(()=>{ if(c.classList.contains('active') && inView && !hover) go(idx+1); },6000);
       });
     } else { v.pause(); }
   });
 }

 function render(){
   cards.forEach((c,i)=>{
     const d=wrapIdx(i-idx), ad=Math.abs(d);
     c.style.transform=`translate(calc(-50% + ${d*112}%),-50%) scale(${ad===0?1.03:ad===1?.9:.8}) rotateY(${d*-6}deg)`;
     c.style.opacity=String(ad===0?1:ad===1?.6:ad===2?.25:0);
     c.style.zIndex=String(10-ad);
     c.style.pointerEvents=ad>2?'none':'';
     c.classList.toggle('active', ad===0);
     const v=vidOf(c);
     if(v && ad!==0){ v.pause(); v.currentTime=0; }
   });
   dots.forEach((b,i)=>b.classList.toggle('active', i===idx));
   syncPlay();
 }
 function go(n){ idx=((n%N)+N)%N; render(); }

 cards.forEach((c,i)=>{
   const v=vidOf(c);
   // ao terminar o vídeo do cartão ativo, vai para o próximo (loop infinito)
   if(v) v.addEventListener('ended',()=>{ if(c.classList.contains('active')) go(idx+1); });
   c.addEventListener('click',e=>{ if(e.target.closest('a,button')) return; if(i!==idx) go(i); });
 });

 stage.addEventListener('mouseenter',()=>{ hover=true; syncPlay(); });
 stage.addEventListener('mouseleave',()=>{ hover=false; syncPlay(); });
 stage.addEventListener('focusin',()=>{ hover=true; syncPlay(); });
 stage.addEventListener('focusout',()=>{ hover=false; syncPlay(); });
 new IntersectionObserver(es=>{ inView=es[0].isIntersecting; syncPlay(); },{threshold:.3}).observe(stage);

 prev.addEventListener('click',()=>go(idx-1));
 next.addEventListener('click',()=>go(idx+1));
 stage.addEventListener('keydown',e=>{
   if(e.key==='ArrowRight'){ e.preventDefault(); go(idx+1); }
   else if(e.key==='ArrowLeft'){ e.preventDefault(); go(idx-1); }
 });
 stage.addEventListener('pointerdown',e=>{ x0=e.clientX; hover=true; syncPlay(); });
 stage.addEventListener('pointerup',e=>{ hover=false; if(x0===null) return; const dx=e.clientX-x0; x0=null; if(Math.abs(dx)>40) go(idx+(dx<0?1:-1)); else syncPlay(); });
 render();
})();

(() => {
 const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const hero = document.querySelector('.hero-art');
 if(!hero || reduce) return;
 const cv=document.createElement('canvas'); cv.className='hero-stars'; cv.setAttribute('aria-hidden','true');
 hero.prepend(cv);
 const ctx=cv.getContext('2d');
 let W=0,H=0,stars=[];
 const dpr=Math.min(2,window.devicePixelRatio||1);
 function size(){
   const r=hero.getBoundingClientRect(); W=r.width; H=r.height;
   cv.width=Math.max(1,W*dpr); cv.height=Math.max(1,H*dpr);
   ctx.setTransform(dpr,0,0,dpr,0,0);
   const n=Math.min(220,Math.round(W*H/1800));
   stars=Array.from({length:n},()=>({
     x:Math.random()*W, y:Math.random()*H,
     r:Math.random()*1.5+.4, vy:Math.random()*.22+.05, vx:(Math.random()-.5)*.05,
     tw:Math.random()*Math.PI*2, ts:Math.random()*.03+.012,
     warm:Math.random()<.35
   }));
 }
 function draw(){
   ctx.clearRect(0,0,W,H);
   for(const s of stars){
     s.y-=s.vy; s.x+=s.vx; s.tw+=s.ts;
     if(s.y<-4){ s.y=H+4; s.x=Math.random()*W; }
     const a=.3+.7*(.5+.5*Math.sin(s.tw));
     ctx.beginPath();
     ctx.fillStyle = s.warm ? `rgba(199,243,107,${a})` : `rgba(240,245,233,${a})`;
     ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
     if(s.r>1.4){
       ctx.strokeStyle=`rgba(199,243,107,${a*.5})`; ctx.lineWidth=.6;
       ctx.beginPath(); ctx.moveTo(s.x-s.r*3,s.y); ctx.lineTo(s.x+s.r*3,s.y); ctx.moveTo(s.x,s.y-s.r*3); ctx.lineTo(s.x,s.y+s.r*3); ctx.stroke();
     }
   }
   requestAnimationFrame(draw);
 }
 size(); window.addEventListener('resize',size); requestAnimationFrame(draw);
})();

(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const img=document.querySelector('.logo-img');
 const big=document.querySelector('.logo-big');
 if(!img||!big) return;
 if(reduce){ img.classList.add('on'); return; }

 const build=async()=>{
   try{ await img.decode(); }catch(e){}
   const sw=img.naturalWidth, sh=img.naturalHeight;
   if(!sw||!sh){ img.classList.add('on'); return; }

   /* 1) Amostra os pixels visíveis da logo: cada um vira uma partícula com a sua cor */
   const SW=220, SH=Math.round(SW*sh/sw);
   const off=document.createElement('canvas'); off.width=SW; off.height=SH;
   const octx=off.getContext('2d',{willReadFrequently:true});
   octx.drawImage(img,0,0,SW,SH);
   const data=octx.getImageData(0,0,SW,SH).data;
   let pts=[];
   for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
     const i=(y*SW+x)*4;
     if(data[i+3]>200) pts.push([x,y,data[i],data[i+1],data[i+2]]);
   }
   const MAX=1700;
   if(pts.length>MAX){ const step=pts.length/MAX, sel=[]; for(let k=0;k<MAX;k++) sel.push(pts[Math.floor(k*step)]); pts=sel; }

   /* 2) Tela de partículas centralizada sobre a logo */
   const r=img.getBoundingClientRect();
   const IW=r.width, IH=r.height;
   const CW=IW*1.9, CH=IH*1.9;
   const cv=document.createElement('canvas');
   cv.className='logo-burst';
   const dpr=Math.min(2,window.devicePixelRatio||1);
   cv.style.width=CW+'px'; cv.style.height=CH+'px';
   cv.width=Math.round(CW*dpr); cv.height=Math.round(CH*dpr);
   big.append(cv);
   const ctx=cv.getContext('2d');
   ctx.setTransform(dpr,0,0,dpr,0,0);
   ctx.globalCompositeOperation='lighter';

   const cx=CW/2, cy=CH/2;
   const P=pts.map(([x,y,R,G,B])=>{
     const ang=Math.random()*Math.PI*2, sp=280+Math.random()*360;
     return {
       hx:cx+((x/SW)-0.5)*IW, hy:cy+((y/SH)-0.5)*IH,
       x:cx, y:cy, vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp,
       d:Math.random()*0.45, s:0.9+Math.random()*0.9, col:`${R},${G},${B}`
     };
   });

   /* 3) Explosão do centro -> partículas se unem até o formato da logo */
   const T0=performance.now(); let last=T0;
   const TOTAL=3.8;
   function frame(now){
     const t=Math.max(0,(now-T0)/1000);
     const dt=Math.min(0.033,(now-last)/1000); last=now;
     ctx.clearRect(0,0,CW,CH);
     if(t<0.9){
       const k=t/0.9;
       ctx.strokeStyle=`rgba(199,243,107,${0.5*(1-k)})`;
       ctx.lineWidth=2*(1-k)+0.5;
       ctx.beginPath(); ctx.arc(cx,cy,k*Math.min(CW,CH)*0.5,0,Math.PI*2); ctx.stroke();
     }
     for(const p of P){
       const lt=t-p.d;
       if(lt<0) continue;
       if(lt<0.8){
         const f=Math.exp(-dt*2.4);
         p.vx*=f; p.vy*=f;
         p.x+=p.vx*dt; p.y+=p.vy*dt;
       } else {
         const K=70, C=10;
         const ax=(p.hx-p.x)*K-p.vx*C, ay=(p.hy-p.y)*K-p.vy*C;
         p.vx+=ax*dt; p.vy+=ay*dt;
         p.x+=p.vx*dt; p.y+=p.vy*dt;
       }
       const a=Math.min(1,lt/0.2);
       ctx.fillStyle=`rgba(${p.col},${a})`;
       ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,Math.PI*2); ctx.fill();
     }
     if(t<TOTAL) requestAnimationFrame(frame);
     else finish();
   }
   function finish(){
     img.classList.add('on');
     cv.style.opacity='0';
     setTimeout(()=>cv.remove(),1000);
   }
   requestAnimationFrame(frame);
 };
 setTimeout(()=>build().catch(()=>img.classList.add('on')),400);
})();

(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 /* Ajuste 9:16: vídeos horizontais ficam inteiros dentro do quadro, sem cortes */
 document.querySelectorAll('.reel-slide video').forEach(v=>{
   const mark=()=>{ if(v.videoWidth && v.videoHeight && v.videoWidth/v.videoHeight>1) v.parentElement.classList.add('wide'); };
   v.addEventListener('loadedmetadata',mark); if(v.readyState>=1) mark();
 });

 const wrap=document.getElementById('vidWrap'), stage=document.getElementById('vidReel');
 if(!wrap||!stage) return;
 const slides=[...stage.querySelectorAll('.reel-slide')];
 const N=slides.length;
 const prevB=document.getElementById('vidPrev'), nextB=document.getElementById('vidNext'), dotsW=document.getElementById('vidDots');
 const dots=slides.map((_,i)=>{ const b=document.createElement('button'); b.type='button'; b.setAttribute('aria-label','Ir para o vídeo '+(i+1)); b.addEventListener('click',()=>go(i)); dotsW.append(b); return b; });
 let idx=0, hover=false, inView=true, x0=null;
 const wrapIdx=d=>{ d=((d%N)+N)%N; return d>N/2 ? d-N : d; };
 function render(){
   slides.forEach((s,i)=>{
     const d=wrapIdx(i-idx), ad=Math.abs(d);
     s.style.transform=`translate(calc(-50% + ${d*104}%),-50%) scale(${ad===0?1:ad===1?.86:.72})`;
     s.style.opacity=String(ad===0?1:ad===1?.5:ad===2?.2:0);
     s.style.zIndex=String(10-ad);
     s.style.pointerEvents=ad>2?'none':'';
     s.classList.toggle('is-active',ad===0);
     const v=s.querySelector('video');
     if(v){ if(ad===0 && !reduce) v.play().catch(()=>{}); else v.pause(); }
   });
   dots.forEach((b,i)=>b.setAttribute('aria-current', i===idx?'true':'false'));
 }
 function go(n){ idx=((n%N)+N)%N; render(); }
 prevB.addEventListener('click',()=>go(idx-1));
 nextB.addEventListener('click',()=>go(idx+1));
 wrap.addEventListener('mouseenter',()=>hover=true);
 wrap.addEventListener('mouseleave',()=>hover=false);
 wrap.addEventListener('focusin',()=>hover=true);
 wrap.addEventListener('focusout',()=>hover=false);
 new IntersectionObserver(es=>{ inView=es[0].isIntersecting; },{threshold:.2}).observe(wrap);
 wrap.addEventListener('pointerdown',e=>{ x0=e.clientX; });
 wrap.addEventListener('pointerup',e=>{ if(x0===null) return; const dx=e.clientX-x0; x0=null; if(Math.abs(dx)>40) go(idx+(dx<0?1:-1)); });
 if(!reduce) setInterval(()=>{ if(inView && !hover) go(idx+1); },5000);
 render();
})();

(() => {
 const d=document.getElementById('priv-details');
 if(!d) return;
 const abre=()=>{ if(location.hash==='#privacidade') d.open=true; };
 abre();
 window.addEventListener('hashchange',abre);
 document.querySelectorAll('a[href="#privacidade"]').forEach(a=>a.addEventListener('click',()=>{ d.open=true; }));
})();

(() => {
 const d=document.getElementById('faq-details');
 if(!d) return;
 const abre=()=>{ if(location.hash==='#faq') d.open=true; };
 abre(); window.addEventListener('hashchange',abre);
 document.querySelectorAll('a[href="#faq"]').forEach(a=>a.addEventListener('click',()=>{ d.open=true; }));
})();
