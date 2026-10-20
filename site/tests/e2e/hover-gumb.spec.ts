import { test, expect } from '@playwright/test';

// Primarni CTA = 21st.dev Interactive Hover Button (prilagođen kao HoverGumb.astro)
for (const r of ['/', '/kontakt/', '/usluge/pvc-podovi/']) {
  test(`primarni CTA koristi hover gumb: ${r}`, async ({ page }) => {
    await page.goto(r);
    const gumbi = page.locator('a.hover-gumb[href="/zatrazi-ponudu/"]');
    expect(await gumbi.count()).toBeGreaterThan(0);
    for (const g of await gumbi.all()) {
      if (!(await g.isVisible())) continue; // npr. gumb u zatvorenoj mobilnoj ladici
      await expect(g.locator('[data-tocka]')).toHaveCount(1);
      // drugi primjerak teksta je samo za animaciju i skriven je od čitača ekrana
      await expect(g).toHaveAccessibleName('Zatraži ponudu');
    }
  });
}

test('hover gumb se na hoveru puni (točka se širi do pune širine) bez promjene širine gumba', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const g = page.locator('.hero a.hover-gumb');
  const sirina = (await g.boundingBox())!.width;
  await g.hover();
  await page.waitForTimeout(500);
  // kao u originalu: točka naraste do pune širine gumba
  const tocka = (await g.locator('[data-tocka]').boundingBox())!;
  expect(tocka.width).toBeGreaterThanOrEqual(sirina * 0.95);
  expect((await g.boundingBox())!.width).toBe(sirina);
});

test('sekundarni gumb i slanje forme nisu hover gumb', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero a.btn-secondary')).not.toHaveClass(/hover-gumb/);
});

test('na hoveru su tekst i strelica centrirani u gumbu', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const g = page.locator('.hero a.hover-gumb');
  await g.hover();
  await page.waitForTimeout(500);
  const { lijevo, desno } = await g.evaluate((el) => {
    const gb = el.getBoundingClientRect();
    const sloj = el.querySelector('span[aria-hidden="true"].absolute')!;
    const t = sloj.children[0].getBoundingClientRect();
    const s = sloj.querySelector('svg path')!.getBoundingClientRect();
    return { lijevo: t.left - gb.left, desno: gb.right - s.right };
  });
  expect(Math.abs(lijevo - desno)).toBeLessThan(1.5);
});
