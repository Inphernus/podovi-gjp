// JS budžet (gzip) po stranici iz dist/: naslovna ≤ 30 KB, forma ≤ 60 KB.
// Zbraja <script src>, islande (component-url, renderer-url) i sve njihove statičke importe.
// Pokretanje nakon builda: node scripts/js-budzet.mjs
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname, resolve } from 'node:path';

const dist = resolve('dist');
const budzeti = { '/': 30, '/zatrazi-ponudu/': 60 };
const stranice = ['/', '/usluge/', '/zatrazi-ponudu/', '/reference/', '/kontakt/'];

const datoteka = (url) => join(dist, url.replace(/^\//, ''));

function skupi(url, vidjeno) {
  if (vidjeno.has(url)) return;
  const put = datoteka(url);
  if (!existsSync(put)) return;
  vidjeno.add(url);
  const kod = readFileSync(put, 'utf8');
  for (const [, uvoz] of kod.matchAll(/(?:import|from)\s*["']([^"']+\.js)["']/g)) {
    const apsolutno = uvoz.startsWith('/') ? uvoz : '/' + join(dirname(url.slice(1)), uvoz).replace(/\\/g, '/');
    skupi(apsolutno, vidjeno);
  }
}

let pao = false;
for (const s of stranice) {
  const html = readFileSync(join(dist, s, 'index.html'), 'utf8');
  const vidjeno = new Set();
  const ulazi = [
    ...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g),
    ...html.matchAll(/(?:component|renderer)-url="([^"]+)"/g),
  ].map((m) => m[1]);
  ulazi.forEach((u) => skupi(u, vidjeno));
  // inline skripte (Astro ih ugradi kad su male)
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('');
  for (const [, uvoz] of inline.matchAll(/(?:import|from)\s*["'](\/[^"']+\.js)["']/g)) skupi(uvoz, vidjeno);
  const bajtovi = [...vidjeno].reduce((z, u) => z + gzipSync(readFileSync(datoteka(u))).length, 0) + gzipSync(inline).length;
  const kb = bajtovi / 1024;
  const limit = budzeti[s];
  const ok = limit === undefined || kb <= limit;
  if (!ok) pao = true;
  console.log(`${ok ? '✓' : '✗'} ${s.padEnd(18)} ${kb.toFixed(1)} KB gzip${limit ? ` (limit ${limit})` : ''}  [${vidjeno.size} datoteka]`);
}
process.exit(pao ? 1 : 0);
