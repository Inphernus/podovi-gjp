import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faq = z.array(z.object({ pitanje: z.string(), odgovor: z.string() }));

export const GRUPE = ['priprema', 'elasticne', 'tekstilne', 'laminat', 'tehnicki', 'epoksid', 'zavrsni'] as const;
export const TIPOVI_OBJEKTA = ['ured', 'zdravstvo', 'obrazovanje', 'hotel', 'sport', 'industrija', 'trgovina', 'stambeni'] as const;

const usluge = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/usluge' }),
  schema: ({ image }) =>
    z.object({
      naslov: z.string(),
      h1: z.string(),
      metaOpis: z.string().max(155),
      grupa: z.enum(GRUPE),
      redoslijed: z.number(),
      fokus: z.boolean().default(false),
      kljucneRijeci: z.array(z.string()).min(1),
      kratakOdgovor: z.string(),
      prednosti: z.array(z.string()).min(1),
      nedostaci: z.array(z.string()).min(1),
      faq,
      srodne: z.array(z.string()),
      slika: image().optional(),
    }),
});

const reference = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/reference' }),
  schema: ({ image }) =>
    z.object({
      naziv: z.string(),
      tipObjekta: z.enum(TIPOVI_OBJEKTA),
      obloge: z.array(z.string()).min(1),
      povrsinaM2: z.number().positive(),
      grad: z.string(),
      godina: z.number().int(),
      slike: z.array(image()).default([]),
      javnoIme: z.boolean().default(false),
      istaknuto: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const savjeti = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/savjeti' }),
  schema: z.object({
    naslov: z.string(),
    metaOpis: z.string().max(155),
    datum: z.coerce.date(),
    kratakOdgovor: z.string(),
    povezaneUsluge: z.array(z.string()).default([]),
    faq: faq.optional(),
  }),
});

export const collections = { usluge, reference, savjeti };
