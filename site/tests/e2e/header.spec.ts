import { test, expect } from '@playwright/test';

// Header = 21st.dev Centered Nav Header, prenesen identično (vidi komponente-21st/centered-nav-header.tsx)
test.describe('desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('logo lijevo, 5 poveznica u sredini, telefon | CTA desno', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header[data-21st]');
    await expect(header).toHaveCSS('height', '64px');
    const nav = header.getByRole('navigation', { name: 'Glavna navigacija' });
    await expect(nav.getByRole('link')).toHaveCount(5);
    // navigacija je centrirana u headeru
    const h = (await header.boundingBox())!;
    const n = (await nav.boundingBox())!;
    expect(Math.abs(n.x + n.width / 2 - (h.x + h.width / 2))).toBeLessThan(2);
    await expect(header.locator('a.header-tel[href^="tel:"]')).toBeVisible();
    await expect(header.locator('[data-separator]')).toBeVisible();
    const cta = header.locator('a.header-cta[href="/zatrazi-ponudu/"]');
    await expect(cta).toBeVisible();
    await expect(cta.locator('svg')).toHaveCount(1);
    await expect(header.getByRole('button', { name: 'Otvori izbornik' })).toBeHidden();
  });

  test('poveznica trenutne stranice je istaknuta', async ({ page }) => {
    await page.goto('/usluge/');
    await expect(page.locator('header[data-21st] nav a[aria-current="page"]')).toHaveText('Usluge');
  });
});

test('mobilno: telefon i CTA skriveni, izbornik vidljiv', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const header = page.locator('header[data-21st]');
  await expect(header.locator('a.header-cta')).toBeHidden();
  await expect(header.getByRole('button', { name: 'Otvori izbornik' })).toBeVisible();
});
