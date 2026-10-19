// Sve rute weba; koriste ih global.spec.ts i jsonld.spec.ts
export const rute = [
  '/',
  '/usluge/',
  '/reference/',
  '/savjeti/',
  '/zatrazi-ponudu/',
  '/hvala/',
  '/o-nama/',
  '/kontakt/',
  '/politika-privatnosti/',
  '/impressum/',
  ...['koliko-se-susi-estrih', 'koji-pod-za-podno-grijanje', 'vinil-ili-laminat', 'linoleum-ili-pvc', 'sto-je-holker'].map((s) => `/savjeti/${s}/`),
  ...['priprema-podloge', 'pvc-podovi', 'lvt-vinil', 'linoleum', 'gumeni-podovi', 'bolon-pleteni-vinil', 'tepih-ploce',
    'tepih-u-roli', 'tepih-na-gripere', 'laminat', 'dupli-podovi', 'epoksidni-podovi', 'zavrsni-radovi'].map((s) => `/usluge/${s}/`),
];
