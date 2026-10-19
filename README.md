# Podovi GJP — web

Statički web za Podovi GJP (podopolagački radovi). Specifikacija: `docs/specs/2026-10-19-podovi-gjp-web-design.md`, plan: `docs/plans/2026-10-19-podovi-gjp-web.md`.

## Naredbe (u mapi `site/`)

| Naredba | Što radi |
|---|---|
| `npm run dev` | lokalni razvoj (Claude Code: `gjp-site` u `.claude/launch.json`, port 4323) |
| `npm run build` | produkcijski build u `dist/` (bez draft referenci) |
| `npm test` | unit testovi (Vitest) |
| `npm run e2e` | e2e testovi (Playwright, sam builda s `PUBLIC_DRAFTOVI=1` i pokreće preview na 4322) |
| `npm run check` | provjera tipova (`astro check`) |
| `node scripts/subset-font.mjs` | ponovno izrađuje subset fonta Archivo u `public/fonts/` |

## Struktura

- `src/content/usluge|savjeti|reference/*.md` — sadržaj; nova usluga ili članak = nova `.md` datoteka (shema u `src/content.config.ts`)
- `src/lib/` — podaci firme (`site.ts`), JSON-LD (`schema.ts`), presjek poda (`presjek.ts`), logika forme (`nalog.ts`), tipovi objekta i obloge
- `src/components/astro/` — statične sekcije; `src/components/react/` i `src/components/ui/` — interaktivni dijelovi (Preact u compat načinu)
- `komponente-21st/` — izvornici preuzetih 21st.dev komponenti (prilagođene verzije su u `site/src/components/ui/`)
- `prototip/` — prvi prototip naslovne (samo za usporedbu)

## Reference

Draft reference (`draft: true`) vide se samo uz `PUBLIC_DRAFTOVI=1` (testovi, lokalno). Produkcijski build ih nikad ne prikazuje. Stvarni projekt: nova datoteka u `src/content/reference/` bez `draft`, slike u `src/assets/reference/` i polje `slike`.

## Podaci koji čekaju klijenta (`TODO-kum`)

- `site/src/lib/site.ts` — pravni naziv, telefon, e-mail, ulica, poštanski broj
- `site/src/pages/impressum.astro` — OIB i registarski podaci
- `site/src/pages/o-nama.astro` — od kada rade, ekipa, certifikati
- `site/src/pages/politika-privatnosti.astro` — predložak, klijent mora odobriti
- fotografije radova (hero, galerija usluga, reference)
- domena (`site` u `astro.config.mjs`, `robots.txt`, `site.ts`)
- korak 7 forme (lokacija, kat, dizalo, početak radova) — potvrditi

## Objava (Netlify)

1. Repo na GitHub, u Netlifyju „Import from Git”, base directory `site` (build i publish su u `site/netlify.toml`).
2. Forms → uključiti detekciju formi; Notifications → e-mail obavijest za formu `radni-nalog` na kumov e-mail.
3. Domena → usmjeriti DNS na Netlify; HTTPS se uključuje automatski.

## Lighthouse (mobitel, produkcijski build, 19. 10. 2026.)

| Stranica | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| `/` | 99 | 100 | 100 | 100 | 1,8 s | 0 |
| `/usluge/pvc-podovi/` | 100 | 100 | 100 | 100 | 1,4 s | 0 |
| `/zatrazi-ponudu/` | 100 | 100 | 100 | 100 | 1,7 s | 0 |

JS gzip: naslovna 12 KB, forma 16 KB. Font 62 KB (dva subseta Archiva).

Napomena: Astro 7 dopušta samo jedan `astro preview` odjednom — prije `npm run e2e` ugasiti preview `gjp-preview` (port 4324).
