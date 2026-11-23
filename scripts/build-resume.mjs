// Generates the downloadable resume (PDF + DOCX) from src/resume.js.
// Run with:  npm run resume
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';
import {
  AlignmentType, BorderStyle, Document, ExternalHyperlink, LevelFormat, Packer, Paragraph, TabStopType, TextRun,
} from 'docx';
import { RESUME as R } from '../src/resume.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'resume');
const BASE = 'Rajnandini-Chavan-Resume';
await mkdir(OUT, { recursive: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const font = (pkg, file) => pathToFileURL(path.join(ROOT, 'node_modules', '@fontsource', pkg, 'files', file)).href;

/* ------------------------------------------------------------------ PDF */
const list = (points) => `<ul>${points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`;
const jobs = R.experience.map((job) => `
  <section class="job">
    <header>
      <div><h3>${esc(job.org)}${job.place ? `<span class="place"> · ${esc(job.place)}</span>` : ''}</h3><p class="role">${esc(job.role)}</p></div>
      <p class="dates">${esc(job.dates)}</p>
    </header>
    ${job.points ? list(job.points) : ''}
    ${(job.projects || []).map((p) => `<div class="proj"><h4>${esc(p.name)}</h4>${list(p.points)}</div>`).join('')}
  </section>`).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Cormorant; src: url(${font('cormorant-garamond', 'cormorant-garamond-latin-600-normal.woff2')}); font-weight: 600; }
@font-face { font-family: Garamond; src: url(${font('eb-garamond', 'eb-garamond-latin-400-normal.woff2')}); font-weight: 400; }
@font-face { font-family: Garamond; src: url(${font('eb-garamond', 'eb-garamond-latin-500-normal.woff2')}); font-weight: 500; }
@font-face { font-family: Cinzel; src: url(${font('cinzel', 'cinzel-latin-400-normal.woff2')}); }
@page { size: A4; margin: 16mm 16mm 14mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Garamond, Georgia, serif; font-size: 10.4pt; line-height: 1.42; color: #2a2230; }
.top { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; padding-bottom: 10px; border-bottom: 1.4px solid #b98a4e; }
h1 { margin: 0; font-family: Cormorant, Georgia, serif; font-weight: 600; font-size: 30pt; line-height: 1; color: #2b1838; }
.title { white-space: nowrap; margin: 6px 0 0; font-family: Cinzel, serif; font-size: 8pt; letter-spacing: .18em; text-transform: uppercase; color: #8a5f2c; }
.contact { margin: 0; text-align: right; font-size: 8.6pt; line-height: 1.5; color: #4a3d52; }
.contact a { color: inherit; text-decoration: none; }
h2 { margin: 16px 0 8px; font-family: Cinzel, serif; font-weight: 400; font-size: 9pt; letter-spacing: .24em; text-transform: uppercase; color: #8a5f2c; display: flex; align-items: center; gap: 10px; }
h2::after { content: ''; flex: 1; height: 1px; background: #e2cfb3; }
.summary { margin: 0; }
.job { margin-bottom: 11px; break-inside: avoid-page; }
.job header { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
h3 { margin: 0; font-family: Cormorant, Georgia, serif; font-weight: 600; font-size: 14pt; color: #2b1838; }
.place { font-family: Garamond, serif; font-weight: 400; font-size: 10pt; color: #6b5b70; }
.role { margin: 0; font-weight: 500; color: #8a5f2c; }
.dates { margin: 0; white-space: nowrap; font-family: Cinzel, serif; font-size: 7.6pt; letter-spacing: .14em; text-transform: uppercase; color: #6b5b70; }
.proj { margin-top: 4px; }
h4 { margin: 4px 0 1px; font-size: 10.4pt; font-weight: 500; color: #3c2c47; }
ul { margin: 2px 0 0; padding-left: 15px; }
li { margin: 1.5px 0; padding-left: 2px; }
li::marker { content: '◆  '; color: #b98a4e; font-size: 6pt; }
.skills { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px 16px; }
.skills h4 { margin: 0 0 2px; font-family: Cinzel, serif; font-weight: 400; font-size: 7.6pt; letter-spacing: .16em; text-transform: uppercase; color: #8a5f2c; }
.skills p { margin: 0; font-size: 9.6pt; }
</style></head><body>
<div class="top">
  <div><h1>${esc(R.name)}</h1><p class="title">${esc(R.title)}</p></div>
  <p class="contact">
    <a href="mailto:${R.contact.email}">${R.contact.email}</a> · ${esc(R.contact.phone)}<br>
    <a href="${R.contact.portfolioUrl}">${R.contact.portfolio}</a><br>
    <a href="${R.contact.artstationUrl}">${R.contact.artstation}</a> · <a href="${R.contact.behanceUrl}">${R.contact.behance}</a><br>
    ${esc(R.location)}
  </p>
</div>
<h2>Profile</h2><p class="summary">${esc(R.summary)}</p>
<h2>Experience</h2>${jobs}
<h2>Skills</h2>
<div class="skills">${R.skills.map((s) => `<div><h4>${esc(s.group)}</h4><p>${s.items.map(esc).join(' · ')}</p></div>`).join('')}</div>
</body></html>`;

const tmp = path.join(OUT, '_resume.html');
await writeFile(tmp, html);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(tmp).href);
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: path.join(OUT, `${BASE}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
const { unlink } = await import('node:fs/promises');
await unlink(tmp);

/* ----------------------------------------------------------------- DOCX */
const GOLD = '8A5F2C';
const INK = '2B1838';
const MUTED = '6B5B70';
const FONT = 'Garamond';

const heading = (text) => new Paragraph({
  spacing: { before: 280, after: 100 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E2CFB3', space: 4 } },
  children: [new TextRun({ text: text.toUpperCase(), font: FONT, size: 19, color: GOLD, characterSpacing: 60 })],
});
const bullets = (points) => points.map((p) => new Paragraph({
  numbering: { reference: 'diamond', level: 0 },
  spacing: { after: 40 },
  children: [new TextRun({ text: p, font: FONT, size: 21 })],
}));
const link = (text, url) => new ExternalHyperlink({ link: url, children: [new TextRun({ text, font: FONT, size: 19, color: MUTED })] });
const sep = () => new TextRun({ text: '  ·  ', font: FONT, size: 19, color: MUTED });

const body = [
  new Paragraph({ children: [new TextRun({ text: R.name, font: FONT, size: 52, bold: true, color: INK })] }),
  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: R.title.toUpperCase(), font: FONT, size: 18, color: GOLD, characterSpacing: 40 })] }),
  new Paragraph({ children: [link(R.contact.email, `mailto:${R.contact.email}`), sep(), new TextRun({ text: R.contact.phone, font: FONT, size: 19, color: MUTED })] }),
  new Paragraph({ children: [new TextRun({ text: R.location, font: FONT, size: 19, color: MUTED })] }),
  new Paragraph({ children: [link(R.contact.portfolio, R.contact.portfolioUrl), sep(), link(R.contact.artstation, R.contact.artstationUrl), sep(), link(R.contact.behance, R.contact.behanceUrl)] }),
  heading('Profile'),
  new Paragraph({ children: [new TextRun({ text: R.summary, font: FONT, size: 21 })] }),
  heading('Experience'),
];
for (const job of R.experience) {
  body.push(new Paragraph({
    spacing: { before: 160 },
    tabStops: [{ type: TabStopType.RIGHT, position: 9600 }],
    children: [
      new TextRun({ text: job.org, font: FONT, size: 25, bold: true, color: INK }),
      ...(job.place ? [new TextRun({ text: `  ·  ${job.place}`, font: FONT, size: 20, color: MUTED })] : []),
      new TextRun({ text: `\t${job.dates}`, font: FONT, size: 18, color: MUTED }),
    ],
  }));
  body.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: job.role, font: FONT, size: 21, color: GOLD, bold: true })] }));
  if (job.points) body.push(...bullets(job.points));
  for (const proj of job.projects || []) {
    body.push(new Paragraph({ spacing: { before: 60, after: 20 }, children: [new TextRun({ text: proj.name, font: FONT, size: 21, bold: true, color: '3C2C47' })] }));
    body.push(...bullets(proj.points));
  }
}
body.push(heading('Skills'));
for (const s of R.skills) {
  body.push(new Paragraph({ spacing: { after: 40 }, children: [
    new TextRun({ text: `${s.group}:  `, font: FONT, size: 21, bold: true, color: GOLD }),
    new TextRun({ text: s.items.join(' · '), font: FONT, size: 21 }),
  ] }));
}

const doc = new Document({
  creator: R.name,
  title: `${R.name} Resume`,
  numbering: { config: [{ reference: 'diamond', levels: [{ level: 0, format: LevelFormat.BULLET, text: '◆', alignment: AlignmentType.LEFT, style: { run: { color: 'B98A4E', size: 12 }, paragraph: { indent: { left: 360, hanging: 260 } } } }] }] },
  sections: [{ properties: { page: { margin: { top: 900, bottom: 800, left: 1000, right: 1000 } } }, children: body }],
});
await writeFile(path.join(OUT, `${BASE}.docx`), await Packer.toBuffer(doc));

console.log(`resume -> public/resume/${BASE}.pdf, ${BASE}.docx`);
