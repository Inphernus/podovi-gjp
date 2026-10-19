// Čista logika referenci (bez astro:content), da je Vitest može testirati.
import { OBJEKTI } from './objekti';

export type ReferencaData = {
  naziv: string;
  tipObjekta: string;
  obloge: string[];
  grad: string;
  godina: number;
  javnoIme: boolean;
  istaknuto: boolean;
  draft: boolean;
};

export type ReferencaFilter = { tipObjekta?: string; obloga?: string; limit?: number };

/** Istaknute prve, zatim novije; draft samo kad je dopušten. */
export function filtrirajReference<T extends { data: ReferencaData }>(sve: T[], filter: ReferencaFilter, dopustiDraft: boolean): T[] {
  const out = sve
    .filter((r) => dopustiDraft || !r.data.draft)
    .filter((r) => !filter.tipObjekta || r.data.tipObjekta === filter.tipObjekta)
    .filter((r) => !filter.obloga || r.data.obloge.includes(filter.obloga))
    .sort((a, b) => Number(b.data.istaknuto) - Number(a.data.istaknuto) || b.data.godina - a.data.godina);
  return filter.limit ? out.slice(0, filter.limit) : out;
}

/** Bez dopuštenja investitora prikazuje se opisno: „Hoteli i ugostiteljstvo, Split”. */
export function prikazniNaziv(d: Pick<ReferencaData, 'naziv' | 'javnoIme' | 'tipObjekta' | 'grad'>): string {
  if (d.javnoIme) return d.naziv;
  const tip = OBJEKTI.find((o) => o.value === d.tipObjekta)?.kratko ?? d.tipObjekta;
  return `${tip}, ${d.grad}`;
}
