// =====================================================
// LEBEN IN DEUTSCHLAND — main.js
// GSAP 3 + ScrollTrigger animations
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  initNavbar();
  initHeroParallax();
  initHeroEntrance();
  initFeatureCardAnimations();
  initBundeslandCycler();
  initTypewriter();
  initStudyGrid();
  initScrollReveal();
  initMagneticButtons();
  initProtocolCanvases();

  // Protocol stack only on desktop (avoids fighting with mobile static layout)
  if (window.matchMedia('(min-width: 768px)').matches) {
    initProtocolStack();
  }
});

// =====================================================
// NAVBAR
// Hamburger toggle + scroll glass effect
// =====================================================
function initNavbar() {
  const btn       = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (btn && mobileNav) {
    btn.addEventListener('click', () => {
      btn.classList.toggle('is-active');
      mobileNav.classList.toggle('is-active');
    });

    // Close mobile nav when a link is clicked
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        btn.classList.remove('is-active');
        mobileNav.classList.remove('is-active');
      });
    });
  }

}

// =====================================================
// HERO PARALLAX
// Background image moves at 0.2x scroll speed
// =====================================================
function initHeroParallax() {
  const img = document.querySelector('.hero__bg-img');
  if (!img) return;

  gsap.to(img, {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
}

// =====================================================
// HERO ENTRANCE
// Staggered fade-up on page load
// =====================================================
function initHeroEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero__eyebrow', {
      y: 0, opacity: 1, duration: 0.7, delay: 0.2,
    })
    .to('.hero__title-line', {
      y: 0, opacity: 1, duration: 0.9, stagger: 0.18,
    }, '-=0.35')
    .to('.hero__sub', {
      y: 0, opacity: 1, duration: 0.7,
    }, '-=0.45')
    .to('.hero__cta-group', {
      y: 0, opacity: 1, duration: 0.6,
    }, '-=0.4')
    .to('.hero__scroll-cue', {
      opacity: 1, duration: 0.5,
    }, '-=0.2');

  // Set initial state for animated elements (avoids flash)
  gsap.set('.hero__title-line', { y: 50 });
  gsap.set('.hero__sub', { y: 30 });
  gsap.set('.hero__cta-group', { y: 24 });
}

// =====================================================
// FEATURE CARD SCROLL REVEAL
// =====================================================
function initFeatureCardAnimations() {
  gsap.utils.toArray('.feature-card').forEach((card) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
    gsap.set(card, { y: 50 });
  });
}

// =====================================================
// BUNDESLAND CYCLER — Feature Card 1
// Shuffles through German states every 2.4 seconds
// =====================================================
function initBundeslandCycler() {
  const data = [
    { name: 'Bayern',   flag: '🦁', q: 'Bayern — 300 Questions' },
    { name: 'Berlin',   flag: '🐻', q: 'Berlin — 300 Questions' },
    { name: 'Hamburg',  flag: '⚓', q: 'Hamburg — 300 Questions' },
    { name: 'NRW',      flag: '🏭', q: 'NRW — 300 Questions' },
    { name: 'Sachsen',  flag: '🏰', q: 'Sachsen — 300 Questions' },
    { name: 'BaWü',     flag: '🏔', q: 'Baden-Württemberg — 300 Questions' },
  ];

  const nameEl = document.getElementById('bundesland-name');
  const flagEl = document.getElementById('bundesland-flag');
  const qEl    = document.getElementById('question-text');
  if (!nameEl || !flagEl || !qEl) return;

  let idx = 0;

  function cycle() {
    idx = (idx + 1) % data.length;
    const d = data[idx];

    gsap.to([nameEl, flagEl, qEl], {
      y: -14,
      opacity: 0,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => {
        nameEl.textContent = d.name;
        flagEl.textContent = d.flag;
        qEl.textContent    = d.q;
        gsap.fromTo(
          [flagEl, nameEl, qEl],
          { y: 14, opacity: 0 },
          { y: 0,  opacity: 1, duration: 0.32, stagger: 0.06, ease: 'power2.out' }
        );
      },
    });
  }

  setInterval(cycle, 2400);
}

// =====================================================
// TYPEWRITER CYCLER — Feature Card 2
// Types and deletes language strings in a loop
// =====================================================
function initTypewriter() {
  const pairs = [
    { text: 'Sprache gewechselt: Arabisch ✓',   lang: '— auf Arabisch' },
    { text: 'Language set: English ✓',           lang: '— in English' },
    { text: 'Язык: Русский ✓',                   lang: '— auf Russisch' },
    { text: 'Dil seçildi: Türkçe ✓',             lang: '— auf Türkisch' },
    { text: 'Limba: Română ✓',                   lang: '— auf Rumänisch' },
    { text: 'Język: Polski ✓',                   lang: '— auf Polnisch' },
  ];

  const el   = document.getElementById('typewriter-text');
  const lang = document.getElementById('language-translation');
  if (!el || !lang) return;

  let pairIdx  = 0;
  let charIdx  = 0;
  let deleting = false;

  const SPEED_TYPE  = 42;
  const SPEED_DEL   = 20;
  const PAUSE_FULL  = 2000;
  const PAUSE_EMPTY = 380;

  function tick() {
    const current = pairs[pairIdx].text;

    if (!deleting) {
      charIdx++;
      el.textContent = current.slice(0, charIdx);

      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_FULL);
        return;
      }
    } else {
      charIdx--;
      el.textContent = current.slice(0, charIdx);

      if (charIdx === 0) {
        deleting  = false;
        pairIdx   = (pairIdx + 1) % pairs.length;
        lang.textContent = pairs[pairIdx].lang;
        setTimeout(tick, PAUSE_EMPTY);
        return;
      }
    }

    setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }

  // Start after a short delay so it doesn't fire before scroll
  setTimeout(tick, 600);
}

// =====================================================
// STUDY GRID + CURSOR + SCORE COUNTER — Feature Card 3
// =====================================================
function initStudyGrid() {
  const grid    = document.getElementById('study-grid');
  const scoreEl = document.getElementById('score-value');
  if (!grid || !scoreEl) return;

  // Reproducible layout (seeded pseudo-random)
  const pattern = [
    'strong','strong','weak','strong','empty','strong','strong',
    'weak','strong','strong','strong','weak','strong','strong',
    'strong','empty','strong','weak','strong','strong','empty',
    'strong','strong','strong','empty','strong','weak','strong',
    'weak','strong','strong','strong','strong','empty','strong',
  ];

  pattern.forEach((state, i) => {
    const cell = document.createElement('div');
    cell.className = `study-cell study-cell--${state}`;
    cell.dataset.idx = i;
    grid.appendChild(cell);
  });

  const weakCells = [...grid.querySelectorAll('.study-cell--weak')];
  let ci     = 0;
  let active = false;

  function visitNext() {
    if (!active) return;

    if (ci > 0 && weakCells[ci - 1]) {
      weakCells[ci - 1].classList.remove('study-cell--cursor');
    }

    if (ci < weakCells.length) {
      weakCells[ci].classList.add('study-cell--cursor');
      ci++;
      setTimeout(visitNext, 550);
    } else {
      setTimeout(() => {
        if (!active) return;
        ci = 0;
        visitNext();
      }, 2200);
    }
  }

  // Animate score counter
  const scoreObj = { val: 0 };
  const scoreAnim = gsap.to(scoreObj, {
    val: 73,
    duration: 1.8,
    ease: 'power2.out',
    paused: true,
    onUpdate: () => {
      scoreEl.textContent = Math.round(scoreObj.val);
    },
  });

  ScrollTrigger.create({
    trigger: grid,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      active = true;
      visitNext();
      scoreAnim.play();
    },
  });
}

// =====================================================
// GENERIC SCROLL REVEAL
// Elements with data-reveal attribute fade up on scroll
// =====================================================
function initScrollReveal() {
  gsap.utils.toArray('[data-reveal]').forEach(el => {
    gsap.from(el, {
      y: 44,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Pricing cards
  gsap.utils.toArray('.pricing-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: i * 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
    gsap.set(card, { y: 40 });
  });
}

// =====================================================
// MAGNETIC BUTTONS
// Buttons shift slightly toward cursor on hover
// =====================================================
function initMagneticButtons() {
  document.querySelectorAll('.js-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.28;
      const dy   = (e.clientY - cy) * 0.28;
      gsap.to(btn, { x: dx, y: dy, duration: 0.28, ease: 'power2.out' });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.45)' });
    });
  });
}

// =====================================================
// PROTOCOL STACKING CARDS (desktop only)
// ScrollTrigger scrubs cards in/out as user scrolls
// =====================================================
function initProtocolStack() {
  const cards = gsap.utils.toArray('.js-protocol-card');
  if (cards.length < 3) return;

  // Card 1 exits during first third of section scroll
  gsap.to(cards[0], {
    scale: 0.91,
    opacity: 0,
    y: -50,
    ease: 'none',
    scrollTrigger: {
      trigger: '.protocol',
      start: 'top top',
      end: '33% top',
      scrub: 1.2,
    },
  });

  // Card 2 enters first, then exits
  gsap.fromTo(cards[1],
    { scale: 0.94, opacity: 0, y: 70 },
    {
      scale: 1, opacity: 1, y: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.protocol',
        start: 'top top',
        end: '33% top',
        scrub: 1.2,
      },
    }
  );

  gsap.to(cards[1], {
    scale: 0.91,
    opacity: 0,
    y: -50,
    ease: 'none',
    scrollTrigger: {
      trigger: '.protocol',
      start: '33% top',
      end: '66% top',
      scrub: 1.2,
    },
  });

  // Card 3 enters in final third
  gsap.fromTo(cards[2],
    { scale: 0.94, opacity: 0, y: 70 },
    {
      scale: 1, opacity: 1, y: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.protocol',
        start: '33% top',
        end: '66% top',
        scrub: 1.2,
      },
    }
  );
}

// =====================================================
// PROTOCOL CANVAS ANIMATIONS
// Three canvas animations start on scroll enter
// =====================================================
function initProtocolCanvases() {
  const c1 = document.getElementById('canvas-circles');
  const c2 = document.getElementById('canvas-scan');
  const c3 = document.getElementById('canvas-ekg');

  let canvasRunning = false;

  ScrollTrigger.create({
    trigger: '.protocol',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      if (canvasRunning) return;
      canvasRunning = true;
      if (c1) drawConcentricCircles(c1);
      if (c2) drawScanGrid(c2);
      if (c3) drawEKG(c3);
    },
  });
}

// ---- Canvas 1: Concentric Expanding Circles ----
function drawConcentricCircles(canvas) {
  const ctx   = canvas.getContext('2d');
  const cx    = canvas.width  / 2;
  const cy    = canvas.height / 2;
  let phase   = 0;
  let running = true;

  canvas.dataset.running = '1';

  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const count  = 7;
    const maxR   = cx * 0.88;

    for (let i = 0; i < count; i++) {
      const progress = ((i / count) + phase) % 1;
      const r        = progress * maxR;
      const alpha    = (1 - progress) * 0.65;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(242,240,233,${alpha})`;
      ctx.lineWidth   = 1.4;
      ctx.stroke();
    }

    // Accent dot at center
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#CC5833';
    ctx.fill();

    // Subtle cross-hair
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy);
    ctx.lineTo(cx + 16, cy);
    ctx.moveTo(cx, cy - 16);
    ctx.lineTo(cx, cy + 16);
    ctx.strokeStyle = 'rgba(204,88,51,0.35)';
    ctx.lineWidth   = 1;
    ctx.stroke();

    phase += 0.0028;
    requestAnimationFrame(loop);
  }

  loop();
}

// ---- Canvas 2: Scanning Laser Line across Dot Grid ----
function drawScanGrid(canvas) {
  const ctx  = canvas.getContext('2d');
  const W    = canvas.width;
  const H    = canvas.height;
  const COLS = 11;
  const ROWS = 11;
  const dotR = 1.8;
  let scanX  = -20;
  let running = true;

  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);

    // Draw dot grid
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x    = (c + 0.5) * (W / COLS);
        const y    = (r + 0.5) * (H / ROWS);
        const dist = Math.abs(x - scanX);
        const glow = Math.max(0, 1 - dist / 36);
        const alpha = 0.2 + glow * 0.8;

        ctx.beginPath();
        ctx.arc(x, y, dotR + glow * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242,240,233,${alpha})`;
        ctx.fill();
      }
    }

    // Laser line gradient
    const grad = ctx.createLinearGradient(scanX - 22, 0, scanX + 22, 0);
    grad.addColorStop(0,   'rgba(204,88,51,0)');
    grad.addColorStop(0.5, 'rgba(204,88,51,0.72)');
    grad.addColorStop(1,   'rgba(204,88,51,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(scanX - 22, 0, 44, H);

    scanX += 2.2;
    if (scanX > W + 22) scanX = -22;

    requestAnimationFrame(loop);
  }

  loop();
}

// ---- Canvas 3: Pulsing EKG Waveform ----
function drawEKG(canvas) {
  const ctx  = canvas.getContext('2d');
  const W    = canvas.width;
  const H    = canvas.height;
  const midY = H / 2;
  let offset = 0;
  let running = true;

  // EKG shape function — flat line with heartbeat spike every 120px
  function ekgY(x) {
    const mod = ((x % 120) + 120) % 120;
    if (mod < 38)  return 0;
    if (mod < 44)  return -6  * Math.sin((mod - 38) / 6  * Math.PI);
    if (mod < 50)  return 0;
    if (mod < 55)  return -62 * Math.sin((mod - 50) / 5  * Math.PI);
    if (mod < 60)  return  18 * Math.sin((mod - 55) / 5  * Math.PI);
    if (mod < 66)  return 0;
    if (mod < 76)  return -9  * Math.sin((mod - 66) / 10 * Math.PI);
    return 0;
  }

  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);

    // Glow pass (thick, low opacity)
    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const y = midY + ekgY(x + offset);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(204,88,51,0.2)';
    ctx.lineWidth   = 7;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Main line
    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const y = midY + ekgY(x + offset);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(204,88,51,0.9)';
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Baseline center guide
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(W, midY);
    ctx.strokeStyle = 'rgba(242,240,233,0.08)';
    ctx.lineWidth   = 1;
    ctx.stroke();

    offset += 1.6;
    requestAnimationFrame(loop);
  }

  loop();
}
