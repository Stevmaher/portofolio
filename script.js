// The same initializer powers the plain site and the hosted preview. No libraries.
function initPortfolio(root, spriteSources) {
  if (!root) return () => {};
  const controller = new AbortController(), opts = { signal: controller.signal };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const cleanups = [];
  const select = s => root.querySelector(s);
  const all = s => Array.from(root.querySelectorAll(s));
  const menu = select('#pf-menu'), menuButton = select('.pf-menu-button');
  function closeMenu() { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); }
  menuButton.addEventListener('click', () => { menu.hidden = !menu.hidden; menuButton.setAttribute('aria-expanded', String(!menu.hidden)); }, opts);
  root.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); }, opts);
  all('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const target = select(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault(); closeMenu();
    const top = target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
    root.scrollTo({ top: Math.max(0, top - (target.id === 'top' ? 0 : 120)), behavior: reduced.matches ? 'instant' : 'smooth' });
  }, opts));
  all('[data-portrait]').forEach(img => {
    const loaded = () => { img.hidden = false; };
    img.addEventListener('load', loaded, opts);
    if (img.complete && img.naturalWidth) loaded();
  });
  all('[data-open]').forEach(button => button.addEventListener('click', () => {
    const dialog = select('#pf-dialog-' + button.dataset.open);
    if (dialog && !dialog.open) dialog.showModal();
  }, opts));
  all('.pf-dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close(), opts);
    dialog.addEventListener('click', e => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close(); } }, opts);
  });
  select('form').addEventListener('submit', e => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const url = 'mailto:estevanmaher5@gmail.com?subject=' + encodeURIComponent('Portfolio message from ' + f.get('name')) + '&body=' + encodeURIComponent(f.get('message') + '\n\nFrom: ' + f.get('name') + ' (' + f.get('email') + ')');
    const link = document.createElement('a'); link.href = url; link.target = '_blank'; link.rel = 'noopener'; link.click();
  }, opts);
  if ('IntersectionObserver' in window && !reduced.matches) {
    root.classList.add('pf-motion');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('pf-visible'); observer.unobserve(entry.target); }
    }), { root, threshold: .12, rootMargin: '0px 0px -24px 0px' });
    all('.pf-reveal').forEach(el => observer.observe(el));
    cleanups.push(() => observer.disconnect());
  }
  // Split the hero title into per-letter windows for the staggered entrance,
  // like the reference site's display title.
  let letterIndex = 0;
  all('.pf-title-line').forEach(line => {
    const text = line.textContent;
    line.setAttribute('aria-hidden', 'true');
    line.textContent = '';
    Array.from(text).forEach(ch => {
      const w = document.createElement('span'); w.className = 'pf-lw';
      const l = document.createElement('span'); l.className = 'pf-l';
      l.style.setProperty('--i', letterIndex++);
      l.textContent = ch;
      w.appendChild(l); line.appendChild(w);
    });
  });
  // Portrait journey: a single card travels from the hero anchor down to the
  // biography figure while scrolling, growing and flipping over on the way,
  // like the reference site. The static anchors stay as the no-motion fallback.
  let scrollFrame = 0;
  const main = select('main');
  const heroAnchor = select('.pf-intro-portrait');
  const bioFigure = select('.pf-bio-portrait');
  if (!reduced.matches && main && heroAnchor && bioFigure) {
    const journey = document.createElement('div'); journey.className = 'pf-journey'; journey.setAttribute('aria-hidden', 'true');
    const stage = document.createElement('div'); stage.className = 'pf-journey-stage';
    const card = document.createElement('div'); card.className = 'pf-journey-card';
    const front = document.createElement('div'); front.className = 'pf-journey-face'; front.innerHTML = heroAnchor.innerHTML;
    const back = front.cloneNode(true); back.classList.add('pf-back');
    card.append(front, back); stage.appendChild(card); journey.appendChild(stage); main.prepend(journey);
    root.classList.add('pf-journey-on');
    const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const lerp = (a, b, t) => a + (b - a) * t;
    const t0 = performance.now();
    let raf = 0, lastY = -1, cur = null;
    const apply = () => {
      raf = 0;
      const mainRect = main.getBoundingClientRect();
      const stageH = root.clientHeight;
      const hr = heroAnchor.getBoundingClientRect(), br = bioFigure.getBoundingClientRect();
      const heroDoc = { x: hr.left - mainRect.left, y: hr.top - mainRect.top, w: hr.width, h: hr.height };
      const bioDoc = { x: br.left - mainRect.left, y: br.top - mainRect.top, w: br.width, h: br.height };
      const journeyH = bioDoc.y + bioDoc.h;
      journey.style.height = journeyH + 'px';
      stage.style.height = stageH + 'px';
      const range = Math.max(journeyH - stageH, 1);
      const s = root.scrollTop;
      const p = Math.min(Math.max(s / range, 0), 1);
      const e = easeInOut(p);
      const stageTop = Math.min(Math.max(s, 0), range);
      const k = easeOut(Math.min(Math.max((performance.now() - t0 - 450) / 1000, 0), 1));
      const target = {
        x: lerp(heroDoc.x, bioDoc.x, e),
        y: lerp(heroDoc.y, bioDoc.y, e) - stageTop + (1 - k) * 36,
        w: lerp(heroDoc.w, bioDoc.w, e),
        h: lerp(heroDoc.h, bioDoc.h, e),
        r: lerp(7, 12, e),
        rot: 180 * e
      };
      if (!cur) cur = { ...target };
      let still = s === lastY && k >= 1;
      for (const key of ['x', 'y', 'w', 'h', 'r', 'rot']) {
        const d = target[key] - cur[key];
        if (Math.abs(d) > .05) still = false;
        cur[key] += d * .22;
      }
      card.style.left = cur.x + 'px'; card.style.top = cur.y + 'px';
      card.style.width = cur.w + 'px'; card.style.height = cur.h + 'px';
      card.style.borderRadius = cur.r + 'px';
      card.style.transform = 'perspective(1200px) rotateY(' + cur.rot + 'deg)';
      card.style.opacity = k;
      lastY = s;
      if (!still) raf = requestAnimationFrame(apply);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(apply); };
    root.addEventListener('scroll', kick, { ...opts, passive: true });
    window.addEventListener('resize', kick, opts);
    apply();
    cleanups.push(() => cancelAnimationFrame(raf));
  }
  // Experience roadmap: draw the winding road through the stop markers, then
  // ink it when the section scrolls into view, like the reference site.
  const roadmap = select('.pf-roadmap');
  if (roadmap) {
    const buildRoad = () => {
      const svg = roadmap.querySelector('.pf-road');
      if (!svg || getComputedStyle(svg).display === 'none') return;
      const rm = roadmap.getBoundingClientRect();
      const pts = all('.pf-stop').map(st => { const m = st.querySelector('.pf-stop-marker').getBoundingClientRect(); return { x: m.left - rm.left + m.width / 2, y: m.top - rm.top + m.height / 2 }; });
      if (pts.length < 2 || !rm.width) return;
      let d = 'M ' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
      for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], mx = (a.x + b.x) / 2; d += ' C ' + mx.toFixed(1) + ' ' + a.y.toFixed(1) + ', ' + mx.toFixed(1) + ' ' + b.y.toFixed(1) + ', ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1); }
      svg.setAttribute('viewBox', '0 0 ' + rm.width.toFixed(1) + ' ' + rm.height.toFixed(1));
      svg.querySelectorAll('path').forEach(pa => pa.setAttribute('d', d));
    };
    buildRoad();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildRoad);
    window.addEventListener('resize', buildRoad, opts);
    if ('IntersectionObserver' in window) {
      const roadObserver = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { roadmap.setAttribute('data-drawn', 'true'); roadObserver.disconnect(); } }, { root, threshold: .25 });
      roadObserver.observe(roadmap);
      cleanups.push(() => roadObserver.disconnect());
    } else roadmap.setAttribute('data-drawn', 'true');
  }
  // Hero code spotlight: a brighter layer of code snippets over the faint
  // static background, revealed through a soft mask that follows the cursor,
  // like the reference video.
  const intro = select('.pf-intro');
  if (intro && fine.matches && !reduced.matches) {
    const reveal = document.createElement('div');
    reveal.className = 'pf-code-reveal';
    reveal.setAttribute('aria-hidden', 'true');
    const snippets = [
      "const developer = {", "  name: 'Estevan Maher',", "  role: 'front-end',", "  city: 'Alexandria',", "};",
      "function build(idea) {", "  return create(idea);", "}",
      "const stack = ['HTML',", "  'CSS', 'JavaScript'];", "stack.map(learn);",
      "fetch('/projects')", "  .then(res => res.json())", "  .then(render);",
      '<section id="hero">', "  <h1>Front-end</h1>", "</section>",
      ":root {", "  --ink: #f6f5f2;", "  --bg: #191818;", "}",
      "let focus = true;", "while (focus) { ship(); }", "// build. learn. repeat.",
      "cells.forEach(cell =>", "  cell.fadeIn());", "export default App;",
      "addEventListener('move',", "  e => reveal(e.x, e.y));", "requestAnimationFrame(draw);"
    ];
    [[0, 0], [21, 70], [43, 15], [64, 90], [85, 35]].forEach((c, ci) => {
      const pre = document.createElement('pre');
      const out = [];
      for (let i = 0; i < 15; i++) out.push(snippets[(ci * 7 + i * 3) % snippets.length]);
      pre.textContent = out.join('\n');
      pre.style.left = c[0] + '%';
      pre.style.top = c[1] + 'px';
      reveal.appendChild(pre);
    });
    intro.prepend(reveal);
    let htx = 0, hty = 0, hcx = 0, hcy = 0, hact = 0, hgoal = 0, hraf = 0, hstarted = false;
    const hloop = () => {
      hraf = 0;
      hcx += (htx - hcx) * .18; hcy += (hty - hcy) * .18;
      hact += (hgoal - hact) * .14;
      reveal.style.setProperty('--mx', hcx.toFixed(1) + 'px');
      reveal.style.setProperty('--my', hcy.toFixed(1) + 'px');
      reveal.style.setProperty('--po', hact.toFixed(3));
      if (Math.abs(htx - hcx) > .2 || Math.abs(hty - hcy) > .2 || Math.abs(hgoal - hact) > .004) hraf = requestAnimationFrame(hloop);
    };
    const hkick = () => { if (!hraf) hraf = requestAnimationFrame(hloop); };
    intro.addEventListener('pointermove', e => {
      const r = reveal.getBoundingClientRect();
      htx = e.clientX - r.left; hty = e.clientY - r.top;
      if (!hstarted) { hcx = htx; hcy = hty; hstarted = true; }
      hgoal = 1; hkick();
    }, opts);
    intro.addEventListener('pointerleave', () => { hgoal = 0; hkick(); }, opts);
    cleanups.push(() => cancelAnimationFrame(hraf));
  }
  if (fine.matches && !reduced.matches) all('.pf-button').forEach(button => {
    button.addEventListener('pointermove', e => { const r=button.getBoundingClientRect(); button.style.transform='translate('+((e.clientX-r.left-r.width/2)*.09)+'px,'+((e.clientY-r.top-r.height/2)*.13)+'px)'; }, opts);
    button.addEventListener('pointerleave', () => { button.style.transform = ''; }, opts);
  });
  // Crowd finale: two canvas layers of illustrated pedestrians around a still
  // portrait, like the reference site. The back row drifts right behind him, the
  // front row drifts left, and every third back-row walker passes in front.
  const crowd = select('.pf-crowd');
  const backCanvas = crowd.querySelector('.pf-crowd-back'), frontCanvas = crowd.querySelector('.pf-crowd-front');
  const layers = [backCanvas.getContext('2d'), frontCanvas.getContext('2d')];
  const images = (spriteSources || Array.from({ length:7 }, (_,i) => 'assets/crowd-' + String(i+1).padStart(2,'0') + '.webp')).map(src => { const img=new Image(); img.src=src; return img; });
  const scaleOf = s => s >= 60 && s < 75 ? .7 : s >= 75 && s < 90 ? .95 : 1;
  let width=0,height=0,dpr=1,frame=0,visible=false,paused=false,last=0,time=0,ready=false,cast=[],maxW=0,span=0;
  const rand = e => { const t=43758.5453*Math.sin(127.1*e+311.7); return t-Math.floor(t); };
  function draw() {
    if (!ready || !width) return;
    layers.forEach(c => { c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,width,height); });
    cast.forEach(p => {
      const t=p.phase+time*p.speed/10, r=Math.floor(t), a=t-r;
      const s=(p.cell+37*r)%105, img=images[Math.floor(s/15)];
      if (!img.complete || !img.naturalWidth) return;
      const sw=img.naturalWidth/5, sh=img.naturalHeight/3, cell=s%15;
      const x=(p.direction===1?a:1-a)*span-maxW;
      const bob=(1-Math.cos((time*p.speed+10*p.phase)*Math.PI*4))*5;
      const f=scaleOf(s), ctx=layers[p.layer];
      ctx.save(); ctx.translate(x,p.baseline+p.h*(1-f)-bob); ctx.scale(p.direction,1);
      ctx.drawImage(img,(cell%5)*sw,Math.floor(cell/5)*sh,sw,sh,-p.w*f/2,0,p.w*f,p.h*f);
      ctx.restore();
    });
  }
  function layout() {
    if (!ready) return;
    const w=crowd.clientWidth, h=crowd.clientHeight;
    if (!w || !h || (w===width && h===height)) return;
    width=w; height=h; dpr=Math.min(devicePixelRatio||1,2);
    [backCanvas,frontCanvas].forEach(c => { c.width=Math.round(w*dpr); c.height=Math.round(h*dpr); });
    const portrait=crowd.querySelector('.pf-crowd-portrait');
    const ph=portrait ? portrait.getBoundingClientRect().height : 0;
    const s=Math.min(1,(ph||310)/310), o=w/(1440*s);
    const counts = w>=600 ? [25,16] : [Math.max(9,Math.round(25*o)), Math.max(6,Math.round(16*o))];
    const total=counts[0]+counts[1];
    cast = Array.from({length:total},(_,t) => {
      const r=t<counts[0]?0:1, i=t-(r?counts[0]:0), a=counts[r];
      const ph2=(r?250+30*rand(t+8):170+35*rand(t+8))*s;
      const baseline=r?h-ph2+30*s+15*rand(t+4):h-ph-12+24*rand(t+4);
      return { cell:37*Math.floor(105*t/total)%105, layer:(r>0||i%3===0)?1:0, h:ph2, w:.8*ph2, baseline, speed:[.7,1.05][r]*(.88+.24*rand(t+97)), phase:(i+.85*rand(t+41))/a, direction:r?-1:1 };
    }).sort((a,b) => a.baseline-b.baseline);
    maxW=Math.max(...cast.map(p => p.w)); span=width+2*maxW;
    draw();
  }
  function loop(stamp) { if(last)time+=Math.min((stamp-last)/1000,.05);last=stamp;draw();frame=requestAnimationFrame(loop); }
  function sync() { cancelAnimationFrame(frame);frame=0;last=0;draw();if(visible&&!paused&&!reduced.matches&&!document.hidden&&ready)frame=requestAnimationFrame(loop); }
  Promise.all(images.map(img => img.decode().catch(() => {}))).then(() => { if(controller.signal.aborted)return;ready=true;layout();sync(); });
  const crowdObserver=new IntersectionObserver(entries => { visible=entries[0].isIntersecting;sync(); },{root});crowdObserver.observe(crowd);
  const resizeObserver=new ResizeObserver(layout);resizeObserver.observe(crowd);
  crowd.addEventListener('click', () => { paused=!paused;crowd.setAttribute('aria-pressed',String(paused));crowd.setAttribute('aria-label',paused?'ESTEVAN. Resume crowd animation':'ESTEVAN. Pause crowd animation');sync(); }, opts);
  document.addEventListener('visibilitychange',sync,opts);
  reduced.addEventListener('change', () => { if(reduced.matches)root.classList.remove('pf-motion');sync(); }, opts);
  return () => { controller.abort();cancelAnimationFrame(scrollFrame);cancelAnimationFrame(frame);crowdObserver.disconnect();resizeObserver.disconnect();cleanups.forEach(f=>f()); };
}

initPortfolio(document.querySelector(".pf"));
