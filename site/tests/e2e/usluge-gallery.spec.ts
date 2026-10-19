import { test, expect } from '@playwright/test';

const FOKUS = ['/usluge/lvt-vinil/', '/usluge/tepih-ploce/', '/usluge/pvc-podovi/', '/usluge/epoksidni-podovi/'];
const OSTALE = [
  '/usluge/priprema-podloge/', '/usluge/linoleum/', '/usluge/gumeni-podovi/', '/usluge/bolon-pleteni-vinil/',
  '/usluge/tepih-u-roli/', '/usluge/tepih-na-gripere/', '/usluge/laminat/', '/usluge/dupli-podovi/', '/usluge/zavrsni-radovi/',
];

test.describe('bez JavaScripta', () => {
  test.use({ javaScriptEnabled: false });
  test('galerija ima linkove na 4 glavne usluge', async ({ page }) => {
    await page.goto('/');
    const galerija = page.locator('[data-usluge-galerija]');
    for (const href of FOKUS) await expect(galerija.locator(`a[href="${href}"]`)).toHaveCount(1);
  });
});

test('ispod galerije su linkovi na ostalih 9 usluga', async ({ page }) => {
  await page.goto('/');
  const ostale = page.locator('[data-usluge-ostale]');
  for (const href of OSTALE) await expect(ostale.locator(`a[href="${href}"]`)).toHaveCount(1);
});

test('fokus tipkovnicom otvara drugi panel', async ({ page }) => {
  await page.goto('/');
  const paneli = page.locator('[data-usluge-galerija] [data-panel]');
  await expect(paneli).toHaveCount(4);
  await page.waitForSelector('[data-usluge-galerija]');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await paneli.nth(1).locator('button').focus();
  await expect(paneli.nth(1).locator('button')).toHaveAttribute('aria-expanded', 'true');
  await expect(paneli.nth(0).locator('button')).toHaveAttribute('aria-expanded', 'false');
});

test('kako radimo ima 5 koraka', async ({ page }) => {
  await page.goto('/');
  const koraci = page.locator('[data-proces] ol > li');
  await expect(koraci).toHaveCount(5);
  await expect(koraci.first()).toContainText('Izlazak na teren');
});

test('FAQ ima 5 pitanja i jedan FAQPage JSON-LD', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-faq] details')).toHaveCount(5);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.filter((t) => t.includes('"FAQPage"'))).toHaveLength(1);
});
