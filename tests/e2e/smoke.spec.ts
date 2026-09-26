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
  await expect(dialog.locator('.card')).toHaveCount(5);
  await expect(dialog.locator('.card:not(:disabled)')).toHaveCount(3);
  await dialog.getByRole('tab', { name: 'All' }).click();
  await page.screenshot({ path: `${SHOTS}/07-library.png` });
  await dialog.getByRole('button', { name: 'Close library' }).click();
  await expect(dialog).toBeHidden();
});

test('realistic tab embeds both Sketchfab models with credit', async ({ page }) => {
  await open(page);
  await page.getByRole('tab', { name: 'Realistic' }).click();
  const frame = page.locator('.realistic iframe');
  await expect(frame).toHaveAttribute('src', /sketchfab\.com\/models\/e09fba235055433ba7bb7fb5a0d4da87\/embed/);
  await expect(page.locator('.realistic .credit')).toContainText('nitroexpress');
  await page.locator('.model-switch').getByRole('tab', { name: /by harry/ }).click();
  await expect(frame).toHaveAttribute('src', /bfc7a02b26814f51a265e57fcf2babc6/);
  await expect(page.locator('.realistic .credit')).toContainText('harry');
});

test('launch tab: booster fires, drops away and the engine takes over', async ({ page }) => {
  const errors = await open(page);
  await page.getByRole('tab', { name: 'Launch' }).click();
  await page.waitForFunction(() => document.body.dataset.launchReady === 'true');
  await expect(page.locator('.launch-caption')).toContainText('On the launch rack');
  await expect(page.locator('.info')).toContainText('What is it made of?');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SHOTS}/09-launch-rack.png` });
  await page.getByRole('button', { name: '▶ Launch' }).click();
  for (const [phase, text] of [
    [1, 'The booster fires'],
    [2, 'The booster drops away'],
    [3, 'The engine takes over'],
  ] as const) {
    await page.waitForFunction(
      (p) => (window as unknown as { droneAnatomy: { useStore: Store } }).droneAnatomy.useStore.getState().launchPhase === p,
      phase,
      { timeout: 60_000 },
    );
    await expect(page.locator('.launch-caption')).toContainText(text);
    if (phase === 1) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SHOTS}/10-launch-boost.png` });
    }
  }
  await page.getByRole('button', { name: /Back to the rack/ }).click();
  await expect(page.locator('.launch-caption')).toContainText('On the launch rack');
  expect(errors).toEqual([]);
});

test('interceptors load with every part', async ({ page }) => {
  const errors = await open(page);
  for (const name of ['Sting', 'Strila', 'P1-SUN']) {
    await page.locator('.drone-picker').click();
    await page.getByRole('dialog', { name: 'Drone library' }).getByRole('button', { name: new RegExp(`^Interceptors ${name}`) }).click();
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    const parts = await page.locator('.parts-tree li').count();
    await page.waitForFunction(
      (n) => (window as unknown as { droneAnatomy: { partRegistry: Map<string, unknown> } }).droneAnatomy.partRegistry.size === n,
      parts,
    );
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SHOTS}/11-p1-sun.png` });
  expect(errors).toEqual([]);
});

test('learn guides explain materials, radar and engines', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Learn' }).click();
  const dialog = page.getByRole('dialog', { name: 'Airframe materials & radar' });
  await expect(dialog).toContainText('Is a carbon-fibre drone invisible to radar?');
  await dialog.getByRole('tab', { name: 'Engines & propulsion' }).click();
  await expect(page.getByRole('dialog', { name: 'Engines & propulsion' })).toContainText('548 cc');
  await page.screenshot({ path: `${SHOTS}/12-guide-engines.png` });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('phone layout @mobile', async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator('.viewer canvas')).toBeVisible();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/08-mobile.png` });
  expect(errors).toEqual([]);
});
