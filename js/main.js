  /* ── Unified motion controller ── */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Hero scene tilt (pointer parallax) ── */
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const scene = document.getElementById('scene');
  if (scene && finePointer && !reduceMotion) {
    let sceneX=0, sceneY=0, targetX=0, targetY=0, raf=false;
    const tick = () => {
      raf=false;
      sceneX += (targetX-sceneX)*.08; sceneY += (targetY-sceneY)*.08;
      scene.style.setProperty('--scene-tilt-x', `${sceneX}deg`);
      scene.style.setProperty('--scene-tilt-y', `${sceneY}deg`);
      if (Math.abs(targetX-sceneX)>.01 || Math.abs(targetY-sceneY)>.01) { raf=true; requestAnimationFrame(tick); }
    };
    document.addEventListener('mousemove', e => {
      targetX=(e.clientX/window.innerWidth-.5)*14;
      targetY=-(e.clientY/window.innerHeight-.5)*14;
      if (!raf) { raf=true; requestAnimationFrame(tick); }
    }, {passive:true});
  }

  /* ── Scroll reveal ── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:.07});
  document.querySelectorAll('.rev').forEach(el => revealObserver.observe(el));

  /* ── Active navigation: one observer only ── */
  const navAs=document.querySelectorAll('.nav-links a');
  const sections=document.querySelectorAll('section[id]');
  const navObserver=new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navAs.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, {threshold:.35, rootMargin:'-80px 0px -25% 0px'});
  sections.forEach(section => navObserver.observe(section));

  /* ── Hamburger + accessibility ── */
  const toggle=document.getElementById('navToggle');
  const menu=document.getElementById('mobileMenu');
  function closeMenu(){
    menu.classList.remove('open'); toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
  }
  toggle.addEventListener('click', () => {
    const open=menu.classList.toggle('open'); toggle.classList.toggle('open');
    toggle.setAttribute('aria-expanded',String(open));
    document.body.style.overflow=open?'hidden':'';
  });
  document.querySelectorAll('.mm-link').forEach(l => l.addEventListener('click',closeMenu));
  document.addEventListener('keydown', e => { if(e.key==='Escape' && menu.classList.contains('open')) closeMenu(); });

  /* ── Ripple ── */
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('click', e => {
      if (reduceMotion) return;
      const r=card.getBoundingClientRect(), size=Math.max(r.width,r.height);
      const rip=document.createElement('span'); rip.className='ripple';
      rip.style.cssText=`width:${size}px;height:${size}px;left:${e.clientX-r.left-size/2}px;top:${e.clientY-r.top-size/2}px`;
      card.appendChild(rip); rip.addEventListener('animationend',()=>rip.remove(),{once:true});
    });
  });

  const bar=document.getElementById('scroll-bar');
  let scrollTick=false;
  function updateScrollBar(){
    scrollTick=false;
    const h=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.width=(h>0?(window.scrollY/h)*100:0)+'%';
  }
  window.addEventListener('scroll',()=>{
    if(!scrollTick){ scrollTick=true; requestAnimationFrame(updateScrollBar); }
  },{passive:true});
  updateScrollBar();

  /* ── Developer interface ── */
  const devTabs = document.querySelectorAll('.dev-tab');
  const devPanels = document.querySelectorAll('.dev-code[data-panel]');
  const devRun = document.getElementById('devRun');
  const devWindow = document.querySelector('.dev-window');
  const devStatusText = document.getElementById('dev-status-text');

  devTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      devTabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      devPanels.forEach(panel => { panel.hidden = panel.dataset.panel !== target; });
      if (devStatusText) devStatusText.textContent = `${target} preview`;
    });
  });

  if (devRun && devWindow && devStatusText) {
    let runTimer;
    devRun.addEventListener('click', () => {
      if (runTimer) window.clearTimeout(runTimer);
      if (reduceMotion) {
        devStatusText.textContent = 'Preview ready';
        return;
      }
      devWindow.classList.add('is-running');
      devStatusText.textContent = 'Compiling...';
      devRun.querySelector('span').textContent = 'Run…';
      runTimer = window.setTimeout(() => {
        devWindow.classList.remove('is-running');
        devStatusText.textContent = 'Live preview';
        devRun.querySelector('span').textContent = 'Run';
      }, 700);
    });
  }

  /* ── Project preview modal ── */
  const previewModal = document.getElementById('previewModal');
  const previewBrowser = document.getElementById('previewModalBrowser');
  const previewTitle = document.getElementById('previewModalTitle');
  const previewKicker = document.getElementById('previewModalKicker');
  const previewMeta = document.getElementById('previewModalMeta');
  const previewCloseEls = document.querySelectorAll('[data-preview-close]');
  const projectCards = document.querySelectorAll('.project-card');
  let lastPreviewTrigger = null;

  function makePreviewNode(projectId) {
    const card = document.querySelector(`.project-card[data-project="${projectId}"]`);
    if (!card) return null;
    const source = card.querySelector('.mini-browser');
    if (!source) return null;
    return source.cloneNode(true);
  }

  function openPreview(projectId, trigger) {
    if (!previewModal || !previewBrowser) return;
    const card = document.querySelector(`.project-card[data-project="${projectId}"]`);
    if (!card) return;
    const node = makePreviewNode(projectId);
    if (!node) return;
    lastPreviewTrigger = trigger || null;
    previewBrowser.replaceChildren(node);
    previewTitle.innerHTML = card.querySelector('.proj-title')?.innerHTML || 'Project Preview';
    previewKicker.textContent = card.querySelector('.tag')?.textContent || 'Project Preview';
    previewMeta.textContent = card.dataset.stack || 'Interactive preview';
    previewModal.classList.add('is-open');
    previewModal.setAttribute('aria-hidden','false');
    document.body.classList.add('preview-open');
    previewModal.querySelector('.preview-close')?.focus();
  }

  function closePreview() {
    if (!previewModal) return;
    previewModal.classList.remove('is-open');
    previewModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('preview-open');
    if (lastPreviewTrigger) lastPreviewTrigger.focus();
    lastPreviewTrigger = null;
  }

  document.querySelectorAll('.preview-trigger, .proj-thumb').forEach(el => {
    el.addEventListener('click', e => {
      if (el.classList.contains('proj-thumb') && !e.target.closest('.preview-overlay')) return;
      openPreview(el.dataset.project || el.closest('.project-card')?.dataset.project, el);
    });
  });
  previewCloseEls.forEach(el => el.addEventListener('click', closePreview));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && previewModal?.classList.contains('is-open')) closePreview();
  });

  /* ── Faster cinematic loading screen ── */
  (function(){
    const loader=document.getElementById('loader');
    const lBar=document.getElementById('loader-bar');
    const lPct=document.getElementById('loader-pct');
    if (!loader || !lBar || !lPct) return;

    const minDuration=650;
    const maxWait=1500;
    const start=performance.now();
    let progress=0;
    let ready=document.readyState==='complete';
    let finished=false;

    const criticalImages = Array.from(document.images).filter(img => img.loading !== 'lazy');
    const imageReady = Promise.all(criticalImages.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve, {once:true});
        img.addEventListener('error', resolve, {once:true});
      });
    }));
    const fontReady = document.fonts?.ready || Promise.resolve();
    Promise.all([fontReady, imageReady]).then(() => { ready=true; });
    window.addEventListener('load', () => { ready=true; }, {once:true});

    function finish(){
      if (finished) return;
      finished=true;
      progress=100;
      lBar.style.transform='scaleX(1)';
      lPct.textContent='100%';
      window.setTimeout(() => loader.classList.add('hidden'), 120);
    }

    function tick(now){
      const elapsed=now-start;
      const t=Math.min(1, elapsed/minDuration);
      const visualProgress=Math.min(94, Math.round((1-Math.pow(1-t,4))*94));
      progress=Math.max(progress,visualProgress);
      lBar.style.transform=`scaleX(${progress/100})`;
      lPct.textContent=progress+'%';
      if ((ready && elapsed>=minDuration) || elapsed>=maxWait) finish();
      else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();
