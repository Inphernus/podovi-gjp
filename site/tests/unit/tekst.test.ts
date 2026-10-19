import { it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function datoteke(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? datoteke(p) : /\.(astro|ts|tsx|md|css)$/.test(f) ? [p] : [];
  });
}

it('nijedna izvorna datoteka nema ćiriličnih znakova', () => {
  const s = datoteke(join(process.cwd(), 'src')).filter((p) => /[Ѐ-ӿ]/.test(readFileSync(p, 'utf8')));
  expect(s).toEqual([]);
});
