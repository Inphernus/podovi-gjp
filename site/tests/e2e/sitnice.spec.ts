import { test, expect, type Page } from '@playwright/test';

const KONTAKT = {
  a: { objekt: 'hotel', obloga: 'epoksid', povrsina: '50-150', podloga: 'ne-znam', niveliranje: 'da', 'starost-estriha': 'ne-znam', 'podno-grijanje': 'ne', lokacija: 'Split', kat: 'prizemlje', dizalo: 'da', pocetak: 'odmah' },
  korak: 'kontakt',
};
const naKorak = async (page: Page, stanje: object) => {
  await page.goto('/zatrazi-ponudu/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await page.evaluate((s) => sessionStorage.setItem('gjp-radni-nalog', JSON.stringify(s)), stanje);
  await page.reload();
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  // island je preuzeo stranicu (vratio stanje i maknuo rezervnu formu)
  await page.waitForFunction(() => (window as unknown as { __gjpNalog?: boolean }).__gjpNalog === true);
};

test('Enter u polju lokacije vodi na sljedeći korak', async ({ page }) => {
  await naKorak(page, { a: { ...KONTAKT.a, lokacija: '' }, korak: 'lokacija' });
  const polje = page.getByLabel('Grad ili mjesto');
  await polje.fill('Split');
  await polje.press('Enter');
  await expect(page.getByRole('heading', { name: 'Kome šaljemo ponudu?' })).toBeVisible();
});

test('kriva vrsta priloga javlja se odmah pri odabiru', async ({ page }) => {
  await naKorak(page, KONTAKT);
  await page.getByLabel(/Priložite troškovnik/).setInputFiles({ name: 'virus.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('x') });
  await expect(page.getByText('Ovu vrstu datoteke ne možemo primiti.')).toBeVisible();
});

test('kontakt podaci se ne spremaju u preglednik', async ({ page }) => {
  await naKorak(page, KONTAKT);
  await page.getByLabel('Ime i prezime').fill('Ana Horvat');
  await page.getByLabel('E-mail').fill('ana@primjer.hr');
  const spremljeno = await page.evaluate(() => sessionStorage.getItem('gjp-radni-nalog') ?? '');
  expect(spremljeno).not.toContain('Ana Horvat');
  expect(spremljeno).not.toContain('ana@primjer.hr');
  expect(spremljeno).toContain('Split');
});

test.describe('bez JavaScripta', () => {
  test.use({ javaScriptEnabled: false });
  test('raspored nije obavezan u rezervnoj formi', async ({ page }) => {
    await page.goto('/zatrazi-ponudu/');
    await expect(page.locator('form[name="radni-nalog"] input[name="raspored"][required]')).toHaveCount(0);
  });
});

test('presjek koristi tablist semantiku', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.presjek [role="tablist"]')).toHaveCount(1);
  await expect(page.locator('.presjek [role="tab"]')).toHaveCount(7);
  await expect(page.locator('.presjek [role="tab"][aria-selected="true"]')).toHaveCount(1);
  await expect(page.locator('.presjek [role="tabpanel"]#sloj-lvt')).toBeVisible();
});

test('članci imaju og:type article', async ({ page }) => {
  await page.goto('/savjeti/sto-je-holker/');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await page.goto('/');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
});

test('okvir Radni nalog je zaobljen kao kartice odgovora', async ({ page }) => {
  await naKorak(page, KONTAKT);
  const r = await page.locator('[aria-label="Radni nalog"] > div').evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
  expect(r).toBeGreaterThanOrEqual(12);
});
