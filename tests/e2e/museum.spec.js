import { test, expect } from '@playwright/test';
import { MUSEUM } from '../../src/config/museum.js';
import { prepareConfig } from '../../src/lib/config.js';

/** Expectations come from the config, so editing titles and names never breaks the tests. */
const museum = prepareConfig(MUSEUM);
const { catalogue } = museum;
const firstMasterpiece = museum.photos.length;
/** Loading paints every masterpiece; software WebGL in CI is far slower than a real GPU. */
const MUSEUM_LOAD_TIMEOUT = 180_000;

const enterMuseum = async (page) => {
  await page.goto('./?debug');
  const stub = page.locator('.ticket__stub');
  await expect(stub).toBeVisible({ timeout: MUSEUM_LOAD_TIMEOUT });
  await stub.click();
  await expect(page.locator('#hud')).toBeVisible();
  await page.waitForFunction(() => window.__museum?.player.mode === 'walk');
};

test('the ticket shows the guest of honour and opens the museum', async ({ page }) => {
  await page.goto('./?debug');
  await expect(page.locator('#ticket-title')).toHaveText(museum.museumName, { timeout: MUSEUM_LOAD_TIMEOUT });
  await expect(page.locator('.ticket__details')).toContainText('Guest of honour');
  await expect(page.locator('.ticket__dedication')).toHaveText(museum.ticket.dedication);
  await page.locator('.ticket__stub').click();
  await expect(page.locator('#entrance')).toBeHidden();
  await expect(page.locator('.hud__room')).not.toBeEmpty();
});

test('selecting an exhibit opens its placard and marks it seen', async ({ page }) => {
  await enterMuseum(page);
  await page.evaluate(() => window.__museum.showExhibit(window.__museum.world.tour[0]));
  const placard = page.locator('#placard');
  await expect(placard).toBeVisible();
  await expect(page.locator('#placard-title')).toHaveText(catalogue[0].title);
  await expect(page.locator('.tally').first()).toContainText(`1/${catalogue.length}`);

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('#placard-title')).toHaveText(catalogue[1].title);

  await page.keyboard.press('Escape');
  await expect(placard).toBeHidden();
});

test('masterpieces offer a restoration slider', async ({ page }) => {
  await enterMuseum(page);
  await page.evaluate((index) => window.__museum.showExhibit(window.__museum.world.tour[index]), firstMasterpiece);
  const slider = page.getByLabel('Restoration view');
  await expect(slider).toBeVisible();
  await slider.fill('60');
  await expect(slider).toHaveValue('60');
});

test('walking forward moves the visitor and walls stop them', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard walking is a desktop control');
  await enterMuseum(page);
  await page.evaluate(() => window.__museum.player.jumpTo({ x: 0, z: -20, yaw: Math.PI / 2, pitch: 0 }));
  await page.keyboard.down('KeyW');
  await page.waitForFunction(() => window.__museum.player.pose.x < -4.5, null, { timeout: 90_000 });
  await page.keyboard.up('KeyW');
  const { x } = await page.evaluate(() => window.__museum.player.pose);
  expect(x).toBeGreaterThan(-5.5);
});

test('the floor plan lists every exhibit and can take you to one', async ({ page }) => {
  await enterMuseum(page);
  await page.getByRole('button', { name: 'Floor plan and exhibit list' }).click();
  const dialog = page.getByRole('dialog', { name: 'Floor plan' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.plan__item')).toHaveCount(catalogue.length);
  await dialog.locator('.plan__item').nth(4).click();
  await expect(page.locator('#placard-title')).toHaveText(catalogue[4].title);
});

test('the letter cannot be declined', async ({ page }) => {
  await enterMuseum(page);
  await page.evaluate(() => window.__museum.openLetter());
  const dialog = page.getByRole('dialog', { name: 'A letter for you' });
  await expect(dialog).toContainText(museum.finalLetter.greeting);
  const no = dialog.locator('.renewal__no');
  for (let attempt = 0; attempt < 10 && (await no.textContent()) !== 'Fine, renew it'; attempt += 1) {
    await no.click({ force: true });
  }
  await expect(no).toHaveText('Fine, renew it');
  await no.click({ force: true });
  await expect(dialog).toContainText('Membership status: renewed.');
});

test('finding a heart is counted', async ({ page }) => {
  await enterMuseum(page);
  await page.evaluate(() => window.__museum.activate(window.__museum.world.interactables.find((item) => item.id === 'month-1')));
  await expect(page.locator('.tally--hearts')).toContainText('1/6');
  await expect(page.locator('#toast')).toContainText('1 of 6 found');
});
