import { test, expect } from '@playwright/test';

const IDS = ['lvt', 'ljepilo', 'nivelir', 'estrih', 'grijanje', 'xps', 'beton'];

// Položaj skrola (0–1 unutar ljepljive pozornice) na sredini segmenta sloja i
const skrolajDoSloja = (page: import('@playwright/test').Page, i: number) =>
  page.evaluate((i) => {
    const stage = document.querySelector<HTMLElement>('.presjek .stage')!;
    const raspon = stage.offsetHeight - innerHeight;
    const kraj = Number(stage.dataset.raslojavanjeKraj);
    const p = kraj + ((i + 0.5) * (1 - kraj)) / 7;
    scrollTo({ top: stage.offsetTop + p * raspon, behavior: 'instant' });
  }, i);

test.use({ viewport: { width: 1440, height: 900 } });

test('skrolanjem se slojevi aktiviraju jedan po jedan', async ({ page }) => {
  await page.goto('/');
  for (const [i, id] of IDS.entries()) {
    await skrolajDoSloja(page, i);
    await expect(page.locator(`#sloj-${id}`)).toBeVisible();
    await expect(page.locator(`.layer-btn[data-id="${id}"]`)).toHaveAttribute('aria-pressed', 'true');
  }
});

test('skrolanje unatrag vraća prethodni sloj', async ({ page }) => {
  await page.goto('/');
  await skrolajDoSloja(page, 5);
  await expect(page.locator('#sloj-xps')).toBeVisible();
  await skrolajDoSloja(page, 1);
  await expect(page.locator('#sloj-ljepilo')).toBeVisible();
});

test('klik na sloj skrola do njegovog mjesta i ostaje aktivan', async ({ page }) => {
  await page.goto('/');
  await skrolajDoSloja(page, 0);
  await page.locator('.layer-btn[data-id="estrih"]').click();
  await page.waitForTimeout(900);
  await expect(page.locator('#sloj-estrih')).toBeVisible();
  await expect(page.locator('.layer-btn[aria-pressed="true"]')).toHaveAttribute('data-id', 'estrih');
});
