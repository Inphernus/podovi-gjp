import { test, expect } from '@playwright/test';

test.describe('bez JavaScripta', () => {
  test.use({ javaScriptEnabled: false });
  test('vidljiva je obična forma za Netlify', async ({ page }) => {
    await page.goto('/zatrazi-ponudu/');
    const forma = page.locator('form[name="radni-nalog"]');
    await expect(forma).toBeVisible();
    await expect(forma).toHaveAttribute('data-netlify', 'true');
    for (const n of ['ime', 'email', 'telefon', 'objekt', 'prilog', 'privola']) {
      await expect(forma.locator(`[name="${n}"]`).first()).toBeAttached();
    }
    await expect(forma.locator('[name="bot-field"]')).toBeHidden();
  });
});

test('zahvalna stranica', async ({ page }) => {
  await page.goto('/hvala/?objekt=hotel');
  await expect(page.locator('main')).toContainText('ponudu u roku 48 sati');
  await expect(page.locator('[data-hvala-proces] li')).toHaveCount(4);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('[data-hvala-reference] [data-referenca]:visible')).not.toHaveCount(0);
});
