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
      [...document.querySelectorAll('*')].flatMap((el) => {
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
  expect(await page.getByLabel('E-mail').evaluate((el) => (el as HTMLInputElement).spellcheck)).toBe(false);
  await page.getByLabel('Ime i prezime').fill('Ana');
  await page.getByRole('button', { name: 'Pošalji radni nalog' }).click();
  await expect(page.getByLabel('E-mail')).toBeFocused();
});
