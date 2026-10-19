import { it, expect } from 'vitest';
import { nadjiPlaceholdere } from '../../scripts/placeholderi.mjs';

it('pronalazi datoteke s TODO-kum', () => {
  expect(
    nadjiPlaceholdere([
      { path: 'index.html', text: '<a href="tel:TODO-kum">TODO-kum</a>' },
      { path: 'usluge/index.html', text: 'sve u redu' },
      { path: 'llms.txt', text: 'Telefon: TODO-kum' },
    ]),
  ).toEqual(['index.html', 'llms.txt']);
});

it('prazan popis kad nema placeholdera', () => {
  expect(nadjiPlaceholdere([{ path: 'a.html', text: 'Podovi GJP' }])).toEqual([]);
});
