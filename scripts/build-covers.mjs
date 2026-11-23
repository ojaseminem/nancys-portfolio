// Renders title-card covers for projects that only exist as video (no stills supplied yet).
// Run with:  node scripts/build-covers.mjs
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'assets', 'works');
await mkdir(OUT, { recursive: true });
const font = (pkg, file) => pathToFileURL(path.join(ROOT, 'node_modules', '@fontsource', pkg, 'files', file)).href;

// Fingerprint-like whorl, drawn as nested wobbly ellipses
const whorl = Array.from({ length: 22 }, (_, i) => {
  const rx = 18 + i * 13;
  const ry = 26 + i * 15;
  return `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" transform="rotate(${(i % 5) - 2})" stroke-dasharray="${i % 3 ? '' : `${40 + i * 3} 9`}"/>`;
}).join('');

const card = (w, h, layout) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Cinzel; src: url(${font('cinzel', 'cinzel-latin-600-normal.woff2')}); font-weight: 600; }
@font-face { font-family: Cinzel; src: url(${font('cinzel', 'cinzel-latin-400-normal.woff2')}); font-weight: 400; }
@font-face { font-family: Cormorant; src: url(${font('cormorant-garamond', 'cormorant-garamond-latin-500-italic.woff2')}); font-style: italic; }
html, body { margin: 0; }
.c { position: relative; width: ${w}px; height: ${h}px; overflow: hidden;
  background: radial-gradient(ellipse at ${layout === 'wide' ? '68% 45%' : '50% 38%'}, #4a0f17 0%, #22070c 45%, #0b0306 100%); }
.grain { position: absolute; inset: 0; opacity: .18; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); mix-blend-mode: overlay; }
.print { position: absolute; ${layout === 'wide' ? 'right: -60px; top: 50%; width: 760px; height: 760px; transform: translateY(-50%);' : 'left: 50%; top: 34%; width: 640px; height: 640px; transform: translate(-50%, -50%);'} }
.print g { fill: none; stroke: #c23a3a; stroke-width: 3; opacity: .28; }
.string { position: absolute; inset: 0; }
.string path { fill: none; stroke: #d64545; stroke-width: 2.2; opacity: .75; }
.pin { fill: #f0c87a; }
.txt { position: absolute; ${layout === 'wide' ? 'left: 110px; top: 50%; transform: translateY(-50%); text-align: left;' : 'left: 0; right: 0; bottom: 120px; text-align: center;'} color: #f4dfb4; }
.kick { font-family: Cinzel; font-weight: 400; font-size: ${layout === 'wide' ? 22 : 26}px; letter-spacing: .42em; color: #d64545; margin: 0 0 18px; }
h1 { margin: 0; font-family: Cinzel; font-weight: 600; font-size: ${layout === 'wide' ? 104 : 96}px; line-height: .95; letter-spacing: .04em; text-shadow: 0 4px 30px rgba(0,0,0,.6); }
.sub { margin: 22px 0 0; font-family: Cormorant; font-style: italic; font-size: ${layout === 'wide' ? 34 : 36}px; color: #e7c08a; }
.rule { width: 220px; height: 1px; background: linear-gradient(90deg, #e7c08a, transparent); margin: 26px ${layout === 'wide' ? '0' : 'auto'} 0; }
.frame { position: absolute; inset: 22px; border: 1px solid rgba(231, 192, 138, .35); }
.frame::after { content: ''; position: absolute; inset: 8px; border: 1px solid rgba(231, 192, 138, .15); }
</style></head><body><div class="c">
<svg class="print" viewBox="-320 -360 640 720"><g>${whorl}</g></svg>
<svg class="string" viewBox="0 0 ${w} ${h}">
  ${layout === 'wide'
    ? `<path d="M${w * 0.58} ${h * 0.2} L${w * 0.86} ${h * 0.34} L${w * 0.7} ${h * 0.78} L${w * 0.94} ${h * 0.86}"/><circle class="pin" cx="${w * 0.58}" cy="${h * 0.2}" r="7"/><circle class="pin" cx="${w * 0.86}" cy="${h * 0.34}" r="7"/><circle class="pin" cx="${w * 0.7}" cy="${h * 0.78}" r="7"/><circle class="pin" cx="${w * 0.94}" cy="${h * 0.86}" r="7"/>`
    : `<path d="M${w * 0.16} ${h * 0.1} L${w * 0.78} ${h * 0.2} L${w * 0.3} ${h * 0.5} L${w * 0.86} ${h * 0.58}"/><circle class="pin" cx="${w * 0.16}" cy="${h * 0.1}" r="8"/><circle class="pin" cx="${w * 0.78}" cy="${h * 0.2}" r="8"/><circle class="pin" cx="${w * 0.3}" cy="${h * 0.5}" r="8"/><circle class="pin" cx="${w * 0.86}" cy="${h * 0.58}" r="8"/>`}
</svg>
<div class="grain"></div>
<div class="frame"></div>
<div class="txt"><p class="kick">CASE FILE</p><h1>Murder<br>Mystery</h1><p class="sub">A board game of clues and suspects</p><div class="rule"></div></div>
</div></body></html>`;

const browser = await chromium.launch();
for (const [name, w, h, layout] of [['mystery-cover', 1600, 900, 'wide']]) {
  const tmp = path.join(OUT, `_${name}.html`);
  await writeFile(tmp, card(w, h, layout));
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(pathToFileURL(tmp).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  await page.close();
  await unlink(tmp);
}
await browser.close();
console.log('covers rendered (PNG); convert to .webp in public/assets/works');
