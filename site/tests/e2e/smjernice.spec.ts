import { test, expect } from '@playwright/test';

// Nalazi pregleda po Vercel Web Interface Guidelines (12. task)
test('theme-color odgovara pozadini', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#EFEFEC');
});

test('dodir bez kašnjenja dvostrukog tapa', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.body).touchAction)).toBe('manipulation');
});

test('ladica izbornika ne propušta skrolanje na stranicu', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('[data-menu]').evaluate((el) => getComputedStyle(el).overscrollBehavior)).toBe('contain');
});

for (const r of ['/', '/zatrazi-ponudu/']) {
  test(`nijedna tranzicija ne animira all, width ni background-size: ${r}`, async ({ page }) => {
    await page.goto(r);
    await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
    const losi = await page.evaluate(() =>
      // [data-21st] = 21st.dev komponente prenesene doslovno (i njihov transition-all) na izričit zahtjev klijenta
      [...document.querySelectorAll('*')].filter((el) => !el.closest('[data-21st]')).flatMap((el) => {
        const t = getComputedStyle(el).transitionProperty;
        const d = getComputedStyle(el).transitionDuration;
        if (d.split(',').every((x) => parseFloat(x) === 0)) return [];
        return t.split(',').map((x) => x.trim()).filter((x) => ['all', 'width', 'background-size'].includes(x)).map((x) => `${el.tagName}.${el.className}: ${x}`);
      }),
    );
    expect(losi).toEqual([]);
  });
}

test('forma: e-mail bez provjere pravopisa i fokus na prvu grešku', async ({ page }) => {
  await page.goto('/zatrazi-ponudu/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await page.evaluate(() => {
    sessionStorage.setItem('gjp-radni-nalog', JSON.stringify({
      a: { objekt: 'hotel', obloga: 'epoksid', povrsina: '50-150', podloga: 'ne-znam', niveliranje: 'da', 'starost-estriha': 'ne-znam', 'podno-grijanje': 'ne', lokacija: 'Split', kat: 'prizemlje', dizalo: 'da', pocetak: 'odmah' },
      korak: 'kontakt',
    }));
  });
  await page.reload();
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  expect(await page.getByLabel('E-mail').evaluate((el) => (el as HTMLInputElement).spellcheck)).toBe(false);
  await page.getByLabel('Ime i prezime').fill('Ana');
  await page.getByRole('button', { name: 'Pošalji radni nalog' }).click();
  await expect(page.getByLabel('E-mail')).toBeFocused();
});

test('Lighthouse a11y: tabpanel nije article, galerija ima kontrast i ime = vidljivi tekst', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('article[role="tabpanel"]')).toHaveCount(0);
  await expect(page.locator('[role="tabpanel"]')).toHaveCount(7);

  const galerija = page.locator('[data-usluge-galerija]');
  await expect(galerija.locator('button[aria-label]')).toHaveCount(0);
  await expect(galerija.getByRole('button', { name: /^LVT vinil podovi/ })).toBeVisible();

  // neaktivni natpis: kontrast prema pozadini ≥ 4.5
  const omjer = await galerija.locator('button[aria-expanded="false"] .truncate').first().evaluate((el) => {
    const rgba = (s: string) => s.match(/[\d.]+/g)!.map(Number);
    const [r, g, b, a = 1] = rgba(getComputedStyle(el).color);
    let p = el.parentElement!;
    while (getComputedStyle(p).backgroundColor === 'rgba(0, 0, 0, 0)') p = p.parentElement!;
    const [br, bg, bb] = rgba(getComputedStyle(p).backgroundColor);
    const mix = [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a)];
    const L = (c: number[]) => {
      const [x, y, z] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * x + 0.7152 * y + 0.0722 * z;
    };
    const [l1, l2] = [L(mix), L([br, bg, bb])].sort((m, n) => n - m);
    return (l1 + 0.05) / (l2 + 0.05);
  });
  expect(omjer).toBeGreaterThanOrEqual(4.5);
});
