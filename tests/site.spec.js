import { test, expect } from '@playwright/test';

const SECTIONS = ['profile', 'works', 'skills', 'about', 'contact'];

// Skip the cinematic intro for most tests.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('intro:seen', '1'));
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
  await page.locator('.feature img').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.images].filter((i) => !i.closest('[hidden]') && !i.closest('dialog')).every((i) => i.complete));
  const broken = await page.$$eval('img', (imgs) =>
    imgs.filter((i) => i.getAttribute('src') && !(i.complete && i.naturalWidth > 0) && !i.closest('dialog') && !i.closest('[hidden]')).map((i) => i.src),
  );
  expect(broken).toEqual([]);
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

test('artwork opens in the lightbox and closes with Escape', async ({ page }) => {
  await page.goto('/#works');
  await page.locator('.feature').click();
  const dialog = page.locator('#lightbox');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('src', /character-2000\.webp/);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
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
  const feetBefore = await charBox();
  await page.mouse.move(50, 50);
  await page.mouse.move(page.viewportSize().width - 20, page.viewportSize().height - 20, { steps: 10 });
  await page.waitForTimeout(2000);
  const after = await page.locator('.layer--bg').evaluate((el) => getComputedStyle(el).transform);
  expect(after).not.toBe(before);
  const lean = await page.locator('.hero-char').evaluate((el) => el.style.getPropertyValue('--rz'));
  expect(parseFloat(lean)).toBeGreaterThan(0.3);
  // feet stay planted: bottom edge of the figure barely moves vertically
  const feetAfter = await charBox();
  expect(Math.abs(feetAfter.y + feetAfter.height - (feetBefore.y + feetBefore.height))).toBeLessThan(20);
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
  for (const id of SECTIONS) {
    await page.goto(`/#${id}`);
    await page.waitForTimeout(900); // let panel entrance animations settle
    const results = await new AxeBuilder({ page }).exclude('.scene').analyze();
    const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`), id).toEqual([]);
  }
});

test('analytics stay off when no site code is set', async ({ page }) => {
  const hits = [];
  page.on('request', (r) => r.url().includes('goatcounter') || r.url().includes('gc.zgo.at') ? hits.push(r.url()) : null);
  await page.goto('/');
  await page.locator('#tab-works').click();
  await page.waitForTimeout(300);
  expect(hits).toEqual([]);
});

test('analytics record section views and key clicks when switched on', async ({ page }) => {
  // Serve the page with a site code filled in, and stub the GoatCounter script.
  await page.route('**/', async (route) => {
    const res = await route.fetch();
    const body = (await res.text()).replace('<meta name="goatcounter" content="" />', '<meta name="goatcounter" content="testsite" />');
    await route.fulfill({ response: res, body });
  });
  await page.route('https://gc.zgo.at/count.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: 'window.__gc = []; window.goatcounter.count = (p) => window.__gc.push(p);' }),
  );
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
