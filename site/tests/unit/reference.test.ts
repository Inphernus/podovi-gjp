import { describe, it, expect } from 'vitest';
import { filtrirajReference, prikazniNaziv } from '../../src/lib/reference-filter';

const r = (id: string, data: Record<string, unknown>) => ({ id, data: { draft: false, istaknuto: false, javnoIme: false, ...data } }) as any;
const sve = [
  r('a', { tipObjekta: 'hotel', obloge: ['lvt-vinil'], naziv: 'Hotel A', grad: 'Split', godina: 2025 }),
  r('b', { tipObjekta: 'zdravstvo', obloge: ['pvc-podovi'], naziv: 'Bolnica B', grad: 'Zagreb', godina: 2024 }),
  r('c', { tipObjekta: 'hotel', obloge: ['tepih-u-roli', 'lvt-vinil'], naziv: 'Hotel C', grad: 'Zadar', godina: 2026, istaknuto: true }),
  r('d', { tipObjekta: 'hotel', obloge: ['lvt-vinil'], naziv: 'Skica', grad: 'Pula', godina: 2026, draft: true }),
];

describe('filtrirajReference', () => {
  it('filtrira po tipu objekta i izbacuje draft kad nije dopušten', () => {
    expect(filtrirajReference(sve, { tipObjekta: 'hotel' }, false).map((x) => x.id)).toEqual(['c', 'a']);
  });
  it('uključuje draft kad je dopušten', () => {
    expect(filtrirajReference(sve, { tipObjekta: 'hotel' }, true).map((x) => x.id)).toEqual(['c', 'd', 'a']);
  });
  it('filtrira po usluzi (obloga)', () => {
    expect(filtrirajReference(sve, { obloga: 'pvc-podovi' }, false).map((x) => x.id)).toEqual(['b']);
  });
  it('poštuje limit, istaknute prve, zatim novije', () => {
    expect(filtrirajReference(sve, { limit: 2 }, false).map((x) => x.id)).toEqual(['c', 'a']);
  });
});

describe('prikazniNaziv', () => {
  it('bez dopuštenja za javno ime prikazuje tip i grad', () => {
    expect(prikazniNaziv(sve[0].data)).toBe('Hoteli i ugostiteljstvo, Split');
  });
  it('s dopuštenjem prikazuje naziv', () => {
    expect(prikazniNaziv({ ...sve[0].data, javnoIme: true })).toBe('Hotel A');
  });
});
