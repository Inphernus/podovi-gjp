// Sprječava produkcijsku objavu s privremenim podacima (TODO-kum) umjesto stvarnih podataka klijenta.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @param {{ path: string, text: string }[]} datoteke @returns {string[]} putevi datoteka s placeholderom */
export function nadjiPlaceholdere(datoteke) {
  return datoteke.filter((d) => d.text.includes('TODO-kum')).map((d) => d.path);
}

async function procitajSve(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await procitajSve(p)));
    else if (/\.(html|txt|xml)$/.test(e.name)) out.push({ path: p, text: await readFile(p, 'utf8') });
  }
  return out;
}

/** Astro integracija: na Netlify produkcijskom deployu (CONTEXT=production) build pada ako ostane TODO-kum. */
export function zabraniPlaceholdere() {
  return {
    name: 'zabrani-placeholdere',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        if (process.env.CONTEXT !== 'production') return;
        const root = fileURLToPath(dir);
        const nadjeno = nadjiPlaceholdere(await procitajSve(root));
        if (nadjeno.length) {
          throw new Error(`Produkcijski build sadrži TODO-kum u: ${nadjeno.map((p) => relative(root, p)).join(', ')}. Upišite podatke klijenta u src/lib/site.ts i ostale TODO-kum stranice.`);
        }
      },
    },
  };
}
