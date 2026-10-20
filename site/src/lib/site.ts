// Jedini izvor istine za podatke firme (naziv, adresa, telefon) — koriste ga layout, kontakt, impressum i schema.
// Vrijednosti 'TODO-kum' čekaju podatke od klijenta (specifikacija §11); produkcijski build pada dok postoje.
export const site = {
  naziv: 'Podovi GJP',
  pravniNaziv: 'PODOVI GJP d.o.o.',
  oib: '70545360117',
  url: 'https://podovi-gjp.hr',
  telefon: 'TODO-kum',
  email: 'TODO-kum',
  adresa: {
    ulica: 'Ulica Karela Zahradnika 21',
    grad: 'Zagreb',
    postanskiBroj: '10000',
    drzava: 'HR',
  },
  podrucje: 'Hrvatska',
} as const;
