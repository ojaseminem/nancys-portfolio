// Privacy-friendly visitor analytics via GoatCounter (no cookies, no consent banner needed).
// Turned on by putting the GoatCounter site code in <meta name="goatcounter"> in index.html.
// With an empty code nothing is loaded and every call below is a no-op.

const code = document.querySelector('meta[name="goatcounter"]')?.content.trim() || '';
const enabled = /^[a-z0-9-]+$/i.test(code);
const queue = [];
let ready = false;

function send(payload) {
  if (!enabled) return;
  if (ready && window.goatcounter?.count) window.goatcounter.count(payload);
  else queue.push(payload);
}

/** Record a section view as its own page, e.g. "/works". */
export function trackView(section, title) {
  send({ path: section === 'profile' ? '/' : `/${section}`, title });
}

/** Record an interaction, e.g. "click-artstation". Shows under "Events" in the dashboard. */
export function trackEvent(name, title = name) {
  send({ path: name, title, event: true });
}

if (enabled) {
  // We count section views ourselves, so turn off the automatic first count.
  window.goatcounter = { ...(window.goatcounter || {}), no_onload: true };
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  script.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
  script.addEventListener('load', () => {
    ready = true;
    queue.splice(0).forEach((payload) => window.goatcounter.count(payload));
  });
  document.head.appendChild(script);
}

// Which link a click was on, in words the dashboard can show.
function linkLabel(a) {
  const href = a.getAttribute('href') || '';
  if (href.startsWith('mailto:')) return 'click-email';
  if (href.startsWith('tel:')) return 'click-phone';
  if (href.includes('artstation.com')) return 'click-artstation';
  if (href.includes('behance.net')) return 'click-behance';
  if (/^https?:/.test(href)) return `click-${new URL(href).hostname}`;
  return null;
}

document.addEventListener('click', (event) => {
  const a = event.target.closest('a[href]');
  if (!a) return;
  const label = linkLabel(a);
  if (!label) return;
  const where = a.closest('[id]')?.id || 'page';
  trackEvent(label, `${label.replace('click-', '')} link (${where})`);
}, { capture: true });
