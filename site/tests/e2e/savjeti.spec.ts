import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

export const SAVJETI = ['koliko-se-susi-estrih', 'koji-pod-za-podno-grijanje', 'vinil-ili-laminat', 'linoleum-ili-pvc', 'sto-je-holker'];

test('popis savjeta ima 5 članaka', async ({ page }) => {
  await page.goto('/savjeti/');
  for (const s of SAVJETI) await expect(page.locator(`main a[href="/savjeti/${s}/"]`).first()).toBeVisible();
});

for (const s of SAVJETI) {
  test(`članak ${s}`, async ({ page }) => {
    const d = matter(readFileSync(join(process.cwd(), 'src/content/savjeti', `${s}.md`), 'utf8')).data;
    await page.goto(`/savjeti/${s}/`);
    await expect(page.locator('h1')).toHaveText(d.naslov);
    await expect(page.locator('main p').first()).toHaveText(d.kratakOdgovor);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('');
    expect(ld).toContain('"@type":"Article"');
    await expect(page.locator('main a[href^="/usluge/"]').first()).toBeVisible();
  });
}

test('članak o estrihu navodi pravilo sušenja i CM metodu', async ({ page }) => {
  await page.goto('/savjeti/koliko-se-susi-estrih/');
  await expect(page.locator('main')).toContainText('tjedan dana po centimetru');
  await expect(page.locator('main')).toContainText('CM metod');
});
