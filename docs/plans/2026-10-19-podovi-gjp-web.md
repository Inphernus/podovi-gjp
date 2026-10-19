# Podovi GJP web — plan izrade

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Statički web Podovi GJP (v1 iz specifikacije): naslovna s presjekom poda, 13 stranica usluga, reference, savjeti, forma „radni nalog” s Netlify Forms, pravne stranice, SEO/GEO.

**Architecture:** Astro 5 generira statični HTML iz Markdown kolekcija (usluge, reference, savjeti). Interaktivni dijelovi su React islands (forma, galerija usluga, mobilni izbornik); presjek poda je SVG generiran pri buildu uz mali inline skriptu. Logika forme živi u čistom TypeScript modulu (`lib/nalog.ts`) koji je pokriven unit testovima; UI je tanki sloj iznad nje.

**Tech Stack:** Astro 5, React 19, Tailwind CSS 4 (`@tailwindcss/vite`), Motion, Vitest, Playwright, Netlify (+ Netlify Forms), Archivo (self-hosted varijabilni woff2).

**Spec:** `podovi-gjp/docs/specs/2026-10-19-podovi-gjp-web-design.md`

## Global Constraints

- Svi putovi u planu su relativni na `podovi-gjp/site/` osim ako je drukčije navedeno.
- `lang="hr"`; sav tekst na hrvatskom; „epoksidni sustavi”, nikad „epoxy”.
- Tokeni: `--crna #000000`, `--wenge #2B2420`, `--hrast #A8743F`, `--hrast-svijetli #C99A66`, `--estrih #D6D2CB`, `--gips #EFEFEC`, `--nivelir #7D7972`. Nijedna druga boja osim materijalnih boja u SVG presjeku.
- Font: samo Archivo (naslovi `wdth 62–70`, `wght 800–900`; tekst `wdth 100`, 17–18 px, prored 1.6).
- Bez: VELIKIH SLOVA iznad naslova, strelica „→” u tekstu gumba, monospace fonta, fade-in animacija sekcija, mreža jednakih kartica.
- Animacije samo iz §6.5 specifikacije; sve poštuju `prefers-reduced-motion`.
- Budžet: JS naslovne ≤ 30 KB gzip, JS forme ≤ 60 KB gzip, CSS ≤ 25 KB, font ≤ 60 KB, LCP ≤ 2,0 s, CLS < 0.1.
- WCAG 2.2 AA; ciljevi dodira ≥ 44 px; bez horizontalnog skrolanja do 320 px.
- Forma: bez OIB-a; prilog ≤ 8 MB; Netlify ime forme `radni-nalog`.
- Komponente s 21st.dev se prilagođavaju tokenima i Archivu; izvornici su u `podovi-gjp/komponente-21st/`. Raspored preuzimanja: 20. 10. Wizard Steps + File Dropzone, 21. 10. oba Interactive Hover Buttona, 22. 10. Link Hover + Centered Nav Header.
- Skillovi iz `CLAUDE.md` (frontend-design, ui-ux-pro-max, react-best-practices, web-design-guidelines) obavezni su pri radu na UI-u.

## Review Focus

1. **Neispravan query parametar** (`/zatrazi-ponudu/?objekt=xyz` ili `?obloga=<script>`) → ignorira se, forma kreće od koraka 1 bez greške. Test u Task 9.
2. **Prevelik ili krivi prilog** (12 MB PDF, `.exe`) → poruka uz polje, ostali odgovori ostaju. Test u Task 9.
3. **Osvježavanje usred forme i nedostupan `sessionStorage`** (privatni način, iznimka pri pristupu) → odgovori se vraćaju kad je storage dostupan; kad nije, forma i dalje radi. Test u Task 9.
4. **Bez JavaScripta** → forma se prikazuje kao obična duga forma koja se šalje Netlifyju; presjek poda prikazuje sve slojeve i opise. Testovi u Task 4 i Task 10.
5. **Uski ekran od 320 px i duge riječi** („Podopolagački”, „Samorazlijevajuća”) → nema horizontalnog skrolanja, naslovi se lome (`hyphens: auto`, `overflow-wrap: anywhere` na H1/H2). Test u Task 1 (globalni e2e, sve rute).

---

## Datotečna struktura

```
podovi-gjp/site/
  astro.config.mjs, netlify.toml, package.json, tsconfig.json, vitest.config.ts, playwright.config.ts
  public/ robots.txt, llms.txt, favicon.svg, fonts/archivo-var.woff2, og-default.jpg
  src/
    styles/tokens.css            // CSS varijable + Tailwind @theme mapiranje + tipografija
    layouts/BaseLayout.astro     // <head> (Seo), Header, Footer, slot
    lib/
      site.ts                    // podaci firme (jedan izvor istine za NAP)
      schema.ts                  // JSON-LD generatori
      presjek.ts                 // podaci slojeva + renderPresjekSvg()
      nalog.ts                   // koraci, validacija, FormData, sažetak
    content.config.ts
    content/usluge/*.md (13), reference/*.md, savjeti/*.md (5)
    components/astro/            // Seo, Header, Footer, Breadcrumbs, Faq, Hero, ObjektiStrip, Presjek, Proces, CtaTraka, ReferencaKartica, NalogFallback
    components/react/            // UslugeGallery.tsx, RadniNalog.tsx, MobileNav.tsx
    components/ui/               // prilagođene 21st.dev: hover-expand-gallery.tsx, choicebox.tsx, wizard-steps.tsx, file-dropzone.tsx, hover-button.tsx, state-button.tsx, link-hover.tsx
    pages/ index.astro, usluge/index.astro, usluge/[slug].astro, reference.astro, savjeti/index.astro, savjeti/[slug].astro,
           zatrazi-ponudu.astro, hvala.astro, o-nama.astro, kontakt.astro, politika-privatnosti.astro, impressum.astro, 404.astro
  tests/unit/*.test.ts           // Vitest
  tests/e2e/*.spec.ts            // Playwright (protiv `astro preview`)
```

---

### Task 1: Kostur projekta, tokeni i osnovni layout

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `netlify.toml`, `src/styles/tokens.css`, `src/lib/site.ts`, `src/layouts/BaseLayout.astro`, `src/pages/index.astro` (privremeno samo H1), `public/fonts/archivo-var.woff2`, `tests/e2e/global.spec.ts`
- Also: `git init` u `podovi-gjp/` + `.gitignore` (node_modules, dist, .astro, .netlify, test-results)

**Interfaces:**
- Produces: `BaseLayout` props `{ title: string; description: string; canonicalPath: string; noindex?: boolean; jsonLd?: object[] }`; `site` iz `src/lib/site.ts`: `{ naziv: 'Podovi GJP', pravniNaziv: string, url: string, telefon: string, email: string, adresa: {ulica, grad, postanskiBroj, drzava: 'HR'}, podrucje: 'Hrvatska' }` (nepoznate vrijednosti kao `'TODO-kum'`, popisane u README).
- Tailwind `@theme` boje: `background, foreground, border, primary, muted, muted-foreground, ring` mapirane prema specifikaciji §6.2; klasa `.dark-section` prebacuje ih na wenge varijantu.

- [ ] **Step 1:** `npm create astro@latest site -- --template minimal --typescript strict --no-git --install` u `podovi-gjp/`, zatim `npx astro add react sitemap --yes`, `npm i tailwindcss @tailwindcss/vite motion`, `npm i -D vitest @playwright/test && npx playwright install chromium`.
- [ ] **Step 2:** Font: preuzeti Archivo varijabilni (wdth+wght) s Google Fonts repozitorija, subsetati na Latin + Latin Extended-A (`pyftsubset` ili `glyphhanger`), spremiti `public/fonts/archivo-var.woff2`, `@font-face` s `font-display: swap` i `<link rel="preload">` u layoutu.
- [ ] **Step 3: Napisati failing e2e test** `tests/e2e/global.spec.ts`:

```ts
const rute = ['/']; // Taskovi 3–11 dodaju svoje rute u ovaj niz
for (const r of rute) {
  test(`osnove ${r}`, async ({ page }) => {
    await page.goto(r);
    await expect(page.locator('html')).toHaveAttribute('lang', 'hr');
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.title()).toMatch(/Podovi GJP$/);
  });
  test(`bez horizontalnog skrolanja na 320px ${r}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(r);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw).toBeLessThanOrEqual(320);
  });
}
```
- [ ] **Step 4:** `npx playwright test tests/e2e/global.spec.ts` → FAIL (nema layouta / naslov ne završava s „Podovi GJP”).
- [ ] **Step 5:** Implementirati `tokens.css`, `BaseLayout.astro` (title format `${title} | Podovi GJP`, osim naslovne: `Podovi GJP | Stručnjaci za podne obloge`), `index.astro` s H1. `playwright.config.ts` pokreće `npm run build && npm run preview` kao webServer na portu 4321.
- [ ] **Step 6:** Ponoviti test → PASS. `npx astro check` → 0 errors.
- [ ] **Step 7: Commit** `feat: kostur Astro projekta, tokeni i layout`

---

### Task 2: Sadržajne kolekcije i 13 usluga

**Files:**
- Create: `src/content.config.ts`, `src/content/usluge/{priprema-podloge,pvc-podovi,lvt-vinil,linoleum,gumeni-podovi,bolon-pleteni-vinil,tepih-ploce,tepih-u-roli,tepih-na-gripere,laminat,dupli-podovi,epoksidni-podovi,zavrsni-radovi}.md`, `tests/unit/usluge.test.ts`

**Interfaces:**
- Produces: kolekcija `usluge` sa shemom iz specifikacije §4 (`naslov, h1, metaOpis (max 155), grupa (enum 7 vrijednosti), fokus, kljucneRijeci, kratakOdgovor, prednosti, nedostaci, faq[{pitanje, odgovor}], srodne (slug[]), slika (optional image)`); kolekcije `reference` i `savjeti` sa shemama iz §4 (sadržaj im dodaju Taskovi 7 i 8).

- [ ] **Step 1: Failing test** `tests/unit/usluge.test.ts` (čita frontmatter preko `gray-matter` iz `src/content/usluge`):
  - `ima točno 13 usluga`
  - `fokus je točno: lvt-vinil, tepih-ploce, tepih-u-roli, pvc-podovi, epoksidni-podovi`
  - `svaki h1 sadrži barem jednu svoju ključnu riječ ili njezin korijen` (usporedba bez dijakritike, lowercase, prvih 6 znakova riječi)
  - `svaki slug u srodne postoji`
  - `kratakOdgovor ima 2–3 rečenice` (broj `. ` + završna točka)
  - `nijedan tekst ne sadrži riječ "epoxy"`
- [ ] **Step 2:** `npx vitest run tests/unit/usluge.test.ts` → FAIL.
- [ ] **Step 3:** Napisati 13 `.md` datoteka. Izvor teksta: PDF katalog radova (opis, prednosti, nedostaci doslovno prilagođeni), ključne riječi iz tablice §5 specifikacije, FAQ 3–5 pitanja po usluzi (odgovori konkretni, s brojkama iz PDF-a gdje postoje). Cijene se ne navode kao cjenik; za epoksid se smije napisati da cijenu određuju priprema i sustav.
- [ ] **Step 4:** Test → PASS; `npx astro check` → 0 errors.
- [ ] **Step 5: Commit** `feat: kolekcije sadržaja i 13 usluga`

---

### Task 3: SEO sloj (JSON-LD, Seo head, robots, llms.txt, sitemap)

**Files:**
- Create: `src/lib/schema.ts`, `src/components/astro/Seo.astro`, `public/robots.txt`, `public/llms.txt`, `tests/unit/schema.test.ts`
- Modify: `src/layouts/BaseLayout.astro` (koristi `Seo`), `astro.config.mjs` (`site` URL)

**Interfaces:**
- Produces (`src/lib/schema.ts`):
  - `businessSchema(): object` — `@type: 'HomeAndConstructionBusiness'`, podaci iz `site`, `areaServed: {'@type':'Country', name:'Hrvatska'}`, `knowsAbout: string[]` (naslovi usluga)
  - `serviceSchema(u: { naslov: string; kratakOdgovor: string; slug: string }): object` — `@type: 'Service'`, `provider` = referenca na business `@id`
  - `faqSchema(faq: {pitanje: string; odgovor: string}[]): object`
  - `breadcrumbSchema(items: {naziv: string; path: string}[]): object`
  - `articleSchema(a: { naslov: string; metaOpis: string; datum: Date; slug: string }): object`
- `Seo.astro` props = `BaseLayout` props; ispisuje title, description, canonical, OG (`og:locale hr_HR`), Twitter card, `robots noindex` kad treba, sve `jsonLd` kao `<script type="application/ld+json">`.

- [ ] **Step 1: Failing test** `tests/unit/schema.test.ts`: `businessSchema` ima `@context https://schema.org`, `@type HomeAndConstructionBusiness`, `areaServed.name === 'Hrvatska'`; `serviceSchema` ima `provider['@id']` jednak `businessSchema()['@id']`; `faqSchema` vraća `mainEntity` duljine ulaza s `acceptedAnswer.text`; `breadcrumbSchema` pozicije počinju od 1 i URL-ovi su apsolutni.
- [ ] **Step 2:** `npx vitest run tests/unit/schema.test.ts` → FAIL.
- [ ] **Step 3:** Implementirati `schema.ts` i `Seo.astro`. `robots.txt`: `User-agent: *` / `Allow: /`, eksplicitni `Allow: /` blokovi za `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Sitemap: <site>/sitemap-index.xml`. `llms.txt`: naziv, jedna rečenica tko su, područje, popis 13 usluga s apsolutnim URL-ovima, kontakt.
- [ ] **Step 4:** Test → PASS; build → `dist/sitemap-index.xml` postoji.
- [ ] **Step 5: Commit** `feat: SEO i GEO sloj`

---

### Task 4: Naslovna — header, hero, objekti, presjek poda

**Files:**
- Create: `src/lib/presjek.ts`, `src/components/astro/{Header,Footer,Hero,ObjektiStrip,Presjek}.astro`, `src/components/react/MobileNav.tsx`, `tests/unit/presjek.test.ts`, `tests/e2e/naslovna.spec.ts`
- Modify: `src/pages/index.astro`
- Izvor: `podovi-gjp/prototip/index.html` (hero, riblja kost, presjek)

**Interfaces:**
- Produces (`src/lib/presjek.ts`):
  - `type Sloj = { id: 'lvt'|'ljepilo'|'nivelir'|'estrih'|'grijanje'|'xps'|'beton'; naziv: string; dubina: string; velikiBroj: string; h: number; strane: [string, string]; naslov: string; tekst: string; link: { tekst: string; href: string } | null }`
  - `const SLOJEVI: Sloj[]` — 7 slojeva, vrijednosti i tekstovi doslovno iz prototipa; linkovi na `/usluge/...` i `/savjeti/koji-pod-za-podno-grijanje/`
  - `renderPresjekSvg(slojevi: Sloj[]): string` — isti izometrijski crtež kao prototip (matrica, uzorci, riblja kost s rešetkom t1=(w,w), t2=(L,−L)), deterministički (fiksni seed), bez `Math.random`
  - `ribljaKostSvg(opts: { width: number; height: number; w: number; L: number }): string` — za hero placeholder
- `ObjektiStrip` linkovi: `/zatrazi-ponudu/?objekt=<vrijednost>` s vrijednostima iz §8.2 koraka 1.

- [ ] **Step 1: Failing unit test** `tests/unit/presjek.test.ts`: `SLOJEVI.length === 7`; redoslijed id-ova `lvt, ljepilo, nivelir, estrih, grijanje, xps, beton`; `renderPresjekSvg(SLOJEVI)` sadrži 7 elemenata `class="layer"` i `data-id` svakog sloja; dva poziva vraćaju identičan string.
- [ ] **Step 2: Failing e2e** `tests/e2e/naslovna.spec.ts`:
  - H1 je „Stručnjaci za podne obloge”; uvodni odlomak sadrži „epoksidne sustave”
  - klik na gumb sloja „Nivelir masa” → vidljiv članak s naslovom „Samorazlijevajuća masa za izravnavanje” i linkom `/usluge/priprema-podloge/`; ostali članci skriveni; `aria-pressed="true"` samo na tom gumbu
  - tipkovnica: Tab do gumba sloja, Enter aktivira
  - **bez JS-a** (`javaScriptEnabled: false`): svih 7 naslova slojeva prisutno u DOM-u i vidljivo
  - `emulateMedia({ reducedMotion: 'reduce' })`: `.stack` ima izračunati `--gap` 46px
  - mobilni izbornik (375 px): gumb izbornika otvara ladicu s 5 linkova, Escape je zatvara i vraća fokus na gumb
- [ ] **Step 3:** Pokrenuti oba testa → FAIL.
- [ ] **Step 4:** Implementirati. SVG se renderira pri buildu (`set:html`), interakcija je inline `<script>` (bez Reacta). Bez JS-a svi članci su vidljivi; skripta dodaje `hidden` ostalima. Logo: vektorizirati `podovi-gjp/prototip/logo.jpg` u `public/logo.svg` (trace + ručna korekcija) i koristiti inline. Header je zasad vlastiti; zamjena 21st.dev komponentama je Task 11.
- [ ] **Step 5:** Testovi → PASS. Dodati `/` je već u `rute` iz Taska 1.
- [ ] **Step 6:** Vizualna provjera u pregledniku (1440 / 768 / 375) i screenshot u commit opisu.
- [ ] **Step 7: Commit** `feat: naslovna — hero, objekti, presjek poda`

---

### Task 5: Galerija usluga i ostatak naslovne

**Files:**
- Create: `src/components/ui/hover-expand-gallery.tsx` (prilagodba izvornika), `src/components/react/UslugeGallery.tsx`, `src/components/astro/{Proces,CtaTraka}.astro`, `src/components/astro/Faq.astro`, `tests/e2e/usluge-gallery.spec.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: kolekcija `usluge` (Task 2), `faqSchema` (Task 3)
- Produces: `UslugeGallery` props `{ items: { naslov: string; opis: string; href: string; slika?: ImageMetadata | string; meta?: string }[] }`; `Faq.astro` props `{ pitanja: {pitanje: string; odgovor: string}[] }` — renderira `<details>` i `faqSchema` JSON-LD.
- Prilagodba galerije: otvoreni panel sadrži opis i pravi `<a href>`; natpisi su HTML tekst; boje preko Tailwind tokena; panel „Tepisi” → `/usluge/tepih-ploce/`, opis spominje rolu i gripere.

- [ ] **Step 1: Failing e2e** `tests/e2e/usluge-gallery.spec.ts`:
  - u HTML-u (bez JS-a) postoje linkovi na `/usluge/lvt-vinil/`, `/usluge/tepih-ploce/`, `/usluge/pvc-podovi/`, `/usluge/epoksidni-podovi/`
  - ispod galerije postoje linkovi na preostalih 9 usluga
  - Tab fokus na drugi panel ga otvara (`aria-current="true"`)
  - sekcija „Kako radimo” ima ordered list s 5 stavki, prva „Izlazak na teren”
  - FAQ: 5 `<details>`, jedan `FAQPage` JSON-LD na stranici
- [ ] **Step 2:** Test → FAIL.
- [ ] **Step 3:** Implementirati; galerija kao island `client:visible`.
- [ ] **Step 4:** Test → PASS; izmjeriti JS naslovne u `dist/_astro` (gzip zbroj chunkova koje naslovna učitava) ≤ 30 KB.
- [ ] **Step 5: Commit** `feat: galerija usluga, proces, FAQ`

---

### Task 6: Stranice usluga

**Files:**
- Create: `src/pages/usluge/index.astro`, `src/pages/usluge/[slug].astro`, `src/components/astro/Breadcrumbs.astro`, `tests/e2e/usluge.spec.ts`
- Modify: `tests/e2e/global.spec.ts` (dodati `/usluge/` i 13 ruta)

**Interfaces:**
- Consumes: kolekcija `usluge`, `serviceSchema`, `breadcrumbSchema`, `Faq.astro`
- Produces: `Breadcrumbs.astro` props `{ items: {naziv: string; path: string}[] }`; CTA link format `/zatrazi-ponudu/?obloga=<vrijednost iz §8.2>` (mapa slug → obloga u `[slug].astro`; usluge bez odgovarajuće obloge šalju samo na `/zatrazi-ponudu/`).

- [ ] **Step 1: Failing e2e** za svaku od 13 ruta: jedan H1 jednak `h1` iz frontmattera; prvi `<p>` u `<main>` jednak `kratakOdgovor`; postoji JSON-LD `Service` i `BreadcrumbList`; sekcije „Prednosti” i „Nedostaci”; svi linkovi srodnih usluga vode na postojeće rute (status 200).
- [ ] **Step 2:** → FAIL.
- [ ] **Step 3:** Implementirati predložak prema specifikaciji §7.2; `/usluge/` grupira usluge po 7 grupa.
- [ ] **Step 4:** → PASS (uključujući global 320 px test za nove rute).
- [ ] **Step 5: Commit** `feat: stranice usluga`

---

### Task 7: Reference

**Files:**
- Create: `src/content/reference/*.md` (iz kumovih fotki; dok ih nema, 3 primjera označena `draft: true`), `src/components/astro/ReferencaKartica.astro`, `src/pages/reference.astro`, `tests/e2e/reference.spec.ts`
- Modify: `src/pages/index.astro` (3 istaknute), `src/pages/usluge/[slug].astro` (povezane reference), `tests/e2e/global.spec.ts`

**Interfaces:**
- Produces: `getReference(filter?: { tipObjekta?: string; obloga?: string; limit?: number }): Promise<CollectionEntry<'reference'>[]>` u `src/lib/reference.ts` (isključuje `draft` u produkcijskom buildu) — koristi i Task 9 (hvala).
- `javnoIme: false` → naslov kartice je `${tipObjekta naziv}, ${grad}`.

- [ ] **Step 1: Failing test** (unit za `getReference` filter po `tipObjekta` i `limit`; e2e: kartica prikazuje tip, oblogu, m² i grad; filter po tipu objekta radi i bez JS-a preko sidara `#hotel` itd.).
- [ ] **Step 2:** → FAIL. **Step 3:** Implementirati. **Step 4:** → PASS.
- [ ] **Step 5: Commit** `feat: reference`

---

### Task 8: Savjeti (blog) — 5 članaka

**Files:**
- Create: `src/content/savjeti/{koliko-se-susi-estrih,koji-pod-za-podno-grijanje,vinil-ili-laminat,linoleum-ili-pvc,sto-je-holker}.md`, `src/pages/savjeti/index.astro`, `src/pages/savjeti/[slug].astro`, `tests/e2e/savjeti.spec.ts`
- Modify: `tests/e2e/global.spec.ts`

**Interfaces:**
- Consumes: `articleSchema`, `faqSchema`, `Faq.astro`, `Breadcrumbs.astro`
- Link iz presjeka (Task 4) na `/savjeti/koji-pod-za-podno-grijanje/` mora vratiti 200.

- [ ] **Step 1: Failing e2e:** 5 članaka na `/savjeti/`; svaki članak ima JSON-LD `Article`, prvi odlomak = `kratakOdgovor`, barem jedan link na uslugu; članak o estrihu sadrži „tjedan dana po centimetru” i „CM metod”.
- [ ] **Step 2:** → FAIL. **Step 3:** Napisati članke (izvor: PDF grupa E i katalog; 600–1000 riječi; tablica usporedbe u člancima 3 i 4). **Step 4:** → PASS.
- [ ] **Step 5: Commit** `feat: savjeti s 5 članaka`

---

### Task 9: Forma „Radni nalog” — logika (TDD)

**Files:**
- Create: `src/lib/nalog.ts`, `tests/unit/nalog.test.ts`

**Interfaces:**
- Produces:
  - `type StepId = 'objekt'|'obloga'|'raspored'|'povrsina'|'podloga'|'tehnicki'|'lokacija'|'kontakt'`
  - `type Answers = Partial<Record<FieldName, string>>`, `FieldName` = sva polja iz §8.2 (`objekt, obloga, raspored, povrsina, podloga, niveliranje, starost-estriha, podno-grijanje, lokacija, kat, dizalo, pocetak, ime, tvrtka, email, telefon, napomena, privola`)
  - `const STEPS: { id: StepId; pitanje: string; polja: { name: FieldName; label: string; opcije?: { value: string; label: string; opis?: string }[]; obavezno: boolean }[] }[]` — pitanja i opcije doslovno iz §8.2 (labele na hrvatskom)
  - `visibleSteps(a: Answers): StepId[]`
  - `nextStep(current: StepId, a: Answers): StepId | null`, `prevStep(current: StepId, a: Answers): StepId | null`
  - `prefillFromQuery(params: URLSearchParams): Answers`
  - `validateStep(step: StepId, a: Answers, prilog?: File | null): Partial<Record<FieldName | 'prilog', string>>`
  - `toFormData(a: Answers, prilog?: File | null): FormData`
  - `nalogSummary(a: Answers): { step: StepId; label: string; value: string }[]`
  - `loadAnswers(storage: Pick<Storage,'getItem'> | null): Answers`, `saveAnswers(storage: Pick<Storage,'setItem'> | null, a: Answers): void`
  - `const MAX_PRILOG_BYTES = 8 * 1024 * 1024`, `const PRILOG_EXT = ['pdf','xls','xlsx','doc','docx','jpg','jpeg','png','heic','dwg']`

- [ ] **Step 1: Failing testovi** `tests/unit/nalog.test.ts`:
  - `visibleSteps({obloga:'lvt'})` sadrži `raspored`; `visibleSteps({obloga:'pvc-rola'})` ne sadrži; `visibleSteps({obloga:'laminat'})` sadrži
  - `nextStep('obloga', {obloga:'epoksid'}) === 'povrsina'`; `nextStep('kontakt', …) === null`; `prevStep('povrsina', {obloga:'pvc-rola'}) === 'obloga'`
  - `prefillFromQuery(new URLSearchParams('objekt=hotel&obloga=lvt'))` → `{objekt:'hotel', obloga:'lvt'}`; `objekt=xyz` i `obloga=<script>` → `{}` (Review Focus 1)
  - `validateStep('kontakt', {})` vraća greške: `ime: 'Upišite ime i prezime.'`, `email: 'Upišite ispravnu e-mail adresu.'`, `telefon: 'Upišite broj telefona, npr. 091 234 5678.'`, `privola: 'Potrebna je privola za obradu podataka.'`
  - telefon: `'091 234 5678'`, `'+385 91 234 5678'`, `'01/2345-678'` prolaze; `'12345'` ne prolazi (pravilo: nakon uklanjanja razmaka, `/`, `-`, `()` mora odgovarati `^(\+385|0)\d{8,9}$`)
  - prilog 12 MB → `prilog: 'Prilog je veći od 8 MB. Pošaljite manju datoteku ili nam je pošaljite e-mailom.'`; `virus.exe` → `prilog: 'Ovu vrstu datoteke ne možemo primiti. Pošaljite PDF, Excel, Word, DWG ili fotografiju.'` (Review Focus 2)
  - `toFormData` sadrži `form-name = radni-nalog`, sva popunjena polja, `prilog` kad postoji, i ne sadrži `raspored` kad korak nije vidljiv
  - `nalogSummary({objekt:'hotel', povrsina:'150-500'})` → `[{step:'objekt', label:'Objekt', value:'Hotel, turistički ili ugostiteljski objekt'}, {step:'povrsina', label:'Površina', value:'150 – 500 m²'}]`
  - `loadAnswers(null)` → `{}`; `loadAnswers` sa storageom koji baca iznimku → `{}`; `saveAnswers` sa storageom koji baca iznimku ne baca dalje (Review Focus 3)
- [ ] **Step 2:** `npx vitest run tests/unit/nalog.test.ts` → FAIL.
- [ ] **Step 3:** Implementirati `src/lib/nalog.ts` (bez ovisnosti o Reactu i DOM-u osim tipova `File`/`FormData`/`URLSearchParams`).
- [ ] **Step 4:** → PASS.
- [ ] **Step 5: Commit** `feat: logika forme radni nalog`

---

### Task 10: Forma „Radni nalog” — UI, Netlify i zahvalna stranica

**Ovisi o preuzimanjima 20. 10. (Wizard Steps, File Dropzone) i 21. 10. (gumb sa stanjima).**

**Files:**
- Create: `src/components/ui/{choicebox,wizard-steps,file-dropzone,state-button}.tsx` (prilagodbe), `src/components/react/RadniNalog.tsx`, `src/components/astro/NalogFallback.astro`, `src/pages/zatrazi-ponudu.astro`, `src/pages/hvala.astro`, `tests/e2e/forma.spec.ts`
- Modify: `tests/e2e/global.spec.ts` (`/zatrazi-ponudu/`, `/hvala/`)

**Interfaces:**
- Consumes: sve iz `src/lib/nalog.ts` (Task 9), `getReference` (Task 7)
- `NalogFallback.astro`: statična forma `name="radni-nalog" method="POST" data-netlify="true" netlify-honeypot="bot-field" enctype="multipart/form-data" action="/hvala/"` sa svim poljima iz `STEPS`; vidljiva kad JS ne radi (`<noscript>` stil ili klasa koju island uklanja), a ujedno služi Netlifyju za detekciju polja.
- `RadniNalog` island (`client:load`): lijevo korak (Choicebox za opcije), desno ljepljivi nalog (`nalogSummary`, klik vraća na korak), na mobitelu sažeta traka; slanje `fetch('/', { method: 'POST', body: toFormData(...) })`; uspjeh → `location.assign('/hvala/?objekt=' + objekt)`.
- `choicebox.tsx`: `kit-theme` zamijenjen Tailwind tokenima; jedan odabir = automatski `nextStep`.

- [ ] **Step 1: Failing e2e** `tests/e2e/forma.spec.ts` (Netlify POST se presreće s `page.route('/', …)` i vraća 200):
  - puni tok: hotel → LVT → riblja kost → 150–500 → novi estrih / da → 1–2 mj / da → „Split”, 3. kat, dizalo da, za mjesec dana → kontakt → poslano → URL `/hvala/?objekt=hotel`; presretnuti body sadrži `form-name=radni-nalog` i `raspored=riblja-kost`
  - PVC u roli preskače korak 3; traka napretka ne broji preskočeni korak
  - `?objekt=hotel&obloga=lvt` kreće na koraku 3; `?objekt=xyz` kreće na koraku 1
  - klik na stavku naloga „Površina” vraća na korak površine s očuvanim odgovorima
  - osvježavanje na koraku 5 → odgovori i korak vraćeni (Review Focus 3)
  - prilog 12 MB (`setInputFiles` s bufferom) → poruka uz polje, ostali odgovori ostaju (Review Focus 2)
  - Netlify vraća 500 → poruka „Slanje nije uspjelo. Provjerite vezu i pokušajte ponovno ili nas nazovite na <telefon>.”, gumb se vraća u stanje spremno, podaci ostaju
  - **bez JS-a**: vidljiva je statična forma s poljima `ime`, `email`, `telefon`, `objekt`, `prilog`, `privola` i `bot-field` je skriven (Review Focus 4)
  - `/hvala/?objekt=hotel` prikazuje „ponuda u roku 48 sati”, 4 koraka procesa, telefon, do 3 reference tipa hotel; ima `noindex`
- [ ] **Step 2:** → FAIL.
- [ ] **Step 3:** Implementirati; korak 6 nosi rečenicu: „Cementni estrih se okvirno suši tjedan dana po centimetru debljine do 4 cm, a nakon toga znatno sporije. Prije polaganja mjerimo preostalu vlagu CM metodom.”
- [ ] **Step 4:** → PASS; JS rute `/zatrazi-ponudu/` ≤ 60 KB gzip.
- [ ] **Step 5: Commit** `feat: forma radni nalog i zahvalna stranica`

---

### Task 11: Ostale stranice i zamjena gumba / navigacije 21st.dev komponentama

**Ovisi o preuzimanjima 21. 10. i 22. 10.**

**Files:**
- Create: `src/pages/{o-nama,kontakt,politika-privatnosti,impressum,404}.astro`, `src/components/ui/{hover-button,link-hover}.tsx` (ili `.astro` ako je komponenta čisti CSS nakon prilagodbe), `tests/e2e/stranice.spec.ts`
- Modify: `Header.astro`, `MobileNav.tsx` (Centered Nav Header obrazac), `Hero.astro`, `CtaTraka.astro`, `tests/e2e/global.spec.ts`

**Interfaces:**
- Consumes: `site` (NAP), `businessSchema`
- Hijerarhija gumba (specifikacija §6.4): `primary` = Interactive Hover Button; `secondary` = obrub koji se puni crnom; tekstualni link = Link Hover (prepisan na CSS, bez GSAP-a); slanje forme = state-button iz Taska 10.

- [ ] **Step 1: Failing e2e:** kontakt sadrži telefon (`tel:` link), e-mail (`mailto:`), adresu iz `site`; impressum sadrži pravni naziv; 404 vraća status 404 i link na `/usluge/` i `/zatrazi-ponudu/`; na naslovnoj primarni CTA i CTA u headeru nemaju istu klasu komponente kao sekundarni gumb; nijedan tekst gumba ne sadrži „→”.
- [ ] **Step 2:** → FAIL. **Step 3:** Implementirati; GSAP se ne instalira (`package.json` ne smije sadržavati `gsap`). **Step 4:** → PASS.
- [ ] **Step 5: Commit** `feat: pravne i info stranice, 21st.dev gumbi i navigacija`

---

### Task 12: Završna provjera i objava na Netlify

**Files:**
- Modify: `netlify.toml` (build `npm run build`, publish `dist`, headers: cache za `/_astro/*` i `/fonts/*` 1 godina immutable), `podovi-gjp/README.md` (naredbe, struktura, popis `TODO-kum` vrijednosti)
- Modify: `C:\Users\dario\Desktop\Test Claude\CLAUDE.md` (build/test naredbe i arhitektura)

- [ ] **Step 1:** `npm run build && npx vitest run && npx playwright test` → sve PASS.
- [ ] **Step 2:** Lighthouse (mobitel) na `/`, `/usluge/pvc-podovi/`, `/zatrazi-ponudu/`: sve kategorije ≥ 95; zapisati rezultate u README.
- [ ] **Step 3:** Skill `web-design-guidelines` nad `src/components/**` i `src/pages/**`; ispraviti nalaze.
- [ ] **Step 4:** JSON-LD provjera (validator.schema.org) za naslovnu, jednu uslugu i jedan članak.
- [ ] **Step 5:** Deploy preview na Netlify (korisnik povezuje GitHub repo i postavlja e-mail obavijesti forme na kumov e-mail); poslati stvarni probni upit s prilogom i potvrditi da je stigao.
- [ ] **Step 6: Commit** `chore: završna provjera i Netlify konfiguracija`

---

## Redoslijed i datumi

| Dan | Taskovi |
|---|---|
| 19.–20. 10. | 1, 2, 3, 4 |
| 20.–21. 10. | 5, 6, 9 (logika ne ovisi o komponentama) |
| 21. 10. | 7, 8, 10 (Wizard Steps + Dropzone preuzeti 20. 10.) |
| 22. 10. | 11 (nakon zadnjih preuzimanja), 12 |

Sadržaj koji ovisi o kumu (fotke, podaci firme, e-mail, domena) koristi `TODO-kum` vrijednosti i placeholdere; zamjena ne mijenja kod.
