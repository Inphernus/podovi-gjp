// JSON-LD generatori (specifikacija §9). Svi URL-ovi su apsolutni, na temelju site.url.
import { site } from './site';

const abs = (path: string) => new URL(path, site.url).href;
const BUSINESS_ID = abs('/#firma');

/** Firma; knowsAbout prima nazive usluga (puni se iz kolekcije na naslovnoj). */
export function businessSchema(knowsAbout: string[] = []): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': BUSINESS_ID,
    name: site.naziv,
    url: abs('/'),
    logo: abs('/logo.svg'),
    telephone: site.telefon,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.adresa.ulica,
      addressLocality: site.adresa.grad,
      postalCode: site.adresa.postanskiBroj,
      addressCountry: site.adresa.drzava,
    },
    areaServed: { '@type': 'Country', name: site.podrucje },
    ...(knowsAbout.length ? { knowsAbout } : {}),
  };
}

export function serviceSchema(u: { naslov: string; kratakOdgovor: string; slug: string }): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: u.naslov,
    description: u.kratakOdgovor,
    url: abs(`/usluge/${u.slug}/`),
    areaServed: { '@type': 'Country', name: site.podrucje },
    provider: { '@id': BUSINESS_ID },
  };
}

export function faqSchema(faq: { pitanje: string; odgovor: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.pitanje,
      acceptedAnswer: { '@type': 'Answer', text: f.odgovor },
    })),
  };
}

export function breadcrumbSchema(items: { naziv: string; path: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.naziv,
      item: abs(it.path),
    })),
  };
}

export function articleSchema(a: { naslov: string; metaOpis: string; datum: Date; slug: string }): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.naslov,
    description: a.metaOpis,
    datePublished: a.datum.toISOString().slice(0, 10),
    url: abs(`/savjeti/${a.slug}/`),
    inLanguage: 'hr',
    author: { '@id': BUSINESS_ID },
    publisher: { '@id': BUSINESS_ID },
  };
}

export function websiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.naziv,
    url: abs('/'),
    inLanguage: 'hr',
    publisher: { '@id': BUSINESS_ID },
  };
}
