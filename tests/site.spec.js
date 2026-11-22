import { test, expect } from '@playwright/test';

const SECTIONS = ['profile', 'works', 'skills', 'about', 'contact'];

// Skip the cinematic intro for most tests.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('intro:seen', '1'));
  await page.route(/youtube/, (route) => route.fulfill({ contentType: 'text/html', body: '<html></html>' }));
  // Never send real analytics from tests.
  await page.route('https://gc.zgo.at/**', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: 'window.__gc = []; window.goatcounter.count = (p) => window.__gc.push(p);' }),
  );
});

test('loads without errors and shows the profile', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const failed = [];
  page.on('requestfailed', (r) => failed.push(r.url()));
  page.on('response', (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));

  await page.goto('/');
  await expect(page).toHaveTitle(/Rajnandini Chavan/);
  await expect(page.getByRole('heading', { level: 1, name: 'Rajnandini Chavan' })).toBeVisible();
  await expect(page.locator('#profile')).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});

test('all images load', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.locator('#tab-works').click();
  for (const img of await page.locator('.work__media img.work__cover').all()) await img.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.images].filter((i) => !i.closest('[hidden]') && !i.closest('dialog') && !i.classList.contains('work__hover')).every((i) => i.complete));
  const broken = await page.$$eval('img', (imgs) =>
    imgs.filter((i) => i.getAttribute('src') && !i.classList.contains('work__hover') && !(i.complete && i.naturalWidth > 0) && !i.closest('dialog') && !i.closest('[hidden]')).map((i) => i.src),
  );
  expect(broken).toEqual([]);
  // every project file (covers, hover previews, viewer images, videos) is served
  const files = await page.$$eval('.work__media img, .work__media video', (els) => els.map((m) => m.getAttribute('src')));
  expect(files.length).toBeGreaterThan(5);
  for (const src of files) {
    const res = await page.request.get(new URL(src, page.url()).href);
    expect(res.status(), src).toBe(200);
  }
});

test('tab navigation switches panels and updates the URL', async ({ page }) => {
  await page.goto('/');
  for (const id of SECTIONS) {
    await page.locator(`#tab-${id}`).click();
    await expect(page.locator(`#${id}`)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#tab-${id}`)).toHaveAttribute('aria-selected', 'true');
    for (const other of SECTIONS.filter((s) => s !== id)) {
      await expect(page.locator(`#${other}`)).toBeHidden();
    }
  }
  await page.goBack();
  await expect(page.locator('#about')).toBeVisible();
});

test('deep link opens the right panel', async ({ page }) => {
  await page.goto('/#contact');
  await expect(page.locator('#contact')).toBeVisible();
  await expect(page.locator('#profile')).toBeHidden();
});

test('contact details and links are correct', async ({ page }) => {
  await page.goto('/#contact');
  const panel = page.locator('#contact');
  await expect(panel.locator('a[href="mailto:rajnandinichavan612@gmail.com"]')).toBeVisible();
  await expect(panel.locator('a[href="tel:+919373777294"]')).toContainText('+91 93737 77294');
  await expect(panel.locator('a[href="https://www.artstation.com/rajnandinichavan1"]')).toBeVisible();
  await expect(panel.locator('a[href="https://www.behance.net/rajnandchavan1"]')).toBeVisible();
  await expect(panel).toContainText('Pune');

  for (const a of await page.locator('a[target="_blank"]').all()) {
    await expect(a).toHaveAttribute('rel', /noopener/);
  }
});

test('copy button copies the email', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/#contact');
  await page.getByRole('button', { name: 'Copy email address' }).click();
  await expect(page.locator('#toast')).toHaveText('Copied to clipboard');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('rajnandinichavan612@gmail.com');
});

test('project viewer opens, pages through images and closes', async ({ page }) => {
  await page.goto('/#works');
  await expect(page.locator('.work')).toHaveCount(5);
  await page.locator('.work[data-project="ursula"] .work__view').click();
  const viewer = page.locator('#viewer');
  const img = page.locator('#viewerMedia img');
  await expect(viewer).toBeVisible();
  await expect(page.locator('#viewerTitle')).toHaveText('Ursula');
  await expect(img).toHaveAttribute('src', /ursula-render\.webp/);
  await expect(page.locator('#viewerLink')).toHaveAttribute('href', 'https://www.artstation.com/artwork/Z0P43x');
  await expect(page.locator('#viewerCount')).toHaveText('1 / 4');
  await page.locator('#viewerThumbs button').nth(1).click();
  await expect(img).toHaveAttribute('src', /ursula-sculpt\.webp/);
  await page.keyboard.press('ArrowRight');
  await expect(img).toHaveAttribute('src', /ursula-topology\.webp/);
  await page.keyboard.press('ArrowRight');
  await expect(img).toHaveAttribute('src', /ursula-throne\.webp/);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#viewerCount')).toHaveText('1 / 4');
  // every image in the set actually loads
  for (let i = 0; i < 4; i++) {
    await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true);
    await page.keyboard.press('ArrowRight');
  }
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();

  await page.locator('.work[data-project="swan"] .work__media').click();
  await expect(page.locator('#viewerTitle')).toHaveText('Swan & Lotus Relief');
  await expect(page.locator('#viewerLink')).toHaveAttribute('href', 'https://www.artstation.com/artwork/AoQdyW');
  await expect(page.locator('#viewerThumbs button')).toHaveCount(2);
  await page.locator('#viewerThumbs button').nth(1).click();
  await expect(img).toHaveAttribute('src', /swan-breakdown\.webp/);
});

test('video project plays its animation and shows the final still', async ({ page }) => {
  await page.goto('/#works');
  await page.locator('.work[data-project="blossom-lamp"] .work__view').click();
  const video = page.locator('#viewerMedia video');
  await expect(video).toHaveAttribute('src', /blossom-lamp\.mp4/);
  await expect.poll(() => video.evaluate((v) => v.readyState)).toBeGreaterThan(0);
  expect(await video.evaluate((v) => v.duration)).toBeGreaterThan(9);
  await page.locator('#viewerThumbs button').nth(1).click();
  await expect(page.locator('#viewerMedia img')).toHaveAttribute('src', /blossom-lamp\.webp/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#viewerMedia video')).toHaveCount(0);
});

test('YouTube films load only after pressing play', async ({ page }) => {
  const yt = [];
  page.on('request', (r) => (r.url().includes('youtube') ? yt.push(r.url()) : null));
  await page.goto('/#works');
  const featured = page.locator('.work--featured');
  await expect(featured).toHaveAttribute('data-project', 'meta-quest');
  await featured.locator('.work__view').click();
  await expect(page.locator('#viewerTitle')).toHaveText('Meta Quest 3 Campaign');
  await expect(page.locator('#viewerLink')).toHaveAttribute('href', 'https://www.youtube.com/watch?v=miQX34ESRho');
  await expect(page.locator('#viewerThumbs button')).toHaveCount(5);
  expect(yt).toEqual([]);
  await page.getByRole('button', { name: /Play video: Campaign film, part one/ }).click();
  await expect(page.locator('#viewerMedia iframe')).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/miQX34ESRho/);
  await page.locator('#viewerThumbs button').nth(1).click();
  await expect(page.locator('#viewerMedia iframe')).toHaveCount(0);
  await page.getByRole('button', { name: /Play video: Campaign film, part two/ }).click();
  await expect(page.locator('#viewerMedia iframe')).toHaveAttribute('src', /lOjsx8v0duY/);
});

test('filters narrow the project list', async ({ page }) => {
  await page.goto('/#works');
  const visible = page.locator('.work:visible');
  await expect(visible).toHaveCount(5);
  await page.locator('.chip[data-filter="motion"]').click();
  await expect(page.locator('.chip[data-filter="motion"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(visible).toHaveCount(2);
  await page.locator('.chip[data-filter="2d"]').click();
  await expect(visible).toHaveCount(1);
  await expect(visible.first()).toHaveAttribute('data-project', 'vaishnavi');
  await page.locator('.chip[data-filter="all"]').click();
  await expect(visible).toHaveCount(5);
});

test('works cards link to the right pages', async ({ page }) => {
  await page.goto('/#works');
  await expect(page.locator('.work[data-project="ursula"] .work__ext')).toHaveAttribute('href', 'https://www.artstation.com/artwork/Z0P43x');
  await expect(page.locator('.work[data-project="swan"] .work__ext')).toHaveAttribute('href', 'https://www.artstation.com/artwork/AoQdyW');
  await expect(page.locator('.work[data-project="meta-quest"] .work__ext')).toHaveAttribute('href', 'https://www.youtube.com/watch?v=miQX34ESRho');
});

test('keyboard arrows move between tabs', async ({ page, isMobile }) => {
  test.skip(isMobile);
  await page.goto('/');
  await page.locator('#tab-profile').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#works')).toBeVisible();
  await expect(page.locator('#tab-works')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('#contact')).toBeVisible();
});

test('settings toggle turns ambient motion off and persists', async ({ page }) => {
  await page.goto('/');
  await page.locator('#settingsBtn').click();
  await expect(page.locator('#settingsMenu')).toBeVisible();
  await page.locator('label.toggle', { hasText: 'Ambient motion' }).click();
  await expect(page.locator('html')).toHaveClass(/no-motion/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/no-motion/);
});

test('mouse parallax moves the scene layers', async ({ page, isMobile }) => {
  test.skip(isMobile);
  await page.goto('/');
  const charBox = () => page.locator('.hero-char__img').boundingBox();
  await page.waitForTimeout(3200); // let the entrance animation finish
  const before = await page.locator('.layer--bg').evaluate((el) => getComputedStyle(el).transform);
  const podium = () => page.locator('.podium').boundingBox();
  const feetBefore = await charBox();
  const podBefore = await podium();
  await page.mouse.move(50, 50);
  await page.mouse.move(page.viewportSize().width - 20, page.viewportSize().height - 20, { steps: 10 });
  await page.waitForTimeout(2000);
  const after = await page.locator('.layer--bg').evaluate((el) => getComputedStyle(el).transform);
  expect(after).not.toBe(before);
  // she stays grounded: the gap between her feet and the podium does not change
  const feetAfter = await charBox();
  const podAfter = await podium();
  expect(Math.abs(podAfter.x - podBefore.x)).toBeGreaterThan(5); // the podium really moved
  const gapBefore = feetBefore.y + feetBefore.height - podBefore.y;
  const gapAfter = feetAfter.y + feetAfter.height - podAfter.y;
  expect(Math.abs(gapAfter - gapBefore)).toBeLessThan(4);
  const centreBefore = feetBefore.x + feetBefore.width / 2 - podBefore.x;
  const centreAfter = feetAfter.x + feetAfter.width / 2 - podAfter.x;
  expect(Math.abs(centreAfter - centreBefore)).toBeLessThan(6);
});

test('respects prefers-reduced-motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('http://localhost:4173/');
  await expect(page.locator('html')).toHaveClass(/no-motion/);
  await expect(page.locator('#intro')).toBeHidden();
  await context.close();
});

test('intro plays on first visit and can be skipped', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:4173/');
  await expect(page.locator('#intro')).toBeVisible();
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(page.locator('#intro')).toBeHidden({ timeout: 3000 });
  await expect(page.locator('body')).not.toHaveClass(/is-loading/);
  await context.close();
});

test('no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  for (const id of SECTIONS) {
    await page.goto(`/#${id}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, id).toBeLessThanOrEqual(0);
  }
});

test('mobile tab bar is reachable', async ({ page, isMobile }) => {
  test.skip(!isMobile);
  await page.goto('/');
  const bar = page.locator('.sidenav');
  await expect(bar).toBeVisible();
  const box = await bar.boundingBox();
  const vh = page.viewportSize().height;
  expect(box.y + box.height).toBeGreaterThan(vh - 2);
  await page.locator('#tab-contact').click();
  await expect(page.locator('#contact')).toBeInViewport();
});

test('has no serious accessibility violations', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  // Audit the settled page: with reduced motion there are no fade-ins to catch half-way.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const id of SECTIONS) {
    await page.goto(`/#${id}`);
    await expect(page.locator('.panels')).toHaveCSS('opacity', '1');
    const results = await new AxeBuilder({ page }).exclude('.scene').analyze();
    const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`), id).toEqual([]);
  }
});

test('analytics stay off when no site code is set', async ({ page }) => {
  await page.route('**/', async (route) => {
    const res = await route.fetch();
    const body = (await res.text()).replace(/<meta name="goatcounter" content="[^"]*" \/>/, '<meta name="goatcounter" content="" />');
    await route.fulfill({ response: res, body });
  });
  const hits = [];
  page.on('request', (r) => (r.url().includes('gc.zgo.at') ? hits.push(r.url()) : null));
  await page.goto('/');
  await page.locator('#tab-works').click();
  await page.waitForTimeout(300);
  expect(hits).toEqual([]);
});

test('analytics point at the rajnandini dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('script[src="https://gc.zgo.at/count.js"]')).toHaveAttribute('data-goatcounter', 'https://rajnandini.goatcounter.com/count');
});

test('analytics record section views and key clicks when switched on', async ({ page }) => {
  // Serve the page with a site code filled in, and stub the GoatCounter script.
  await page.route('**/', async (route) => {
    const res = await route.fetch();
    const body = (await res.text()).replace(/<meta name="goatcounter" content="[^"]*" \/>/, '<meta name="goatcounter" content="testsite" />');
    await route.fulfill({ response: res, body });
  });
  await page.goto('/');
  await page.locator('#tab-works').click();
  await page.evaluate(() => {
    window.addEventListener('click', (e) => e.preventDefault());
    document.querySelector('#works a[href*="artstation"]').click();
  });
  await page.locator('#tab-contact').click();
  await page.getByRole('button', { name: 'Copy email address' }).click();
  await expect(page.locator('#toast')).toHaveClass(/is-on/);

  const calls = await page.evaluate(() => window.__gc);
  const paths = calls.map((c) => c.path);
  expect(paths).toContain('/');
  expect(paths).toContain('/works');
  expect(paths).toContain('/contact');
  expect(calls).toContainEqual(expect.objectContaining({ path: 'click-artstation', event: true }));
  expect(calls).toContainEqual(expect.objectContaining({ path: 'copy-email', event: true }));
  const script = await page.locator('script[src="https://gc.zgo.at/count.js"]').getAttribute('data-goatcounter');
  expect(script).toBe('https://testsite.goatcounter.com/count');
});
