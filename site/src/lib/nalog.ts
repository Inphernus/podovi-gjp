// Logika forme „Radni nalog” (specifikacija §8): koraci, validacija, slanje, sažetak, spremanje.
// Bez ovisnosti o UI-u; koristi je React/Preact island i testira Vitest.
import { OBJEKTI } from './objekti';
import { OBLOGE } from './obloge';

export type StepId = 'objekt' | 'obloga' | 'raspored' | 'povrsina' | 'podloga' | 'tehnicki' | 'lokacija' | 'kontakt';

export type FieldName =
  | 'objekt' | 'obloga' | 'raspored' | 'povrsina' | 'podloga' | 'niveliranje' | 'starost-estriha' | 'podno-grijanje'
  | 'lokacija' | 'kat' | 'dizalo' | 'pocetak' | 'ime' | 'tvrtka' | 'email' | 'telefon' | 'napomena' | 'privola';

export type Answers = Partial<Record<FieldName, string>>;

export type Opcija = { value: string; label: string; opis?: string };

export type Polje = {
  name: FieldName;
  label: string;
  /** Naziv stavke u radnom nalogu; polja bez oznake (kontakt) se ne prikazuju u sažetku. */
  oznaka?: string;
  tip: 'izbor' | 'tekst' | 'email' | 'tel' | 'textarea' | 'checkbox';
  opcije?: readonly Opcija[];
  obavezno: boolean;
  autocomplete?: string;
};

export type Korak = { id: StepId; pitanje: string; napomena?: string; polja: Polje[] };

const DA_NE_NEZNAM = [
  { value: 'da', label: 'Da' },
  { value: 'ne', label: 'Ne' },
  { value: 'ne-znam', label: 'Ne znam' },
] as const;

export const STEPS: Korak[] = [
  {
    id: 'objekt',
    pitanje: 'Za kakav prostor tražite pod?',
    polja: [{ name: 'objekt', label: 'Vrsta objekta', oznaka: 'Objekt', tip: 'izbor', opcije: OBJEKTI, obavezno: true }],
  },
  {
    id: 'obloga',
    pitanje: 'Znate li već koju oblogu želite?',
    polja: [{ name: 'obloga', label: 'Vrsta obloge', oznaka: 'Obloga', tip: 'izbor', opcije: OBLOGE, obavezno: true }],
  },
  {
    id: 'raspored',
    pitanje: 'Kakav raspored želite?',
    polja: [
      {
        name: 'raspored', label: 'Raspored', oznaka: 'Raspored', tip: 'izbor', obavezno: true,
        opcije: [
          { value: 'daska', label: 'Klasična daska' },
          { value: 'riblja-kost', label: 'Riblja kost' },
          { value: 'chevron', label: 'Chevron' },
          { value: 'veliki-format', label: 'Veliki format' },
          { value: 'loose-lay', label: 'Loose-lay' },
          { value: 'nije-bitno', label: 'Nije bitno' },
        ],
      },
    ],
  },
  {
    id: 'povrsina',
    pitanje: 'Kolika je približna površina?',
    polja: [
      {
        name: 'povrsina', label: 'Površina', oznaka: 'Površina', tip: 'izbor', obavezno: true,
        opcije: [
          { value: 'do-50', label: 'do 50 m²' },
          { value: '50-150', label: '50 – 150 m²' },
          { value: '150-500', label: '150 – 500 m²' },
          { value: '500-1500', label: '500 – 1.500 m²' },
          { value: 'preko-1500', label: 'više od 1.500 m²' },
        ],
      },
    ],
  },
  {
    id: 'podloga',
    pitanje: 'Kakva je trenutna podloga?',
    polja: [
      {
        name: 'podloga', label: 'Trenutna podloga', oznaka: 'Podloga', tip: 'izbor', obavezno: true,
        opcije: [
          { value: 'novi-estrih', label: 'Novi estrih, nikad nije bilo obloge' },
          { value: 'stara-obloga', label: 'Postoji stara obloga koju treba ukloniti' },
          { value: 'betonska-ploca', label: 'Betonska ploča bez estriha' },
          { value: 'ne-znam', label: 'Ne znam' },
        ],
      },
      {
        name: 'niveliranje', label: 'Je li potrebno niveliranje ili sanacija podloge?', oznaka: 'Niveliranje', tip: 'izbor', obavezno: true,
        opcije: [
          { value: 'da', label: 'Da' },
          { value: 'ne', label: 'Ne' },
          { value: 'izlazak-na-teren', label: 'Ne znam, molim izlazak na teren' },
        ],
      },
    ],
  },
  {
    id: 'tehnicki',
    pitanje: 'Tehnički uvjeti',
    napomena:
      'Cementni estrih se okvirno suši tjedan dana po centimetru debljine do 4 cm, a nakon toga znatno sporije. Prije polaganja mjerimo preostalu vlagu CM metodom.',
    polja: [
      {
        name: 'starost-estriha', label: 'Koliko je star estrih?', oznaka: 'Starost estriha', tip: 'izbor', obavezno: true,
        opcije: [
          { value: 'manje-1mj', label: 'Manje od 1 mjeseca' },
          { value: '1-2mj', label: '1 – 2 mjeseca' },
          { value: '2-6mj', label: '2 – 6 mjeseci' },
          { value: 'vise-6mj', label: 'Više od 6 mjeseci' },
          { value: 'ne-znam', label: 'Ne znam' },
        ],
      },
      { name: 'podno-grijanje', label: 'Postoji li podno grijanje?', oznaka: 'Podno grijanje', tip: 'izbor', opcije: DA_NE_NEZNAM, obavezno: true },
    ],
  },
  {
    id: 'lokacija',
    pitanje: 'Gdje je objekt i kada bi radovi trebali početi?',
    polja: [
      { name: 'lokacija', label: 'Grad ili mjesto', oznaka: 'Lokacija', tip: 'tekst', obavezno: true, autocomplete: 'address-level2' },
      {
        name: 'kat', label: 'Na kojem je katu?', oznaka: 'Kat', tip: 'izbor', obavezno: true,
        opcije: [
          { value: 'prizemlje', label: 'Prizemlje' },
          { value: '1-3', label: '1. – 3. kat' },
          { value: 'visi-kat', label: 'Viši kat' },
          { value: 'vise-etaza', label: 'Više etaža' },
        ],
      },
      { name: 'dizalo', label: 'Postoji li dizalo za unos materijala?', oznaka: 'Dizalo', tip: 'izbor', opcije: DA_NE_NEZNAM, obavezno: true },
      {
        name: 'pocetak', label: 'Kada bi radovi trebali početi?', oznaka: 'Početak radova', tip: 'izbor', obavezno: true,
        opcije: [
          { value: 'odmah', label: 'Odmah, u roku 2 tjedna' },
          { value: 'mjesec', label: 'U roku mjesec dana' },
          { value: '1-3mj', label: 'Za 1 – 3 mjeseca' },
          { value: 'vise-3mj', label: 'Za više od 3 mjeseca' },
          { value: 'planiram', label: 'Još planiram' },
        ],
      },
    ],
  },
  {
    id: 'kontakt',
    pitanje: 'Kome šaljemo ponudu?',
    polja: [
      { name: 'ime', label: 'Ime i prezime', tip: 'tekst', obavezno: true, autocomplete: 'name' },
      { name: 'tvrtka', label: 'Naziv tvrtke (neobavezno)', tip: 'tekst', obavezno: false, autocomplete: 'organization' },
      { name: 'email', label: 'E-mail', tip: 'email', obavezno: true, autocomplete: 'email' },
      { name: 'telefon', label: 'Broj telefona', tip: 'tel', obavezno: true, autocomplete: 'tel' },
      { name: 'napomena', label: 'Napomena (neobavezno)', tip: 'textarea', obavezno: false },
      { name: 'privola', label: 'Slažem se s obradom podataka u svrhu izrade ponude.', tip: 'checkbox', obavezno: true },
    ],
  },
];

export const MAX_PRILOG_BYTES = 8 * 1024 * 1024;
export const PRILOG_EXT = ['pdf', 'xls', 'xlsx', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'heic', 'dwg'];
const STORAGE_KEY = 'gjp-radni-nalog';

const korak = (id: StepId) => STEPS.find((s) => s.id === id)!;
const SVA_POLJA = STEPS.flatMap((s) => s.polja);
const IMENA = new Set<string>(SVA_POLJA.map((p) => p.name));
const RASPORED_ZA = new Set(['lvt', 'laminat']);

export function visibleSteps(a: Answers): StepId[] {
  return STEPS.map((s) => s.id).filter((id) => id !== 'raspored' || RASPORED_ZA.has(a.obloga ?? ''));
}

export function nextStep(current: StepId, a: Answers): StepId | null {
  const v = visibleSteps(a);
  const i = v.indexOf(current);
  return i >= 0 && i < v.length - 1 ? v[i + 1] : null;
}

export function prevStep(current: StepId, a: Answers): StepId | null {
  const v = visibleSteps(a);
  const i = v.indexOf(current);
  return i > 0 ? v[i - 1] : null;
}

export function prefillFromQuery(params: URLSearchParams): Answers {
  const out: Answers = {};
  const objekt = params.get('objekt');
  const obloga = params.get('obloga');
  if (objekt && OBJEKTI.some((o) => o.value === objekt)) out.objekt = objekt;
  if (obloga && OBLOGE.some((o) => o.value === obloga)) out.obloga = obloga;
  return out;
}

// Domaći (0…) ili međunarodni (+ ili 00 i pozivni broj) — investitori i izvođači mogu biti iz inozemstva
const TELEFON = /^(0\d{8,9}|(\+|00)\d{8,15})$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PORUKA: Partial<Record<FieldName, string>> = {
  ime: 'Upišite ime i prezime.',
  email: 'Upišite ispravnu e-mail adresu.',
  telefon: 'Upišite broj telefona, npr. 091 234 5678.',
  privola: 'Potrebna je privola za obradu podataka.',
  lokacija: 'Upišite grad ili mjesto.',
};

export function validateStep(step: StepId, a: Answers, prilog?: File | null): Partial<Record<FieldName | 'prilog', string>> {
  const greske: Partial<Record<FieldName | 'prilog', string>> = {};
  for (const p of korak(step).polja) {
    const v = (a[p.name] ?? '').trim();
    if (p.obavezno && !v) {
      greske[p.name] = p.tip === 'izbor' ? 'Odaberite jedan odgovor.' : PORUKA[p.name] ?? 'Ovo polje je obavezno.';
      continue;
    }
    if (p.name === 'email' && v && !EMAIL.test(v)) greske.email = PORUKA.email;
    if (p.name === 'telefon' && v && !TELEFON.test(v.replace(/[\s/\-()]/g, ''))) greske.telefon = PORUKA.telefon;
  }
  if (step === 'kontakt' && prilog) {
    const ext = prilog.name.split('.').pop()?.toLowerCase() ?? '';
    if (!PRILOG_EXT.includes(ext)) greske.prilog = 'Ovu vrstu datoteke ne možemo primiti. Pošaljite PDF, Excel, Word, DWG ili fotografiju.';
    else if (prilog.size > MAX_PRILOG_BYTES) greske.prilog = 'Prilog je veći od 8 MB. Pošaljite manju datoteku ili nam je pošaljite e-mailom.';
  }
  return greske;
}

export function pocetniKorak(a: Answers): StepId {
  return visibleSteps(a).find((id) => Object.keys(validateStep(id, a)).length > 0) ?? 'kontakt';
}

export function toFormData(a: Answers, prilog?: File | null): FormData {
  const fd = new FormData();
  fd.append('form-name', 'radni-nalog');
  for (const id of visibleSteps(a)) {
    for (const p of korak(id).polja) {
      const v = a[p.name];
      if (v) fd.append(p.name, v);
    }
  }
  if (prilog) fd.append('prilog', prilog);
  return fd;
}

export function nalogSummary(a: Answers): { step: StepId; label: string; value: string }[] {
  return visibleSteps(a).flatMap((id) =>
    korak(id).polja.flatMap((p) => {
      const v = a[p.name];
      if (!p.oznaka || !v) return [];
      const value = p.opcije ? p.opcije.find((o) => o.value === v)?.label ?? v : v;
      return [{ step: id, label: p.oznaka, value }];
    }),
  );
}

type Citaj = Pick<Storage, 'getItem'> | null;
type Pisi = Pick<Storage, 'setItem'> | null;

function procitaj(storage: Citaj): { a?: unknown; korak?: unknown } {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function loadAnswers(storage: Citaj): Answers {
  const { a } = procitaj(storage);
  if (!a || typeof a !== 'object') return {};
  return Object.fromEntries(
    Object.entries(a as Record<string, unknown>).filter(([k, v]) => IMENA.has(k) && typeof v === 'string'),
  ) as Answers;
}

export function loadKorak(storage: Citaj): StepId | null {
  const { korak: k } = procitaj(storage);
  return STEPS.some((s) => s.id === k) ? (k as StepId) : null;
}

// Kontakt podaci se nikad ne spremaju u preglednik (dijeljena računala u uredima)
const NE_SPREMAJ = new Set<string>(STEPS.find((s) => s.id === 'kontakt')!.polja.map((p) => p.name));

export function saveAnswers(storage: Pisi, a: Answers, trenutni?: StepId): void {
  try {
    const bezKontakta = Object.fromEntries(Object.entries(a).filter(([k]) => !NE_SPREMAJ.has(k)));
    storage?.setItem(STORAGE_KEY, JSON.stringify({ a: bezKontakta, korak: trenutni }));
  } catch {
    // privatni način ili pun storage: forma radi i bez spremanja
  }
}
