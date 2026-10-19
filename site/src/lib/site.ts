// Jedini izvor istine za podatke firme (naziv, adresa, telefon) — koriste ga layout, kontakt, impressum i schema.
// Vrijednosti 'TODO-kum' čekaju podatke od klijenta (specifikacija §11).
export const site = {
  naziv: 'Podovi GJP',
  pravniNaziv: 'TODO-kum',
  url: 'https://podovi-gjp.hr',
  telefon: 'TODO-kum',
  email: 'TODO-kum',
  adresa: {
    ulica: 'TODO-kum',
    grad: 'Zagreb',
    postanskiBroj: 'TODO-kum',
    drzava: 'HR',
  },
  podrucje: 'Hrvatska',
} as const;
