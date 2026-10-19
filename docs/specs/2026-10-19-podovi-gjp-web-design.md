# Podovi GJP — specifikacija weba (v1)

Datum: 19. 10. 2026.
Status: odobreni smjer, čeka pregled specifikacije.
Izvori: PDF „Podovi GJP — ključne riječi, katalog radova i funnel za web”, prototip `podovi-gjp/prototip/index.html`, referenca alenko-flooring.com, kumov uvodni tekst.

---

## 1. Cilj

Web koji dovodi **kvalificirane B2B upite** za podopolagačke radove u cijeloj Hrvatskoj: poslovni prostori, zdravstvo, obrazovanje, hoteli, sport, industrija, građevinske tvrtke i natječaji. Stambeni upiti su dobrodošli, ali nisu ciljana skupina.

Uspjeh v1:
- forma „radni nalog” šalje kompletan upit (objekt, obloga, površina, podloga, lokacija, rok, kontakt, prilog) na e-mail
- svaka usluga ima vlastitu stranicu koja cilja ključne riječi iz grupe B (PDF)
- Lighthouse ≥ 95 za Performance, Accessibility, Best Practices i SEO na naslovnoj i stranici usluge
- sadržaj je strukturiran tako da ga Google i AI pretraživači (ChatGPT, Perplexity, Google AI Overviews) mogu citirati

## 2. Opseg

**v1 (ova specifikacija):** naslovna, pregled usluga + 13 stranica usluga, reference, savjeti (blog) s 3–5 članaka, zatraži ponudu + hvala, o nama, kontakt, politika privatnosti, impressum, 404.

**v2 (izvan opsega, ali URL i sadržajni model ih predviđaju):** stranice po tipu objekta (`/objekti/...`), B2B / natječaji (`/za-izvodace/`), lokacijske stranice (`/podopolagac-zagreb/` …), automatsko bodovanje upita A/B/C i automatski odgovor, engleska verzija.

## 3. Tehnologija

| Sloj | Izbor | Zašto |
|---|---|---|
| Generator | **Astro 5** (statički izlaz) | čisti HTML, sadržaj u Markdownu, automatski sitemap |
| Interaktivni dijelovi | **React 19** kao Astro islands | forma, galerija usluga, mobilni izbornik; ostalo bez JS-a |
| Stil | **Tailwind CSS v4** + CSS varijable | 21st.dev komponente su pisane u Tailwindu; tokeni GJP-a mapiraju se na shadcn nazive (`background`, `foreground`, `border`…) |
| Animacije | CSS (scroll-driven) + **Motion** samo gdje CSS nije dovoljan | jedna biblioteka za sve komponente |
| Komponente | 21st.dev preko Magic MCP-a, prilagođene | vidi §6.4 |
| Hosting | **Netlify** (besplatni plan) | automatski deploy s GitHuba, HTTPS |
| Forme | **Netlify Forms** | upit s prilogom na e-mail, bez servera; limit 100 upita mjesečno i 8 MB po upitu na besplatnom planu |
| Slike | Astro `<Image>` → AVIF/WebP, `srcset`, lazy load | brzina |
| Font | Archivo (varijabilni, wdth 62–125, wght 100–900), self-hosted, subset Latin + Latin Extended | bez Google Fonts zahtjeva, podržava č ć đ š ž |

Struktura repozitorija (unutar `podovi-gjp/`):

```
site/
  astro.config.mjs
  src/
    content/
      usluge/*.md        // 13 usluga
      savjeti/*.md       // blog
      reference/*.md     // projekti
    content.config.ts    // sheme kolekcija
    components/
      astro/             // statični dijelovi (Header, Footer, Breadcrumbs, Faq, LayerSection…)
      react/             // islands (RadniNalog, UslugeGallery, MobileNav…)
      ui/                // prilagođene 21st.dev komponente
    layouts/BaseLayout.astro
    pages/…              // rute iz §5
    styles/tokens.css
    lib/schema.ts        // JSON-LD generatori
  public/  (robots.txt, llms.txt, favicon, og slike)
```

## 4. Sadržajni model

**Usluga** (`content/usluge/*.md`):

| Polje | Tip | Napomena |
|---|---|---|
| `naslov` | string | npr. „PVC podovi u roli” |
| `h1` | string | sadrži glavnu ključnu riječ, npr. „Postavljanje PVC podova s varenim spojevima i holkerima” |
| `metaOpis` | string ≤ 155 znakova | |
| `grupa` | enum | priprema, elasticne, tekstilne, laminat, tehnicki, epoksid, zavrsni |
| `fokus` | boolean | true za LVT, tepihe (ploče + rola), PVC u roli, epoksid |
| `kljucneRijeci` | string[] | iz PDF-a, grupa B |
| `kratakOdgovor` | string (2–3 rečenice) | prvi odlomak na stranici, za GEO |
| `prednosti` / `nedostaci` | string[] | iz PDF-a, katalog radova |
| `faq` | {pitanje, odgovor}[] | 3–5 po usluzi |
| `srodne` | slug[] | interni linkovi |
| `slika` | image | fotka kumovog rada; do tada neutralni placeholder |
| tijelo (Markdown) | | opis izvedbe, materijali (npr. UZIN NC 160), za koga je |

**Referenca** (`content/reference/*.md`): `naziv`, `tipObjekta` (isti enum kao korak 1 forme), `obloge` (slug[]), `povrsinaM2`, `grad`, `godina`, `slike[]`, `javnoIme` (boolean; false → prikazuje se opisno, npr. „Hotel, Split”).

**Savjet** (`content/savjeti/*.md`): `naslov`, `metaOpis`, `datum`, `kratakOdgovor`, `povezaneUsluge`, `faq?`.

## 5. Stranice i ključne riječi

| URL | H1 / tema | Ciljane ključne riječi |
|---|---|---|
| `/` | Stručnjaci za podne obloge | podopolagački radovi, izvođač podopolagačkih radova, profesionalne podne obloge, podne obloge za poslovne prostore |
| `/usluge/` | Podopolagački radovi | ugradnja podnih obloga, podni sustavi za objekte, izvođač podnih obloga Hrvatska |
| `/usluge/priprema-podloge/` | Priprema podloge i niveliranje | niveliranje poda, samorazlijevajuća masa, brušenje betonske podloge, sanacija pukotina u estrihu |
| `/usluge/pvc-podovi/` | PVC podovi s varenim spojevima i holkerima | postavljanje PVC podova, varenje PVC podova, PVC holker, PVC podovi za bolnice / vrtiće, homogeni PVC pod |
| `/usluge/lvt-vinil/` | LVT vinil ploče i daske | LVT vinil postavljanje, vinil riblja kost, chevron vinil pod, loose lay vinil, lijepljeni vinil pod |
| `/usluge/linoleum/` | Linoleum | linoleum postavljanje, linoleum s holkerima, linoleum za vrtiće i škole |
| `/usluge/gumeni-podovi/` | Gumeni podovi | gumeni pod ugradnja, gumeni pod sportska dvorana / teretana |
| `/usluge/bolon-pleteni-vinil/` | Bolon i pleteni PVC | Bolon pod, pleteni PVC pod |
| `/usluge/tepih-ploce/` | Tepih ploče | tepih ploče ugradnja, tepih za urede, akustični tepih |
| `/usluge/tepih-u-roli/` | Tepih u roli | postavljanje tepiha u roli, tepih za hotele |
| `/usluge/tepih-na-gripere/` | Tepih na gripere | tepih na gripere |
| `/usluge/laminat/` | Laminat za objekte | ugradnja laminata objekti, laminat za hotelske sobe |
| `/usluge/dupli-podovi/` | Dupli i kompjuterski podovi | dupli pod, kompjuterski pod, podignuti pod, tehnički pod za serverske sale |
| `/usluge/epoksidni-podovi/` | Epoksidni i poliuretanski podovi | epoksidni pod, samolijevni epoksidni pod, industrijski pod premaz, poliuretanski pod |
| `/usluge/zavrsni-radovi/` | Cokle, profili i završni radovi | PVC cokle ugradnja, MDF cokle, dilatacijski profili, završne podne lajsne |
| `/reference/` | Reference | podne obloge referentna lista |
| `/savjeti/` + članci | Savjeti o podovima | grupa E (vidi niže) |
| `/zatrazi-ponudu/` | Zatražite ponudu | ponuda za podne obloge |
| `/hvala/` | (noindex) | |
| `/o-nama/`, `/kontakt/` | | podopolagač Zagreb (adresa), izvođač podnih obloga Hrvatska |
| `/politika-privatnosti/`, `/impressum/` | | |

Članci v1 (redoslijed prioriteta): 1) Koliko se suši estrih i kako se mjeri vlaga CM metodom, 2) Koji pod za podno grijanje, 3) Vinil ili laminat, 4) Razlika linoleuma i PVC-a, 5) Što je holker i čemu služi.

Tekstovi: polaze od PDF-a (opisi, prednosti, nedostaci) i kumovog uvoda. Cijene se **ne objavljuju** kao cjenik po m²; gdje ima smisla, piše se što utječe na cijenu.

## 6. Dizajn sustav

### 6.1 Ideja
Web kao **presjek poda**: ono što GJP razlikuje je ono ispod obloge. Hrabrost se troši na jednom mjestu (sekcija slojeva), sve ostalo je mirno i čitljivo. Izbjegavaju se generički AI tragovi: krem pozadina, „skoro crna” s jednim akcentom, mreže jednakih kartica, VELIKA SLOVA iznad naslova, strelice u svakom gumbu, monospace oznake, fade-in na svakoj sekciji.

### 6.2 Tokeni

| Token | Hex | Uloga |
|---|---|---|
| `--crna` | `#000000` | logo, naslovi, tekst |
| `--wenge` | `#2B2420` | tamne sekcije |
| `--hrast` | `#A8743F` | jedini akcent: primarni gumbi (s crnim tekstom), aktivno stanje, mjerna letva |
| `--hrast-svijetli` | `#C99A66` | akcent na tamnoj pozadini |
| `--estrih` | `#D6D2CB` | sekundarne plohe, linije |
| `--gips` | `#EFEFEC` | glavna pozadina |
| `--nivelir` | `#7D7972` | sporedni tekst (samo ≥ 18 px ili na tamnoj pozadini gdje kontrast prolazi) |

Mapiranje na shadcn nazive: `background = gips`, `foreground = crna`, `border = estrih`, `primary = hrast`, `muted = estrih`, `muted-foreground = nivelir`, `ring = hrast`. Tamne sekcije koriste klasu `.dark-section` koja prebacuje `background = wenge`, `foreground = gips`, `primary = hrast-svijetli`.

Kontrast (provjeriti alatom pri izradi): crna na gips, gips na wenge i crna na hrast moraju biti ≥ 4.5:1.

### 6.3 Tipografija i mreža
- Archivo; naslovi `wdth 62–70`, `wght 800–900`, prored 0.88–0.95; tekst `wdth 100`, 17–18 px, prored 1.6, redak ≤ 70 znakova.
- Obrubljeni brojevi bez ispune (stil logotipa) **samo** za dubine u sekciji slojeva.
- 12 stupaca, maksimalna širina 1360 px, sve poravnato lijevo, asimetrično.
- Numeracija samo gdje je stvarni redoslijed (proces rada, koraci forme).

### 6.4 Komponente

| Element | Izvor | Stanje |
|---|---|---|
| Galerija 4 glavne usluge | 21st.dev Hover Expand Gallery | preuzeto 19. 10. |
| Odabir odgovora u formi | 21st.dev Choicebox | preuzeto 19. 10.; `kit-theme` zamijeniti GJP tokenima |
| Prijelazi koraka forme | 21st.dev Wizard Steps (samo prijelaz + tipkovnica) | 20. 10. |
| Prilog troškovnika | 21st.dev File Dropzone | 20. 10. |
| Primarni CTA | 21st.dev Interactive Hover Button (Magic UI) | 21. 10. |
| Gumb slanja forme (učitavanje / uspjeh) | 21st.dev Interactive Hover Button, više stanja | 21. 10. |
| Linkovi navigacije | 21st.dev Link Hover, prepisan s GSAP-a na CSS/Motion | 22. 10. |
| Header s mobilnom ladicom | 21st.dev Centered Nav Header | 22. 10. |
| Sekcija slojeva | vlastita (iz prototipa), SVG se generira pri buildu | gotov prototip |
| Riblja kost (placeholder) | vlastita (iz prototipa) | gotov prototip |
| FAQ | vlastiti `<details>` (bez JS-a) | |

Hijerarhija gumba: **primarni** (hrast, animacija ispune), **sekundarni** (obrub, puni se crnom pri hoveru), **tekstualni link** (podcrtavanje u hrastu), **CTA u headeru** (manji primarni), **slanje forme** (sa stanjima). Isti stil ne smije se pojaviti u dvije uloge.

Svaka preuzeta komponenta prolazi prilagodbu: tokeni umjesto zadanih boja, Archivo, uklonjeni `"use client"` i ovisnosti koje Astro ne treba, pristupačnost (fokus, tipkovnica, `prefers-reduced-motion`).

### 6.5 Animacije (ukupno)
1. **Raslojavanje presjeka poda** pri skrolanju (CSS `animation-timeline: view()`, `@property --gap`); bez podrške ili uz smanjeno kretanje prikazuje se statično raslojeno.
2. **Galerija usluga**: širenje panela (CSS `flex-basis`).
3. **Prijelazi u formi** i stanja gumba slanja.
4. Hover na gumbima i linkovima (≤ 250 ms).
Hero nema animaciju zbog LCP-a.

## 7. Stranice

### 7.1 Naslovna (redom)
1. **Header**: logo (vektoriziran SVG), Usluge, Reference, Savjeti, O nama, Kontakt, CTA „Zatraži ponudu”.
2. **Hero**: H1 „Stručnjaci za podne obloge”, kumov prvi odlomak (s „epoksidne sustave”), primarni + sekundarni gumb, desno fotka izvedenog rada (do tada riblja kost iz prototipa).
3. **Za kakav prostor tražite pod?**: 8 tipova objekta kao linkovi na `/zatrazi-ponudu/?objekt=<tip>` (forma kreće s odabranim korakom 1).
4. **Ono što se ne vidi** (wenge): naslov „Pod je onoliko dobar koliko i ono ispod njega.”, kumov drugi odlomak, interaktivni presjek iz prototipa (7 slojeva, dubine, opisi, linkovi na usluge).
5. **Usluge**: Hover Expand Gallery s 4 fokusa (LVT, tepisi, PVC u roli, epoksid), ispod popis ostalih 9 usluga kao linkovi grupirani po grupama. Komponenta se prilagođava tako da otvoreni panel sadrži kratki opis i pravi link na uslugu (izvorna ima samo gumb). Panel „Tepisi” vodi na `/usluge/tepih-ploce/` i u opisu linka rolu i gripere. Natpisi panela su HTML tekst, da ih tražilice čitaju.
6. **Reference**: 3 istaknuta projekta (fotka, tip objekta, obloga, m², grad) + link na sve.
7. **Kako radimo**: 1 izlazak na teren · 2 mjerenje vlage CM metodom · 3 ponuda u 48 h · 4 izvedba · 5 primopredaja.
8. **Česta pitanja** (5, s `FAQPage` schemom).
9. **CTA traka** + footer (podaci firme, usluge, kontakt, pravno).

### 7.2 Stranica usluge (predložak)
Breadcrumbs → H1 → kratak odgovor (2–3 rečenice) → fotka → „Kada je dobar izbor” (tijelo) → Prednosti / Nedostaci (dva stupca) → povezane reference (po `obloge`) → FAQ → srodne usluge → CTA s preddefiniranom oblogom (`/zatrazi-ponudu/?obloga=<slug>`).

### 7.3 Ostale
- **Reference**: mreža projekata s filtrom po tipu objekta (filtriranje bez JS-a preko sidara ili mali island); svaki projekt bez vlastite stranice u v1.
- **Savjeti**: popis članaka; članak = kratak odgovor → tijelo → FAQ → povezane usluge → CTA.
- **O nama**: tko je GJP, iskustvo, sustavi kojima radi (UZIN), područje rada, fotke ekipe ako postoje.
- **Kontakt**: telefon, e-mail, adresa, radno vrijeme, karta (statična slika s linkom na Google Maps, bez iframea), link na formu.
- **Hvala**: rok „ponuda u roku 48 sati”, proces (4 koraka), 3 reference za odabrani tip objekta (iz query parametra), telefon za hitne slučajeve. `noindex`.
- **404**: kratko, s linkovima na usluge i formu.

## 8. Forma „Radni nalog”

### 8.1 Izgled
Desktop: lijevo jedno pitanje po ekranu (Choicebox kartice), desno ljepljivi **radni nalog**, tehnički list koji se popunjava dok korisnik odgovara; klik na stavku naloga vraća na taj korak. Mobitel: nalog je sažeta traka na vrhu koja se otvara. Traka napretka prikazuje „korak X od 8”.

### 8.2 Koraci

| # | Pitanje | Polje (`name`) | Vrijednosti |
|---|---|---|---|
| 1 | Za kakav prostor tražite pod? | `objekt` | ured, zdravstvo, obrazovanje, hotel, sport, industrija, trgovina, stambeni |
| 2 | Znate li već koju oblogu želite? | `obloga` | pvc-rola, lvt, linoleum, tepih-ploce, tepih-rola, guma, laminat, epoksid, dupli-pod, samo-priprema, ne-znam |
| 3 | Kakav raspored želite? (samo za LVT i laminat) | `raspored` | daska, riblja-kost, chevron, veliki-format, loose-lay, nije-bitno |
| 4 | Kolika je približna površina? | `povrsina` | do-50, 50-150, 150-500, 500-1500, preko-1500 |
| 5 | Kakva je trenutna podloga? / Treba li niveliranje? | `podloga`, `niveliranje` | novi-estrih, stara-obloga, betonska-ploca, ne-znam / da, ne, izlazak-na-teren |
| 6 | Koliko je star estrih? / Ima li podnog grijanja? | `starost-estriha`, `podno-grijanje` | <1mj, 1-2mj, 2-6mj, >6mj, ne-znam / da, ne, ne-znam; uz korak ide informativna rečenica o sušenju estriha i CM metodi |
| 7 | Gdje je objekt i kakav je pristup? Kada bi radovi trebali početi? | `lokacija` (tekst), `kat`, `dizalo`, `pocetak` | prizemlje, 1-3, visi-kat, vise-etaza / da, ne, ne-znam / odmah, mjesec, 1-3mj, >3mj, planiram |
| 8 | Kome šaljemo ponudu? | `ime`*, `tvrtka`, `email`*, `telefon`*, `napomena`, `prilog` (do 8 MB), `privola`* | |

\* obavezno. **Bez OIB-a.** Korak 7 je rekonstruiran iz ispremiješanog dijela PDF-a; potvrditi s kumom.

### 8.3 Ponašanje
- Odabir jedne opcije automatski prelazi na sljedeći korak; korak s više polja ima gumb „Dalje”.
- Natrag preko gumba, tipke Backspace izvan polja i klika na stavku naloga.
- Query parametri `objekt` i `obloga` unaprijed popunjavaju korake 1 i 2.
- Stanje se čuva u `sessionStorage` (osvježavanje stranice ne briše odgovore).
- Validacija uz polje, jasna poruka što ispraviti; e-mail i telefon (HR format, dopušten +385).
- Slanje: `fetch` POST na `/` kao `multipart/form-data` s `form-name=radni-nalog`; u HTML-u postoji skrivena statična kopija forme s istim poljima da je Netlify prepozna; honeypot polje protiv spama.
- Gumb slanja ima stanja: spremno → šaljem → poslano; greška prikazuje poruku i ostavlja podatke.
- Uspjeh → `/hvala/?objekt=<tip>`.
- Bez JS-a: na stranici je vidljiva obična (duga) verzija iste forme koja radi s Netlify Forms.

### 8.4 E-mail kumu
Netlify obavijest na kumov e-mail. Predmet: „Novi radni nalog — <objekt>, <površina> m², <lokacija>”. Polja su imenovana tako da je mail čitljiv bez dodatne obrade.

## 9. SEO i GEO (tehnički)

- Jedan H1 po stranici, logična hijerarhija H2/H3, opisni `title` (≤ 60 znakova, „… | Podovi GJP”) i `meta description`.
- Kanonski URL-ovi, `sitemap-index.xml` (@astrojs/sitemap), breadcrumbs (vidljivi + `BreadcrumbList`).
- JSON-LD: `HomeAndConstructionBusiness` (naziv, logo, adresa, telefon, e-mail, `areaServed: Hrvatska`, `knowsAbout`), `Service` za svaku uslugu, `FAQPage` gdje postoji FAQ, `Article` za savjete, `WebSite`.
- Open Graph i Twitter kartice; OG slika po stranici (generirana pri buildu ili jedna zadana).
- Interni linkovi: usluga ↔ srodne usluge ↔ savjeti ↔ reference.
- `robots.txt`: dopušta sve, uključujući GPTBot, ClaudeBot, PerplexityBot i Google-Extended; link na sitemap.
- `llms.txt`: tko je GJP, područje rada, popis usluga s linkovima, kontakt.
- **GEO pravila sadržaja**: svaka usluga i članak počinju izravnim odgovorom u 2–3 rečenice; konkretne činjenice (debljine, vrijeme sušenja, sustavi); tablice usporedbe gdje ima smisla; dosljedni podaci firme (ime, adresa, telefon) posvuda.
- `lang="hr"`, `hr_HR` u OG-u.

## 10. Performanse i pristupačnost

- Budžet naslovne: JS ≤ 30 KB gzip (galerija + mobilni izbornik), CSS ≤ 25 KB, font ≤ 60 KB (jedan varijabilni woff2, subset), LCP ≤ 2,0 s na 4G, CLS < 0.1.
- Forma: JS ≤ 60 KB gzip, učitava se samo na `/zatrazi-ponudu/`.
- Slike: AVIF/WebP, `width`/`height` uvijek postavljeni, hero `fetchpriority="high"`, ostalo lazy.
- WCAG 2.2 AA: kontrast, vidljiv fokus, tipkovnica svugdje (uključujući presjek slojeva i galeriju), `prefers-reduced-motion`, ciljevi dodira ≥ 44 px, labele na svim poljima, nema horizontalnog skrolanja do 320 px.

## 11. Što treba od kuma

| Stavka | Potrebno za |
|---|---|
| Fotke izvedenih radova (što više, po mogućnosti s podacima: objekt, obloga, m², grad, godina) | hero, galerija usluga, reference |
| Podaci firme: puni naziv, OIB/MB, adresa, telefon, e-mail, radno vrijeme | impressum, kontakt, schema |
| E-mail na koji stižu upiti | Netlify obavijest |
| Domena (postoji li već?) | objava |
| Logo u vektorskom obliku (AI/SVG/PDF), ako postoji; inače ga vektoriziramo | header, favicon |
| Dopuštenje za javno navođenje imena investitora | reference |
| Potvrda koraka 7 forme (lokacija, kat, dizalo, rok) | forma |
| Kratki tekst „o nama”: od kada rade, koliko ljudi, certifikati | o nama, E-E-A-T |

## 12. Testiranje i provjera

- `astro check` i build bez upozorenja.
- Ručna provjera u pregledniku (desktop 1440, tablet 768, mobitel 375): naslovna, jedna usluga, forma od početka do kraja, hvala.
- Forma: slanje na Netlify deploy previewu stvarno stiže na e-mail, s prilogom; validacija; preskakanje koraka 3; `sessionStorage`; bez JS-a.
- Lighthouse (mobitel) na naslovnoj, usluzi i formi.
- Validacija JSON-LD-a (Rich Results Test / validator.schema.org).
- Vercel `web-design-guidelines` pregled UI-a prije predaje.

## 13. Otvorena pitanja

1. Domena i e-mail za upite.
2. Ime firme u pravnim stranicama (puni naziv d.o.o./obrt).
3. Ima li kum certifikate ili članstva koje vrijedi istaknuti.
4. Hoće li „Stirodur” ostati u presjeku (zaštićeni naziv) ili pisati „XPS ploče”.
