import './style.css';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const store = {
  get(key) {
    try { return window.localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value); } catch { /* storage unavailable */ }
  },
};
const session = {
  get(key) {
    try { return window.sessionStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch { /* storage unavailable */ }
  },
};

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
const desktopQuery = window.matchMedia('(min-width: 1000px)');

const prefs = {
  motion: store.get('pref:motion') !== null ? store.get('pref:motion') === '1' : !reducedMotionQuery.matches,
  parallax: store.get('pref:parallax') !== null ? store.get('pref:parallax') === '1' : true,
};

/* ------------------------------------------------------------------ */
/* Tabs / routing                                                      */
/* ------------------------------------------------------------------ */
const SECTIONS = ['profile', 'works', 'skills', 'about', 'contact'];
const TITLES = {
  profile: 'Rajnandini Chavan — Character Artist & Illustrator',
  works: 'Works — Rajnandini Chavan',
  skills: 'Skills — Rajnandini Chavan',
  about: 'About — Rajnandini Chavan',
  contact: 'Contact — Rajnandini Chavan',
};
const panelsEl = $('#panels');
let current = null;

function show(id, { focus = false, scroll = false } = {}) {
  if (!SECTIONS.includes(id)) id = 'profile';
  if (id === current) {
    if (scroll) scrollToPanels();
    return;
  }
  current = id;
  for (const section of SECTIONS) {
    const panel = document.getElementById(section);
    panel.hidden = section !== id;
  }
  $$('.navlink').forEach((link) => {
    const active = link.dataset.nav === id;
    link.setAttribute('aria-selected', String(active));
    link.tabIndex = active ? 0 : -1;
  });
  document.title = TITLES[id];
  panelsEl.scrollTop = 0;
  if (scroll) scrollToPanels();
  if (focus) $(`#${id}`).querySelector('h1, h2')?.focus?.({ preventScroll: true });
}

function scrollToPanels() {
  if (desktopQuery.matches) return;
  const top = panelsEl.getBoundingClientRect().top + window.scrollY - 12;
  window.scrollTo({ top, behavior: prefs.motion ? 'smooth' : 'auto' });
}

function navigate(id, opts) {
  if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
  show(id, opts);
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-nav]');
  if (!link) return;
  event.preventDefault();
  navigate(link.dataset.nav, { scroll: true });
});

window.addEventListener('popstate', () => show(location.hash.slice(1), { scroll: false }));

// Arrow-key navigation inside the tab list
$('.sidenav__list').addEventListener('keydown', (event) => {
  const keys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (!keys.includes(event.key)) return;
  event.preventDefault();
  const i = SECTIONS.indexOf(current);
  let next = i;
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (i + 1) % SECTIONS.length;
  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (i - 1 + SECTIONS.length) % SECTIONS.length;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = SECTIONS.length - 1;
  navigate(SECTIONS[next]);
  $(`#tab-${SECTIONS[next]}`).focus();
});

show(location.hash.slice(1) || 'profile');

/* ------------------------------------------------------------------ */
/* Intro                                                               */
/* ------------------------------------------------------------------ */
const intro = $('#intro');
let introTimer = 0;

function endIntro() {
  clearTimeout(introTimer);
  if (intro.classList.contains('is-done')) return;
  intro.classList.add('is-done');
  session.set('intro:seen', '1');
  requestAnimationFrame(() => document.body.classList.remove('is-loading'));
  setTimeout(() => intro.classList.add('is-gone'), 1200);
}

function playIntro() {
  intro.classList.remove('is-done', 'is-gone');
  document.body.classList.add('is-loading');
  // restart CSS animations
  $$('.intro__sigil, .intro__line, .intro__name', intro).forEach((el) => {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  });
  introTimer = setTimeout(endIntro, 2900);
}

intro.addEventListener('click', endIntro);
window.addEventListener('keydown', (event) => {
  if (!intro.classList.contains('is-done') && (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ')) endIntro();
});

if (!prefs.motion || session.get('intro:seen')) {
  intro.classList.add('is-done', 'is-gone');
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('is-loading')));
} else {
  playIntro();
}

/* ------------------------------------------------------------------ */
/* Ring tick marks                                                     */
/* ------------------------------------------------------------------ */
{
  const ticks = $('.r-ticks');
  const ns = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const long = i % 6 === 0;
    const r1 = 262;
    const r2 = long ? 276 : 268;
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', (Math.cos(a) * r1).toFixed(2));
    line.setAttribute('y1', (Math.sin(a) * r1).toFixed(2));
    line.setAttribute('x2', (Math.cos(a) * r2).toFixed(2));
    line.setAttribute('y2', (Math.sin(a) * r2).toFixed(2));
    ticks.appendChild(line);
  }
}

/* ------------------------------------------------------------------ */
/* Parallax                                                            */
/* ------------------------------------------------------------------ */
const layers = $$('.layer').map((el) => ({ el, depth: parseFloat(el.dataset.depth) || 0 }));
const heroChar = $('.hero-char');
const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };

window.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse') return;
  pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.ty = (event.clientY / window.innerHeight) * 2 - 1;
  pointer.active = true;
}, { passive: true });
document.documentElement.addEventListener('pointerleave', () => {
  pointer.tx = 0;
  pointer.ty = 0;
});

function parallaxEnabled() {
  return prefs.motion && prefs.parallax && finePointerQuery.matches;
}

/* ------------------------------------------------------------------ */
/* Floating motes (canvas)                                             */
/* ------------------------------------------------------------------ */
const canvas = $('#motes');
const ctx = canvas.getContext('2d');
let motes = [];
let cw = 0;
let ch = 0;
let dpr = 1;

const sprite = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,246,226,1)');
  grad.addColorStop(0.18, 'rgba(255,220,170,.85)');
  grad.addColorStop(0.45, 'rgba(240,180,140,.22)');
  grad.addColorStop(1, 'rgba(240,180,140,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
})();

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cw = rect.width;
  ch = rect.height;
  canvas.width = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.round(Math.min(90, (cw * ch) / 22000));
  motes = Array.from({ length: count }, () => makeMote(true));
}

function makeMote(anywhere) {
  const z = Math.random();
  return {
    x: Math.random() * cw,
    y: anywhere ? Math.random() * ch : ch + 20,
    z,
    r: 2 + z * 7,
    vy: 0.08 + z * 0.35,
    phase: Math.random() * Math.PI * 2,
    sway: 0.2 + Math.random() * 0.6,
    tw: 0.6 + Math.random() * 1.6,
  };
}

function drawMotes(t, dt) {
  ctx.clearRect(0, 0, cw, ch);
  const ox = -pointer.x * 40;
  const oy = -pointer.y * 24;
  for (const m of motes) {
    if (dt) {
      m.y -= m.vy * dt * 0.06;
      m.x += Math.sin(t * 0.0004 * m.sway + m.phase) * 0.12 * m.z * dt * 0.06;
      if (m.y < -20) Object.assign(m, makeMote(false));
    }
    const a = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.001 * m.tw + m.phase))) * (0.25 + m.z * 0.75);
    const size = m.r * 2.6;
    ctx.globalAlpha = a;
    ctx.drawImage(sprite, m.x + ox * m.z - size / 2, m.y + oy * m.z - size / 2, size, size);
  }
  ctx.globalAlpha = 1;
}

/* ------------------------------------------------------------------ */
/* Main loop                                                           */
/* ------------------------------------------------------------------ */
let last = performance.now();
let running = false;

function frame(now) {
  const dt = Math.min(64, now - last);
  last = now;

  if (parallaxEnabled()) {
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
  } else {
    pointer.x += (0 - pointer.x) * 0.08;
    pointer.y += (0 - pointer.y) * 0.08;
  }

  const w = window.innerWidth * 0.5;
  for (const { el, depth } of layers) {
    el.style.setProperty('--px', `${(-pointer.x * depth * w).toFixed(2)}px`);
    el.style.setProperty('--py', `${(-pointer.y * depth * w * 0.6).toFixed(2)}px`);
  }
  heroChar.style.setProperty('--ry', `${(pointer.x * 5).toFixed(3)}deg`);
  heroChar.style.setProperty('--rx', `${(-pointer.y * 2).toFixed(3)}deg`);

  drawMotes(now, dt);

  if (prefs.motion && !document.hidden) requestAnimationFrame(frame);
  else running = false;
}

function start() {
  if (running) return;
  running = true;
  last = performance.now();
  requestAnimationFrame(frame);
}

function applyMotion() {
  document.documentElement.classList.toggle('no-motion', !prefs.motion);
  if (prefs.motion) start();
  else {
    pointer.x = pointer.y = pointer.tx = pointer.ty = 0;
    for (const { el } of layers) {
      el.style.setProperty('--px', '0px');
      el.style.setProperty('--py', '0px');
    }
    heroChar.style.setProperty('--ry', '0deg');
    heroChar.style.setProperty('--rx', '0deg');
    drawMotes(performance.now(), 0);
  }
}

window.addEventListener('resize', () => {
  resizeCanvas();
  if (!prefs.motion) drawMotes(performance.now(), 0);
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && prefs.motion) start();
});

resizeCanvas();
applyMotion();

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */
const settingsBtn = $('#settingsBtn');
const settingsMenu = $('#settingsMenu');
const optMotion = $('#optMotion');
const optParallax = $('#optParallax');
optMotion.checked = prefs.motion;
optParallax.checked = prefs.parallax;

function setMenu(open) {
  settingsMenu.hidden = !open;
  settingsBtn.setAttribute('aria-expanded', String(open));
}
settingsBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  setMenu(settingsMenu.hidden);
});
document.addEventListener('click', (event) => {
  if (!settingsMenu.hidden && !event.target.closest('.settings')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !settingsMenu.hidden) {
    setMenu(false);
    settingsBtn.focus();
  }
});
optMotion.addEventListener('change', () => {
  prefs.motion = optMotion.checked;
  store.set('pref:motion', prefs.motion ? '1' : '0');
  applyMotion();
});
optParallax.addEventListener('change', () => {
  prefs.parallax = optParallax.checked;
  store.set('pref:parallax', prefs.parallax ? '1' : '0');
});
$('#replayIntro').addEventListener('click', () => {
  setMenu(false);
  if (!prefs.motion) {
    prefs.motion = optMotion.checked = true;
    store.set('pref:motion', '1');
    applyMotion();
  }
  playIntro();
});

/* ------------------------------------------------------------------ */
/* Copy to clipboard + toast                                          */
/* ------------------------------------------------------------------ */
const toast = $('#toast');
let toastTimer = 0;
function say(message) {
  toast.textContent = message;
  toast.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

$$('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const ok = await copyText(btn.dataset.copy);
    say(ok ? 'Copied to clipboard' : 'Copy failed — select the text instead');
    if (ok) {
      const use = btn.querySelector('use');
      use.setAttribute('href', '#i-check');
      setTimeout(() => use.setAttribute('href', '#i-copy'), 1600);
    }
  });
});

/* ------------------------------------------------------------------ */
/* Lightbox                                                            */
/* ------------------------------------------------------------------ */
const lightbox = $('#lightbox');
const lbImg = $('img', lightbox);
const lbCap = $('figcaption', lightbox);

$$('[data-lightbox]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    lbImg.src = trigger.dataset.lightbox;
    lbImg.alt = trigger.querySelector('img')?.alt || '';
    lbCap.textContent = trigger.dataset.caption || '';
    lightbox.showModal();
  });
});
$('.lightbox__close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox || event.target.tagName === 'FIGURE') lightbox.close();
});
