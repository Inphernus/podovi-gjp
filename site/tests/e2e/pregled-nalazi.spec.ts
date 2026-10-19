import { test, expect } from '@playwright/test';

// Nalazi završnog pregleda (Important), svaki s testom koji je prvo pao
test('strelica mijenja odabir bez prelaska na sljedeći korak', async ({ page }) => {
  await page.goto('/zatrazi-ponudu/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await page.getByRole('radio').first().focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('heading', { name: 'Za kakav prostor tražite pod?' })).toBeVisible();
  await expect(page.getByRole('radio').nth(1)).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('radio').nth(1)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Znate li već koju oblogu želite?' })).toBeVisible();
});

test('ako se JS forme ne učita, prikazuje se obična forma', async ({ page }) => {
  await page.route(/\/_astro\/.*\.js$/, (r) => r.abort());
  await page.goto('/zatrazi-ponudu/');
  await expect(page.locator('form[name="radni-nalog"]')).toBeVisible({ timeout: 8000 });
});

test('kad JS radi, postoji samo jedna forma', async ({ page }) => {
  await page.goto('/zatrazi-ponudu/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await expect(page.locator('form[name="radni-nalog"]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Za kakav prostor|Znate li|Kakav raspored|Kolika je|Kakva je|Tehnički|Gdje je|Kome šaljemo/ })).toBeVisible();
});

test('politika privatnosti navodi Netlify i prijenos u SAD', async ({ page }) => {
  await page.goto('/politika-privatnosti/');
  await expect(page.locator('main')).toContainText('Netlify');
  await expect(page.locator('main')).toContainText('SAD');
  await expect(page.locator('main')).toContainText('sessionStorage');
});

test('skriveno polje za datoteku nije zasebna stanica tabulatora', async ({ page }) => {
  await page.goto('/zatrazi-ponudu/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await page.evaluate(() => sessionStorage.setItem('gjp-radni-nalog', JSON.stringify({ a: { objekt: 'hotel', obloga: 'epoksid', povrsina: '50-150', podloga: 'ne-znam', niveliranje: 'da', 'starost-estriha': 'ne-znam', 'podno-grijanje': 'ne', lokacija: 'Split', kat: 'prizemlje', dizalo: 'da', pocetak: 'odmah' }, korak: 'kontakt' })));
  await page.reload();
  await expect(page.locator('#nalog-prilog')).toHaveAttribute('tabindex', '-1');
});
