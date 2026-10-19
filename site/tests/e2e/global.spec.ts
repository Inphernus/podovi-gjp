import { test, expect } from '@playwright/test';

// Taskovi 3–11 dodaju svoje rute u ovaj niz
export const rute = [
  '/',
  '/usluge/',
  '/reference/',
  '/savjeti/',
  '/zatrazi-ponudu/',
  '/hvala/',
  '/o-nama/',
  '/kontakt/',
  '/politika-privatnosti/',
  '/impressum/',
  ...['koliko-se-susi-estrih', 'koji-pod-za-podno-grijanje', 'vinil-ili-laminat', 'linoleum-ili-pvc', 'sto-je-holker'].map((s) => `/savjeti/${s}/`),
  ...['priprema-podloge', 'pvc-podovi', 'lvt-vinil', 'linoleum', 'gumeni-podovi', 'bolon-pleteni-vinil', 'tepih-ploce',
    'tepih-u-roli', 'tepih-na-gripere', 'laminat', 'dupli-podovi', 'epoksidni-podovi', 'zavrsni-radovi'].map((s) => `/usluge/${s}/`),
];

for (const r of rute) {
  test(`osnove ${r}`, async ({ page }) => {
    await page.goto(r);
    await expect(page.locator('html')).toHaveAttribute('lang', 'hr');
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.title()).toMatch(/Podovi GJP/);
  });

  test(`bez horizontalnog skrolanja na 320px ${r}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(r);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw).toBeLessThanOrEqual(320);
  });
}
