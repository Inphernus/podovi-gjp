import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

export const USLUGE = [
  'priprema-podloge', 'pvc-podovi', 'lvt-vinil', 'linoleum', 'gumeni-podovi', 'bolon-pleteni-vinil', 'tepih-ploce',
  'tepih-u-roli', 'tepih-na-gripere', 'laminat', 'dupli-podovi', 'epoksidni-podovi', 'zavrsni-radovi',
];

const fm = (slug: string) => matter(readFileSync(join(process.cwd(), 'src/content/usluge', `${slug}.md`), 'utf8')).data;

for (const slug of USLUGE) {
  test(`usluga ${slug}`, async ({ page, request }) => {
    const data = fm(slug);
    await page.goto(`/usluge/${slug}/`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(data.h1);
    await expect(page.locator('main p').first()).toHaveText(data.kratakOdgovor);
    await expect(page.getByRole('heading', { name: 'Prednosti' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nedostaci' })).toBeVisible();

    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('');
    expect(ld).toContain('"@type":"Service"');
    expect(ld).toContain('"@type":"BreadcrumbList"');

    for (const s of data.srodne as string[]) {
      const a = page.locator(`[data-srodne] a[href="/usluge/${s}/"]`);
      await expect(a).toHaveCount(1);
      expect((await request.get(`/usluge/${s}/`)).status()).toBe(200);
    }
  });
}

test('pregled usluga grupira svih 13 usluga', async ({ page }) => {
  await page.goto('/usluge/');
  for (const slug of USLUGE) await expect(page.locator(`main a[href="/usluge/${slug}/"]`).first()).toBeVisible();
});

test('CTA na LVT stranici unaprijed bira oblogu', async ({ page }) => {
  await page.goto('/usluge/lvt-vinil/');
  await expect(page.locator('[data-cta-ponuda]')).toHaveAttribute('href', '/zatrazi-ponudu/?obloga=lvt');
});
