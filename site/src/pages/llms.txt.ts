import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../lib/site';

// Sažetak za AI pretraživače (specifikacija §9); generira se iz kolekcije usluga.
export const GET: APIRoute = async () => {
  const usluge = (await getCollection('usluge')).sort((a, b) => a.data.redoslijed - b.data.redoslijed);
  const abs = (p: string) => new URL(p, site.url).href;
  const tekst = [
    `# ${site.naziv}`,
    '',
    `> ${site.naziv} izvodi podopolagačke radove za poslovne, javne i privatne prostore diljem Hrvatske, s fokusom na LVT podne obloge, tepihe, PVC podove u roli i epoksidne sustave, uključujući pripremu podloge i završne radove.`,
    '',
    `Područje rada: ${site.podrucje}`,
    '',
    '## Usluge',
    '',
    ...usluge.map((u) => `- [${u.data.naslov}](${abs(`/usluge/${u.id}/`)}): ${u.data.metaOpis}`),
    '',
    '## Kontakt',
    '',
    `- Zatražite ponudu: ${abs('/zatrazi-ponudu/')}`,
    `- Telefon: ${site.telefon}`,
    `- E-mail: ${site.email}`,
    '',
  ].join('\n');
  return new Response(tekst, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
