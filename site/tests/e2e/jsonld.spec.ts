import { test, expect } from '@playwright/test';
import { rute } from './rute';

// Obavezna polja po tipu (Google rich results / schema.org)
const OBAVEZNO: Record<string, string[]> = {
  HomeAndConstructionBusiness: ['@id', 'name', 'url', 'address', 'areaServed'],
  WebSite: ['name', 'url'],
  Service: ['name', 'description', 'url', 'provider'],
  FAQPage: ['mainEntity'],
  BreadcrumbList: ['itemListElement'],
  Article: ['headline', 'datePublished', 'url', 'author'],
};

for (const r of rute) {
  test(`JSON-LD ${r}`, async ({ page }) => {
    await page.goto(r);
    const blokovi = await page.locator('script[type="application/ld+json"]').allTextContents();
    const tipovi: string[] = [];
    for (const b of blokovi) {
      const d = JSON.parse(b);
      expect(d['@context'], r).toBe('https://schema.org');
      tipovi.push(d['@type']);
      for (const p of OBAVEZNO[d['@type']] ?? []) expect(d[p], `${r} ${d['@type']}.${p}`).toBeTruthy();
      for (const u of JSON.stringify(d).match(/"(?:url|item|@id|logo)":"([^"]+)"/g) ?? []) {
        expect(u, r).toMatch(/"https:\/\/podovi-gjp\.hr\//);
      }
      if (d['@type'] === 'FAQPage') {
        for (const q of d.mainEntity) {
          expect(q['@type']).toBe('Question');
          expect(q.name.length).toBeGreaterThan(5);
          expect(q.acceptedAnswer.text.length).toBeGreaterThan(20);
        }
      }
      if (d['@type'] === 'BreadcrumbList') {
        const zadnji = d.itemListElement.at(-1).item;
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        expect(zadnji, r).toBe(canonical);
      }
    }
    // najviše jedan blok istog tipa po stranici
    expect(new Set(tipovi).size, `${r}: ${tipovi.join(', ')}`).toBe(tipovi.length);
  });
}
