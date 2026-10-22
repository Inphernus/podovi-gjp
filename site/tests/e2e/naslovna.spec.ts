import { test, expect } from '@playwright/test';

test('hero: H1 i kumov uvod', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Stručnjaci za podne obloge');
  await expect(page.locator('.hero .lead')).toContainText('epoksidne sustave');
});

test('objekti vode u formu s unaprijed odabranim tipom', async ({ page }) => {
  await page.goto('/');
  const linkovi = page.locator('[data-objekti] a');
  await expect(linkovi).toHaveCount(8);
  await expect(linkovi.first()).toHaveAttribute('href', '/zatrazi-ponudu/?objekt=ured');
});

test('klik na sloj prikazuje njegov opis', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: /Nivelir masa/ }).click();
  const clanak = page.locator('#sloj-nivelir');
  await expect(clanak).toBeVisible();
  await expect(clanak.getByRole('heading')).toHaveText('Samorazlijevajuća masa za izravnavanje');
  await expect(clanak.getByRole('link')).toHaveAttribute('href', '/usluge/priprema-podloge/');
  await expect(page.locator('#sloj-lvt')).toBeHidden();
  await expect(page.locator('.layer-btn[aria-selected="true"]')).toHaveCount(1);
});

test('sloj se aktivira tipkovnicom', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: /Estrih/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#sloj-estrih')).toBeVisible();
});

test.describe('bez JavaScripta', () => {
  test.use({ javaScriptEnabled: false });
  test('svi slojevi i opisi su vidljivi', async ({ page }) => {
    await page.goto('/');
    for (const id of ['lvt', 'ljepilo', 'nivelir', 'estrih', 'grijanje', 'xps', 'beton']) {
      await expect(page.locator(`#sloj-${id}`)).toBeVisible();
    }
  });
});

test('smanjeno kretanje: presjek je statično raslojen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const gap = await page.locator('.stack').evaluate((el) => getComputedStyle(el).getPropertyValue('--gap').trim());
  expect(gap).toBe('46px');
});

test('mobilni izbornik se otvara i zatvara tipkom Escape', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const gumb = page.getByRole('button', { name: 'Otvori izbornik' });
  await gumb.click();
  const ladica = page.getByRole('dialog', { name: 'Izbornik' });
  await expect(ladica).toBeVisible();
  // 5 poveznica + telefon + „Zatraži ponudu” (kao Sign In + CTA u originalu)
  await expect(ladica.getByRole('link')).toHaveCount(7);
  await page.keyboard.press('Escape');
  await expect(ladica).toBeHidden();
  await expect(gumb).toBeFocused();
});
