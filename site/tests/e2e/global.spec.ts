import { test, expect } from '@playwright/test';

// Taskovi 3–11 dodaju svoje rute u ovaj niz
export const rute = ['/'];

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
