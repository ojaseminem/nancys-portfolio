# Rajnandini Chavan — Portfolio

A cinematic, game-menu style portfolio for **Rajnandini Chavan**, character artist & illustrator (Pune, India).

The page is built like an RPG character screen: a layered, painted scene with the character on a pedestal, a gilded side menu, and a right-hand panel that switches between **Profile, Works, Skills, About and Contact**.

## Features

- **Layered parallax scene** — background, light column, sigil orb, rotating rings, god-rays, character and foreground ribbon all move at different depths with the mouse; the character also tilts slightly in 3D.
- **Living lighting** — the orb and light column pulse, the character has a breathing rim-light and a slow float, and gold motes drift up through the scene (canvas, paused when the tab is hidden).
- **Cinematic intro** — letterbox bars, a sigil that draws itself in and the tagline, then the scene pushes in and the UI arrives. Plays once per browser session; can be skipped (click, Enter, Esc) or replayed from the ⚙ menu.
- **Display settings** — toggles for ambient motion and mouse parallax (remembered in the browser). `prefers-reduced-motion` is respected automatically.
- **Responsive** — desktop/laptop/ultra-wide keep the character framed on the pedestal; on phones it becomes a hero image with the panel below and a bottom tab bar.
- **Accessible** — real tab semantics with arrow-key navigation, skip link, focus styles, alt text, and an automated axe audit in the test suite.
- Deep links (`#works`, `#contact` …), copy-to-clipboard for email/phone, a lightbox for artwork, Open Graph image and JSON-LD for search/social previews.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
npm run preview    # serves dist/ on http://localhost:4173
npm test           # builds, serves and runs the Playwright suite (desktop, laptop, mobile)
```

## Project layout

```
index.html              all page content (edit text, links, works here)
src/style.css           styles, animation, responsive layouts
src/main.js             tabs/routing, intro, parallax, motes, settings, lightbox
public/assets/          optimised images (generated — see below)
public/favicon.svg, apple-touch-icon.png, og-image.jpg
source-art/             full-resolution master art
scripts/build-assets.py regenerates public/assets from source-art
tests/site.spec.js      end-to-end + accessibility tests
```

## Editing content

Everything visible lives in `index.html`:

- **Profile stats** — the `<dl class="stats">` block.
- **Works** — duplicate the `<button class="feature">` block for each new piece. Put the image in `public/assets/`, set `src` on the `<img>`, `data-lightbox` (full-size image) and `data-caption`.
- **About / Seeking** — the `#about` section.
- **Contact** — the `#contact` section (and the JSON-LD block in `<head>`).

### Regenerating images

Replace files in `source-art/` (same names) and run:

```bash
pip install pillow numpy
npm run assets
```

## Deploy

`.github/workflows/deploy.yml` builds, tests and publishes `dist/` to GitHub Pages on every push to `main`.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
The site will be served at `https://ojaseminem.github.io/nancys-portfolio/`.
If you use a custom domain, update the `canonical` / `og:url` / `og:image` URLs in `index.html`.
