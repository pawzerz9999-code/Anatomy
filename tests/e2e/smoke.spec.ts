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
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/01-overview.png` });
  expect(errors).toEqual([]);
});

test('clicking a part in the tree shows its info and reveals it with X-ray', async ({ page }) => {
  const errors = await open(page);
  await page.getByRole('button', { name: 'Body fuel tank', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Body fuel tank' })).toBeVisible();
  await expect(page.locator('.part-info .evidence')).toHaveText(/Publicly documented/);
  await expect(page.locator('.part-info .system-chip')).toHaveText(/Fuel system/);
  // The tank is inside the shell, so X-ray switches on by itself.
  expect(await getState(page, 'xray')).toBe('full');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/02-fuel-tank-selected.png` });
  await page.getByRole('button', { name: /Shahed-136 overview/ }).click();
  await expect(page.getByRole('heading', { name: 'Shahed-136' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('fuel system focus: full X-ray with the fuel parts highlighted', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'X-ray focus on Fuel system' }).first().click();
  await expect(page.locator('.banner')).toContainText('Fuel system');
  expect(await getState(page, 'xray')).toBe('full');
  expect(await getState(page, 'focusSystem')).toBe('fuel');
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

test('explode slider pulls the drone apart', async ({ page }) => {
  await open(page);
  await page.getByLabel('Explode').fill('100');
  expect(await getState(page, 'explode')).toBe(1);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SHOTS}/05-exploded.png` });
});

test('labels name every part', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Labels' }).click();
  const callouts = page.locator('.callout');
  // One callout per part in the parts tree.
  await expect(callouts).toHaveCount(await page.locator('.parts-tree li').count());
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/06-labels.png` });
  // Hiding a part hides its label.
  await page.getByRole('button', { name: 'Hide Rocket launch booster' }).click();
  await expect(page.locator('.callout', { hasText: 'Rocket launch booster' })).toBeHidden();
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
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/08-mobile.png` });
  expect(errors).toEqual([]);
});
