import { test, expect } from '@playwright/test';
import { site } from '../../src/lib/site';

test('kontakt ima telefon, e-mail, adresu i link na formu', async ({ page }) => {
  await page.goto('/kontakt/');
  const main = page.locator('main');
  await expect(main.locator('a[href^="tel:"]')).toHaveCount(1);
  await expect(main.locator('a[href^="mailto:"]')).toHaveCount(1);
  await expect(main).toContainText(site.adresa.grad);
  await expect(main.locator('a[href="/zatrazi-ponudu/"]').first()).toBeVisible();
});

test('impressum sadrži pravni naziv', async ({ page }) => {
  await page.goto('/impressum/');
  await expect(page.locator('main')).toContainText(site.pravniNaziv);
});

test('politika privatnosti opisuje obradu podataka iz forme', async ({ page }) => {
  await page.goto('/politika-privatnosti/');
  await expect(page.locator('main')).toContainText('radni nalog');
  await expect(page.locator('main')).toContainText('AZOP');
});

test('o nama ima H1 i link na usluge', async ({ page }) => {
  await page.goto('/o-nama/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main a[href="/usluge/"]').first()).toBeVisible();
});

test('nepostojeća stranica vraća 404 s korisnim linkovima', async ({ page }) => {
  const odgovor = await page.goto('/ne-postoji/');
  expect(odgovor?.status()).toBe(404);
  await expect(page.locator('main a[href="/usluge/"]').first()).toBeVisible();
  await expect(page.locator('main a[href="/zatrazi-ponudu/"]').first()).toBeVisible();
});

test('nijedan gumb ne sadrži strelicu', async ({ page }) => {
  for (const r of ['/', '/kontakt/', '/usluge/pvc-podovi/']) {
    await page.goto(r);
    const tekstovi = await page.locator('a.btn, button').allTextContents();
    for (const t of tekstovi) expect(t, r).not.toContain('→');
  }
});

test('impressum sadrži registarske podatke društva', async ({ page }) => {
  await page.goto('/impressum/');
  const main = page.locator('main');
  for (const t of ['70545360117', '05330122', 'Trgovački sud u Zagrebu', '2.654,00 EUR', 'Goran Šimac', '10010 Zagreb']) {
    await expect(main).toContainText(t);
  }
});
