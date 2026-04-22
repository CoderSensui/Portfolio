/* shared.js — lxwis.site */

// ── CURSOR ──
(function() {
  const cursor = document.getElementById('cursor');
  const dot    = document.getElementById('cursorDot');
  if (!cursor || !dot) return;
  let mx = -100, my = -100, cx = -100, cy = -100;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; dot.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; dot.style.opacity = '1'; });
  const links = document.querySelectorAll('a, button, [data-hover]');
  links.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('big'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
  });
  function animate() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    requestAnimationFrame(animate);
  }
  animate();
})();

// ── NAV SCROLL ──
(function() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
  // Active link highlight
  const links = nav.querySelectorAll('.nav-links a');
  const sections = [];
  links.forEach(a => {
    const id = a.getAttribute('href').replace('#', '');
    const el = document.getElementById(id);
    if (el) sections.push({ el, a });
  });
  if (sections.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const match = sections.find(s => s.el === en.target);
          if (match) match.a.classList.add('active');
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => io.observe(s.el));
  }
})();

// ── MOBILE MENU ──
(function() {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

// ── REVEAL ON SCROLL ──
(function() {
  const els = document.querySelectorAll('.reveal-up');
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
  }, { threshold: 0.08 });
  els.forEach(el => io.observe(el));
})();

// ── PARTICLE CANVAS ──
(function() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r  = Math.random() * 1.2 + 0.2;
      this.a  = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.7 ? '#39ff8c' : '#00e5ff';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace(')', `,${this.a})`).replace('rgb', 'rgba').replace('#39ff8c', `rgba(57,255,140,${this.a})`).replace('#00e5ff', `rgba(0,229,255,${this.a})`);
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: 80 }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(57,255,140,${0.06 * (1 - dist/120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, w, h);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });
  init();
  loop();
})();

// ── COUNTER ANIM ──
function animateCounter(el) {
  const target = parseInt(el.dataset.count || el.textContent, 10);
  if (isNaN(target)) return;
  let start = 0;
  const dur = 1200;
  const step = timestamp => {
    if (!start) start = timestamp;
    const prog = Math.min((timestamp - start) / dur, 1);
    el.textContent = Math.floor(prog * target);
    if (prog < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}
document.querySelectorAll('[data-count]').forEach(el => {
  new IntersectionObserver(([entry]) => { if (entry.isIntersecting) animateCounter(el); }, { threshold: 1 }).observe(el);
});

// ── PAGE TILT EFFECT ──
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});
