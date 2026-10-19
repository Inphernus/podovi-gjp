import { describe, it, expect } from 'vitest';
import { businessSchema, serviceSchema, faqSchema, breadcrumbSchema, articleSchema } from '../../src/lib/schema';

describe('schema', () => {
  it('businessSchema je HomeAndConstructionBusiness za Hrvatsku', () => {
    const b = businessSchema() as any;
    expect(b['@context']).toBe('https://schema.org');
    expect(b['@type']).toBe('HomeAndConstructionBusiness');
    expect(b.areaServed.name).toBe('Hrvatska');
    expect(b['@id']).toMatch(/^https:\/\//);
  });

  it('serviceSchema pokazuje na istu firmu kao businessSchema', () => {
    const s = serviceSchema({ naslov: 'PVC podovi u roli', kratakOdgovor: 'Opis.', slug: 'pvc-podovi' }) as any;
    expect(s['@type']).toBe('Service');
    expect(s.provider['@id']).toBe((businessSchema() as any)['@id']);
    expect(s.url).toMatch(/\/usluge\/pvc-podovi\/$/);
  });

  it('faqSchema vraća mainEntity za svako pitanje', () => {
    const f = faqSchema([
      { pitanje: 'A?', odgovor: 'a' },
      { pitanje: 'B?', odgovor: 'b' },
    ]) as any;
    expect(f['@type']).toBe('FAQPage');
    expect(f.mainEntity).toHaveLength(2);
    expect(f.mainEntity[1].acceptedAnswer.text).toBe('b');
  });

  it('breadcrumbSchema ima pozicije od 1 i apsolutne URL-ove', () => {
    const b = breadcrumbSchema([
      { naziv: 'Naslovna', path: '/' },
      { naziv: 'Usluge', path: '/usluge/' },
    ]) as any;
    expect(b.itemListElement.map((i: any) => i.position)).toEqual([1, 2]);
    expect(b.itemListElement[1].item).toMatch(/^https:\/\/.+\/usluge\/$/);
  });

  it('articleSchema ima naslov, datum i URL savjeta', () => {
    const a = articleSchema({ naslov: 'Estrih', metaOpis: 'Opis', datum: new Date('2026-10-19'), slug: 'estrih' }) as any;
    expect(a['@type']).toBe('Article');
    expect(a.headline).toBe('Estrih');
    expect(a.datePublished).toBe('2026-10-19');
    expect(a.url).toMatch(/\/savjeti\/estrih\/$/);
  });
});
