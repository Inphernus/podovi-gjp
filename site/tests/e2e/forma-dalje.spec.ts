import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/zatrazi-ponudu/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
});

test('odabir samo označi odgovor; dalje se ide gumbom Dalje', async ({ page }) => {
  await page.getByRole('radio', { name: 'Zdravstvena ustanova' }).click();
  await expect(page.getByRole('radio', { name: 'Zdravstvena ustanova' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('heading', { name: 'Za kakav prostor tražite pod?' })).toBeVisible();
  await page.getByRole('button', { name: 'Dalje' }).click();
  await expect(page.getByRole('heading', { name: 'Znate li već koju oblogu želite?' })).toBeVisible();
});

test('Dalje bez odgovora javlja grešku i ostaje na koraku', async ({ page }) => {
  await page.getByRole('button', { name: 'Dalje' }).click();
  await expect(page.getByText('Odaberite jedan odgovor.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Za kakav prostor tražite pod?' })).toBeVisible();
});

test('prelazak na sljedeći korak ima fade-in animaciju', async ({ page }) => {
  await page.getByRole('radio', { name: 'Zdravstvena ustanova' }).click();
  await page.getByRole('button', { name: 'Dalje' }).click();
  const anim = await page.locator('.nalog-korak').evaluate((el) => {
    const s = getComputedStyle(el);
    return { ime: s.animationName, trajanje: parseFloat(s.animationDuration) };
  });
  expect(anim.ime).toBe('korak-ulaz');
  expect(anim.trajanje).toBeGreaterThanOrEqual(0.4);
});
