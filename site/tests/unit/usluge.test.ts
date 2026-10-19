import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const dir = join(process.cwd(), 'src/content/usluge');
const datoteke = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')) : [];
const usluge = datoteke.map((f) => {
  const { data, content } = matter(readFileSync(join(dir, f), 'utf8'));
  return { slug: f.replace(/\.md$/, ''), data, content };
});

const normaliziraj = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

describe('usluge', () => {
  it('ima točno 13 usluga', () => {
    expect(usluge).toHaveLength(13);
  });

  it('fokus je točno: lvt-vinil, tepih-ploce, tepih-u-roli, pvc-podovi, epoksidni-podovi', () => {
    const fokus = usluge.filter((u) => u.data.fokus).map((u) => u.slug).sort();
    expect(fokus).toEqual(['epoksidni-podovi', 'lvt-vinil', 'pvc-podovi', 'tepih-ploce', 'tepih-u-roli']);
  });

  it('svaki h1 sadrži barem jednu svoju ključnu riječ ili njezin korijen', () => {
    for (const u of usluge) {
      const h1 = normaliziraj(u.data.h1);
      const korijeni = (u.data.kljucneRijeci as string[])
        .flatMap((k) => normaliziraj(k).split(/\s+/))
        .filter((r) => r.length >= 4)
        .map((r) => r.slice(0, 6));
      expect(korijeni.some((k) => h1.includes(k)), `${u.slug}: "${u.data.h1}"`).toBe(true);
    }
  });

  it('svaki slug u srodne postoji', () => {
    const slugovi = new Set(usluge.map((u) => u.slug));
    for (const u of usluge) {
      for (const s of u.data.srodne as string[]) expect(slugovi.has(s), `${u.slug} → ${s}`).toBe(true);
    }
  });

  it('kratakOdgovor ima 2–3 rečenice', () => {
    for (const u of usluge) {
      const recenice = (u.data.kratakOdgovor as string).split(/[.!?](?:\s|$)/).filter((s) => s.trim());
      expect(recenice.length, u.slug).toBeGreaterThanOrEqual(2);
      expect(recenice.length, u.slug).toBeLessThanOrEqual(3);
    }
  });

  it('tekstovi nemaju ćiriličnih znakova', () => {
    for (const u of usluge) {
      expect(JSON.stringify(u.data) + u.content, u.slug).not.toMatch(/[Ѐ-ӿ]/);
    }
  });

  it('nijedan tekst ne sadrži riječ "epoxy"', () => {
    for (const u of usluge) {
      expect(JSON.stringify(u.data) + u.content, u.slug).not.toMatch(/epoxy/i);
    }
  });
});
