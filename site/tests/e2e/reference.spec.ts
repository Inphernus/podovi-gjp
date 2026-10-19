import { test, expect } from '@playwright/test';

test('reference: kartica prikazuje tip, oblogu, površinu i grad', async ({ page }) => {
  await page.goto('/reference/');
  const kartica = page.locator('[data-referenca]').filter({ hasText: 'Split' }).first();
  await expect(kartica).toContainText('Hoteli i ugostiteljstvo');
  await expect(kartica).toContainText('LVT vinil podovi');
  await expect(kartica).toContainText('1.200 m²');
});

test.describe('bez JavaScripta', () => {
  test.use({ javaScriptEnabled: false });
  test('filtar po tipu objekta radi preko sidara', async ({ page }) => {
    await page.goto('/reference/');
    await expect(page.locator('[data-filter] a[href="#hotel"]')).toHaveCount(1);
    await expect(page.locator('section#hotel [data-referenca]')).not.toHaveCount(0);
  });
});

test('naslovna prikazuje 3 istaknute reference', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-reference-istaknute] [data-referenca]')).toHaveCount(3);
});

test('stranica usluge prikazuje povezane reference', async ({ page }) => {
  await page.goto('/usluge/lvt-vinil/');
  await expect(page.locator('[data-povezane-reference] [data-referenca]')).not.toHaveCount(0);
});
