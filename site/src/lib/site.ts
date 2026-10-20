// Jedini izvor istine za podatke firme (naziv, adresa, telefon) — koriste ga layout, kontakt, impressum i schema.
// Registarski podaci: Fina InfoBiz, 20. 10. 2026. Vrijednosti 'TODO-kum' čekaju klijenta; produkcijski build pada dok postoje.
export const site = {
  naziv: 'Podovi GJP',
  pravniNaziv: 'PODOVI GJP d.o.o. za završne radove u graditeljstvu',
  oib: '70545360117',
  url: 'https://podovi-gjp.hr',
  telefon: 'TODO-kum',
  email: 'TODO-kum',
  adresa: {
    ulica: 'Ulica Karela Zahradnika 21',
    grad: 'Zagreb',
    postanskiBroj: '10010',
    drzava: 'HR',
  },
  registar: {
    maticniBroj: '05330122',
    // Sud slijedi iz sjedišta u Zagrebu (nije naveden na InfoBizu); MBS mora dati klijent
    sud: 'Trgovački sud u Zagrebu',
    mbs: 'TODO-kum',
    temeljniKapital: '2.654,00 EUR',
    direktor: 'Goran Šimac',
    djelatnost: '43.35 Ostali završni građevinski radovi',
  },
  podrucje: 'Hrvatska',
} as const;
