import './style.css';
import { trackView, trackEvent } from './analytics.js';
import { PROJECTS, FILTERS, mediaSummary } from './works.js';
import { RESUME } from './resume.js';

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
const SECTIONS = ['profile', 'works', 'skills', 'resume', 'contact'];
const ALIASES = { about: 'resume' }; // old links keep working
const TITLES = {
  profile: 'Rajnandini Chavan | UI/UX Designer & 2D/3D Generalist',
  works: 'Works | Rajnandini Chavan',
  skills: 'Skills | Rajnandini Chavan',
  resume: 'Resume | Rajnandini Chavan',
  contact: 'Contact | Rajnandini Chavan',
};
const panelsEl = $('#panels');
let current = null;

function show(id, { focus = false, scroll = false } = {}) {
  id = ALIASES[id] || id;
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
  trackView(id, TITLES[id]);
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

intro.addEventListener('click', () => {
  if (!intro.classList.contains('is-done')) trackEvent('intro-skipped', 'Intro skipped');
  endIntro();
});
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
  // She moves with her podium (same layer); a slight turn toward the cursor pivots at the feet.
  heroChar.style.setProperty('--ry', `${(pointer.x * 3).toFixed(3)}deg`);

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
  trackEvent(prefs.motion ? 'setting-motion-on' : 'setting-motion-off', 'Ambient motion toggled');
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
    say(ok ? 'Copied to clipboard' : 'Copy failed, please select the text instead');
    trackEvent(btn.dataset.copy.includes('@') ? 'copy-email' : 'copy-phone', btn.getAttribute('aria-label'));
    if (ok) {
      const use = btn.querySelector('use');
      use.setAttribute('href', '#i-check');
      setTimeout(() => use.setAttribute('href', '#i-copy'), 1600);
    }
  });
});

/* ------------------------------------------------------------------ */
/* Project viewer                                                            */
/* ------------------------------------------------------------------ */
const viewer = $('#viewer');
const vMedia = $('#viewerMedia');
const vThumbs = $('#viewerThumbs');
const byId = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
let vProject = null;
let vIndex = 0;

const el = (tag, attrs = {}, ...kids) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  node.append(...kids);
  return node;
};
const icon = (id) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${id}`);
  svg.append(use);
  return svg;
};

function renderMedia(item) {
  if (item.type === 'video') {
    const video = el('video', { src: item.src, poster: item.poster, controls: true, playsinline: true, preload: 'metadata', loop: true, 'aria-label': item.caption });
    video.muted = true;
    if (prefs.motion) video.autoplay = true;
    return video;
  }
  if (item.type === 'youtube') {
    // Nothing loads from YouTube until the visitor presses play.
    const btn = el('button', { class: 'viewer__yt', type: 'button', 'aria-label': `Play video: ${item.caption}` },
      el('img', { src: item.poster, alt: '' }),
      el('span', { class: 'viewer__play' }, icon('i-play')),
      el('span', { class: 'viewer__ytlabel' }, icon('i-youtube'), 'Play on YouTube'));
    btn.addEventListener('click', () => {
      const frame = el('iframe', {
        src: `https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1&rel=0&modestbranding=1`,
        title: `${vProject.title}: ${item.caption}`,
        allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
        allowfullscreen: true,
        class: 'viewer__frame',
      });
      btn.replaceWith(frame);
      trackEvent(`play-video-${item.id}`, `Played video: ${vProject.title}`);
    });
    return btn;
  }
  return el('img', { src: item.src, alt: item.alt });
}

function showItem(i) {
  const items = vProject.media;
  vIndex = (i + items.length) % items.length;
  const item = items[vIndex];
  vMedia.replaceChildren(renderMedia(item));
  $('#viewerCaption').textContent = item.caption;
  $('#viewerCount').textContent = items.length > 1 ? `${vIndex + 1} / ${items.length}` : '';
  $$('button', vThumbs).forEach((b, n) => b.setAttribute('aria-current', String(n === vIndex)));
  const next = items[(vIndex + 1) % items.length];
  if (items.length > 1 && next.type === 'image') new Image().src = next.src;
}

function openProject(id) {
  vProject = byId[id];
  if (!vProject) return;
  $('#viewerTitle').textContent = vProject.title;
  $('#viewerTag').textContent = vProject.tag;
  $('#viewerLink').href = vProject.link.href;
  $('#viewerLinkLabel').textContent = vProject.link.label;
  $('#viewerLinkIcon').setAttribute('href', `#i-${vProject.link.icon}`);
  viewer.classList.toggle('is-single', vProject.media.length < 2);
  vThumbs.replaceChildren(...vProject.media.map((item, n) => {
    const b = el('button', { type: 'button', class: `viewer__thumb${item.type !== 'image' ? ' is-video' : ''}`, 'aria-label': `Item ${n + 1}: ${item.caption.split('.')[0]}` },
      el('img', { src: item.type === 'image' ? item.src : item.poster, alt: '', loading: 'lazy' }));
    if (item.type !== 'image') b.append(el('span', { class: 'viewer__thumbplay' }, icon('i-play')));
    b.addEventListener('click', () => showItem(n));
    return b;
  }));
  showItem(0);
  viewer.showModal();
  trackEvent(`view-project-${id}`, `Opened project: ${vProject.title}`);
}

viewer.addEventListener('close', () => vMedia.replaceChildren()); // stops any playing video
$('.viewer__close').addEventListener('click', () => viewer.close());
$('.viewer__nav--prev').addEventListener('click', () => showItem(vIndex - 1));
$('.viewer__nav--next').addEventListener('click', () => showItem(vIndex + 1));
viewer.addEventListener('keydown', (event) => {
  if (event.target.closest('video, iframe')) return;
  if (event.key === 'ArrowLeft') showItem(vIndex - 1);
  if (event.key === 'ArrowRight') showItem(vIndex + 1);
});
viewer.addEventListener('click', (event) => {
  if (event.target === viewer || event.target.classList.contains('viewer__stage')) viewer.close();
});
let touchX = null;
vMedia.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
vMedia.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) showItem(vIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});

/* ------------------------------------------------------------------ */
/* Works cards + filters                                              */
/* ------------------------------------------------------------------ */
function workCard(p) {
  const summary = mediaSummary(p);
  const media = el('button', { class: 'work__media', type: 'button', 'aria-label': `View project: ${p.title}, ${summary}` },
    el('img', { class: 'work__cover', src: p.cover, alt: '', loading: 'lazy', style: p.coverFit ? `object-position:${p.coverFit}` : null }));
  if (p.hover) media.append(el('img', { class: 'work__hover', src: p.hover, alt: '', loading: 'lazy' }));
  let vid = null;
  if (p.hoverVideo) {
    vid = el('video', { class: 'work__hover', src: p.hoverVideo, playsinline: true, preload: 'none', loop: true });
    vid.muted = true;
    media.append(vid);
  }
  const hasVideo = p.media.some((m) => m.type !== 'image');
  media.append(el('span', { class: 'work__count' }, hasVideo ? icon('i-play') : '', summary));
  if (p.hover || p.hoverVideo) media.append(el('span', { class: 'work__peek', 'aria-hidden': 'true' }, p.hoverVideo ? 'Hover to play' : 'Hover for process'));

  const card = el('li', { class: `work${p.featured ? ' work--featured' : ''}`, 'data-project': p.id, 'data-filters': p.filters.join(' ') },
    media,
    el('div', { class: 'work__body' },
      el('span', { class: 'work__tag', text: p.featured ? `Featured · ${p.tag}` : p.tag }),
      el('h3', { class: 'work__title', text: p.title }),
      el('p', { class: 'work__desc', text: p.desc }),
      el('div', { class: 'work__actions' },
        el('button', { class: 'work__view', type: 'button' }, 'View project ', icon('i-arrow')),
        el('a', { class: 'work__ext', href: p.link.href, target: '_blank', rel: 'noopener', 'aria-label': `${p.title}: ${p.link.label} (opens in a new tab)` }, icon(`i-${p.link.icon}`), icon('i-ext')))));

  const open = () => openProject(p.id);
  media.addEventListener('click', open);
  $('.work__view', card).addEventListener('click', open);

  // Hover preview: cross-fade to a process image, or play a muted looping video
  const enter = () => {
    card.classList.add('is-peek');
    if (vid && prefs.motion) vid.play().catch(() => {});
  };
  const leave = () => {
    card.classList.remove('is-peek');
    if (vid) {
      vid.pause();
      vid.currentTime = 0;
    }
  };
  card.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && enter());
  card.addEventListener('pointerleave', leave);
  media.addEventListener('focus', enter);
  media.addEventListener('blur', leave);
  return card;
}

{
  const list = $('#worksList');
  list.replaceChildren(...PROJECTS.map(workCard));
  $('#worksKicker').textContent = `Selected work · ${PROJECTS.length} projects`;
  const bar = $('#workFilters');
  const count = (id) => (id === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.filters.includes(id)).length);
  bar.replaceChildren(...FILTERS.filter((f) => count(f.id) > 0).map((f) => {
    const b = el('button', { type: 'button', class: 'chip', 'aria-pressed': String(f.id === 'all'), 'data-filter': f.id }, f.label, el('span', { class: 'chip__n', text: String(count(f.id)) }));
    b.addEventListener('click', () => {
      $$('.chip', bar).forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      $$('.work', list).forEach((card) => {
        card.hidden = !(f.id === 'all' || card.dataset.filters.split(' ').includes(f.id));
      });
      trackEvent(`filter-${f.id}`, `Filtered works: ${f.label}`);
    });
    return b;
  }));
}

/* ------------------------------------------------------------------ */
/* Resume                                                              */
/* ------------------------------------------------------------------ */
{
  $('#resumeSummary').textContent = RESUME.summary;
  const bullets = (points) => el('ul', { class: 'tl__points' }, ...points.map((t) => el('li', { text: t })));
  $('#resumeTimeline').replaceChildren(...RESUME.experience.map((job) => el('li', { class: 'tl' },
    el('span', { class: 'tl__mark', 'aria-hidden': 'true' }),
    el('p', { class: 'tl__dates', text: job.dates }),
    el('h3', { class: 'tl__org' }, job.org, job.place ? el('span', { class: 'tl__place', text: ` · ${job.place}` }) : ''),
    el('p', { class: 'tl__role', text: job.role }),
    job.points ? bullets(job.points) : '',
    ...(job.projects || []).map((proj) => el('div', { class: 'tl__proj' }, el('h4', { text: proj.name }), bullets(proj.points))),
  )));
  $('#resumeEducation').replaceChildren(...RESUME.education.map((e) => el('li', { class: 'edu' },
    el('div', {}, el('strong', { text: e.detail }), el('span', { text: e.school })),
    el('p', { class: 'edu__meta' }, el('span', { text: e.dates }), el('span', { class: 'edu__result', text: e.result })))));
  $('#resumeAchievements').replaceChildren(...RESUME.achievements.map((a) => el('div', { class: 'ach' },
    el('span', { class: 'ach__medal', 'aria-hidden': 'true' }, icon('i-star')),
    el('div', {}, el('strong', { text: a.title }), el('p', { text: a.text })))));
  $('#resumeSkills').replaceChildren(...RESUME.skills.map((g) => el('div', { class: 'rs' },
    el('h4', { text: g.group }),
    el('ul', { class: 'chips' }, ...g.items.map((t) => el('li', { text: t }))))));
  $$('a[download]').forEach((a) => a.addEventListener('click', () => trackEvent(`download-resume-${a.href.split('.').pop()}`, 'Downloaded resume')));
}
