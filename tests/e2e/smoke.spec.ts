import { expect, test, type Page } from '@playwright/test';

const SHOTS = 'screenshots';

type Store = {
  getState: () => Record<string, unknown> & { focus: (id: string | null) => void };
  setState: (patch: Record<string, unknown>) => void;
};

async function open(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('./');
  await page.waitForFunction(() => document.body.dataset.sceneReady === 'true');
  // Hold the model still so screenshots are repeatable.
  await setState(page, { autoRotate: false, spinProp: false });
  return errors;
}

function setState(page: Page, patch: Record<string, unknown>) {
  return page.evaluate((p) => (window as unknown as { droneAnatomy: { useStore: Store } }).droneAnatomy.useStore.setState(p), patch);
}

function getState<T>(page: Page, key: string) {
  return page.evaluate((k) => (window as unknown as { droneAnatomy: { useStore: Store } }).droneAnatomy.useStore.getState()[k], key) as Promise<T>;
}

test('renders the Shahed-136 with no errors', async ({ page }) => {
  const errors = await open(page);
  await expect(page.getByRole('heading', { name: 'Shahed-136' })).toBeVisible();
  await expect(page.locator('.viewer canvas')).toBeVisible();
  // First visit: a short gesture hint instead of instructions to read.
  await expect(page.locator('.banner.hint')).toContainText('Drag to spin');
  // Headline numbers are tiles; the long text is folded away until asked for.
  await expect(page.locator('.overview .tiles.big > div')).toHaveCount(6);
  await expect(page.getByText('Shahed Aviation Industries', { exact: false })).toBeHidden();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/01-overview.png` });
  await page.getByText('About the Shahed-136').click();
  await expect(page.getByText('Shahed Aviation Industries', { exact: false })).toBeVisible();
  // The hint goes away once you touch the model.
  await page.locator('.viewer canvas').click({ position: { x: 20, y: 20 } });
  await expect(page.locator('.banner.hint')).toBeHidden();
  expect(errors).toEqual([]);
});

test('clicking a part in the tree shows its info and reveals it with X-ray', async ({ page }) => {
  const errors = await open(page);
  // Systems start folded; open the fuel system to see its parts.
  const tree = page.locator('.parts-tree');
  await expect(tree.getByRole('button', { name: 'Body fuel tank', exact: true })).toHaveCount(0);
  await tree.getByRole('button', { name: 'Fuel system parts' }).click();
  await tree.getByRole('button', { name: 'Body fuel tank', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Body fuel tank' })).toBeVisible();
  await expect(page.locator('.part-info .evidence')).toHaveText(/Documented/);
  await expect(page.locator('.part-info .system-chip')).toHaveText(/Fuel system/);
  // The tank is inside the shell, so X-ray switches on by itself.
  expect(await getState(page, 'xray')).toBe('full');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/02-fuel-tank-selected.png` });
  await page.locator('.info-nav').getByRole('button', { name: 'Shahed-136' }).click();
  await expect(page.getByRole('heading', { name: 'Shahed-136' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('fuel system focus: full X-ray with the fuel parts highlighted', async ({ page }) => {
  await open(page);
  await page.locator('.parts-tree').getByRole('button', { name: 'Fuel system', exact: true }).click();
  await expect(page.locator('.banner')).toContainText('Fuel system');
  expect(await getState(page, 'xray')).toBe('full');
  expect(await getState(page, 'focusSystem')).toBe('fuel');
  // Focusing a system also opens it in the parts list.
  await expect(page.locator('.parts-tree').getByRole('button', { name: 'Fuel pump', exact: true })).toBeVisible();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SHOTS}/03-fuel-system-xray.png` });
  await page.locator('.banner').getByRole('button', { name: 'Stop focusing' }).click();
  expect(await getState(page, 'focusSystem')).toBe(null);
});

test('hover lens shows the parts under the pointer', async ({ page }) => {
  await open(page);
  await page.getByRole('radio', { name: 'Lens' }).click();
  await expect(page.locator('.banner.subtle')).toBeVisible();
  const canvas = page.locator('.viewer canvas');
  const box = (await canvas.boundingBox())!;
  // Sweep across the middle of the body until the lens finds an inner part.
  let hovered: string | null = null;
  for (let dx = -0.12; dx <= 0.12 && !hovered; dx += 0.02) {
    await page.mouse.move(box.x + box.width * (0.5 + dx), box.y + box.height * 0.52);
    await page.waitForTimeout(150);
    hovered = await getState<string | null>(page, 'hoveredId');
  }
  expect(hovered, 'an inner part is picked through the see-through lens').toBeTruthy();
  await expect(page.locator('.hover-tag')).toHaveCSS('opacity', '1');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SHOTS}/04-hover-lens.png` });
});

test('explode button pulls the drone apart and back', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Explode' }).click();
  expect(await getState(page, 'explode')).toBe(1);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SHOTS}/05-exploded.png` });
  await page.getByRole('button', { name: 'Explode' }).click();
  expect(await getState(page, 'explode')).toBe(0);
});

test('labels name every part', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Labels' }).click();
  const callouts = page.locator('.callout');
  // One callout per part in the parts tree (with every system opened).
  for (const toggle of await page.locator('.parts-tree .expand').all()) await toggle.click();
  await expect(callouts).toHaveCount(await page.locator('.parts-tree li').count());
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/06-labels.png` });
  // Hiding a part hides its label, and a "Show all" pill brings it back.
  await page.getByRole('button', { name: 'Hide Rocket launch booster' }).click();
  await expect(page.locator('.callout', { hasText: 'Rocket launch booster' })).toBeHidden();
  await page.locator('.stage-top').getByRole('button', { name: 'Show all' }).click();
  await expect(page.locator('.callout', { hasText: 'Rocket launch booster' })).toBeVisible();
});

test('library lists kamikaze and interceptor drones', async ({ page }) => {
  await open(page);
  await page.locator('.drone-picker').click();
  const dialog = page.getByRole('dialog', { name: 'Drone library' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('tab', { name: 'Interceptors' }).click();
  await expect(dialog.locator('.card')).toHaveCount(3);
  await dialog.getByRole('tab', { name: 'All' }).click();
  await page.screenshot({ path: `${SHOTS}/07-library.png` });
  await dialog.getByRole('button', { name: 'Close library' }).click();
  await expect(dialog).toBeHidden();
});

test('realistic tab embeds the Sketchfab model with credit', async ({ page }) => {
  await open(page);
  await page.getByRole('tab', { name: 'Realistic' }).click();
  const frame = page.locator('.realistic iframe');
  await expect(frame).toHaveAttribute('src', /sketchfab\.com\/models\/e09fba235055433ba7bb7fb5a0d4da87\/embed/);
  await expect(page.locator('.realistic .credit')).toContainText('nitroexpress');
});

test('phone layout @mobile', async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator('.viewer canvas')).toBeVisible();
  // The top bar fits on one row and nothing scrolls sideways.
  const bar = (await page.locator('.topbar').boundingBox())!;
  expect(bar.height).toBeLessThan(70);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  // Touch wording in the hint, and the whole dock is on screen.
  await expect(page.locator('.banner.hint')).toContainText('Tap a part', { useInnerText: true });
  const dock = (await page.locator('.toolbar').boundingBox())!;
  expect(dock.x).toBeGreaterThanOrEqual(0);
  expect(dock.x + dock.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/08-mobile.png` });
  // Systems are one tap away right under the model.
  await page.locator('.system-grid').getByRole('button', { name: 'Fuel system' }).click();
  expect(await getState(page, 'focusSystem')).toBe('fuel');
  expect(errors).toEqual([]);
});
