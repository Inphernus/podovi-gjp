import { describe, it, expect } from 'vitest';
import { site } from '../../src/lib/site';
import { businessSchema } from '../../src/lib/schema';

// OIB kontrolna znamenka: ISO 7064, MOD 11,10
const oibIspravan = (oib: string) => {
  if (!/^\d{11}$/.test(oib)) return false;
  let a = 10;
  for (let i = 0; i < 10; i++) {
    a = (a + Number(oib[i])) % 10;
    if (a === 0) a = 10;
    a = (a * 2) % 11;
  }
  const k = 11 - a === 10 ? 0 : 11 - a;
  return k === Number(oib[10]);
};

describe('podaci firme', () => {
  it('pravni naziv, adresa i OIB su upisani', () => {
    expect(site.pravniNaziv).toBe('PODOVI GJP d.o.o.');
    expect(site.adresa).toMatchObject({ ulica: 'Ulica Karela Zahradnika 21', postanskiBroj: '10000', grad: 'Zagreb', drzava: 'HR' });
    expect(site.oib).toBe('70545360117');
  });

  it('OIB ima ispravnu kontrolnu znamenku', () => {
    expect(oibIspravan(site.oib)).toBe(true);
  });

  it('schema firme sadrži pravni naziv i porezni broj', () => {
    const b = businessSchema() as any;
    expect(b.legalName).toBe('PODOVI GJP d.o.o.');
    expect(b.taxID).toBe('70545360117');
    expect(b.vatID).toBe('HR70545360117');
    expect(b.address.postalCode).toBe('10000');
  });
});
