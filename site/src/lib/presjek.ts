// Presjek poda (naslovna, „Ono što se ne vidi”) i uzorak riblje kosti.
// SVG se generira pri buildu kao string; isti ulaz uvijek daje isti izlaz (fiksni seed).

export type SlojId = 'lvt' | 'ljepilo' | 'nivelir' | 'estrih' | 'grijanje' | 'xps' | 'beton';

export type Sloj = {
  id: SlojId;
  naziv: string;
  dubina: string;
  velikiBroj: string;
  h: number;
  strane: [string, string];
  naslov: string;
  tekst: string;
  link: { tekst: string; href: string } | null;
};

export const SLOJEVI: Sloj[] = [
  {
    id: 'lvt', naziv: 'LVT podna obloga', dubina: '0–2,3 mm', velikiBroj: '2,3 mm', h: 9, strane: ['#8A6238', '#A57849'],
    naslov: 'LVT u uzorku riblje kosti',
    tekst: 'Završni sloj, jedini koji se vidi. Lijepljena LVT obloga odlično radi s podnim grijanjem, ali uzorak riblje kosti traži iznimno ravnu podlogu jer se svaka neravnina ispod nje kasnije ocrta.',
    link: { tekst: 'LVT vinil podovi', href: '/usluge/lvt-vinil/' },
  },
  {
    id: 'ljepilo', naziv: 'Ljepilo', dubina: '2,3–3,3 mm', velikiBroj: '1 mm', h: 6, strane: ['#B5A684', '#CDBE9B'],
    naslov: 'Elastično ljepilo za LVT',
    tekst: 'Nanosi se nazubljenom gladilicom A2 ili B1. Prava količina ljepila znači da obloga ne odskače, spojevi ne pucaju i pod mirno podnosi promjene temperature.',
    link: { tekst: 'LVT vinil podovi', href: '/usluge/lvt-vinil/' },
  },
  {
    id: 'nivelir', naziv: 'Nivelir masa', dubina: '3,3–8,3 mm', velikiBroj: '5 mm', h: 12, strane: ['#A9A59E', '#C4C0B9'],
    naslov: 'Samorazlijevajuća masa za izravnavanje',
    tekst: 'Sloj u kojem se odlučuje kako će pod izgledati. Niveliramo UZIN masama, među ostalim NC 160 i NC 160 Si, do potpuno ravne i jednako upojne podloge spremne za lijepljenje.',
    link: { tekst: 'Priprema podloge', href: '/usluge/priprema-podloge/' },
  },
  {
    id: 'estrih', naziv: 'Estrih', dubina: '8,3–58 mm', velikiBroj: '5 cm', h: 34, strane: ['#77736C', '#8F8B84'],
    naslov: 'Cementni estrih',
    tekst: 'Prije polaganja mjerimo preostalu vlagu CM metodom. Cementni estrih se okvirno suši tjedan dana po centimetru debljine do 4 cm, a nakon toga znatno sporije. Iznad cijevi grijanja treba barem 3 cm estriha.',
    link: { tekst: 'Priprema podloge', href: '/usluge/priprema-podloge/' },
  },
  {
    id: 'grijanje', naziv: 'Podno grijanje', dubina: 'u estrihu', velikiBroj: 'u estrihu', h: 10, strane: ['#6E6A64', '#86827B'],
    naslov: 'Cijevi podnog grijanja',
    tekst: 'Cijevi su ugrađene u estrih. Kad je ispod poda grijanje, biramo obloge i ljepila koja podnose stalne promjene temperature, a estrih prije polaganja prolazi protokol grijanja.',
    link: { tekst: 'Koji pod za podno grijanje', href: '/savjeti/koji-pod-za-podno-grijanje/' },
  },
  {
    id: 'xps', naziv: 'Stirodur (XPS)', dubina: 'prema projektu', velikiBroj: 'XPS', h: 26, strane: ['#3F78A6', '#5590BE'],
    naslov: 'Toplinska izolacija',
    tekst: 'Ploče ekstrudiranog polistirena ispod estriha. Debljinu i vrstu određuje projekt zgrade.',
    link: null,
  },
  {
    id: 'beton', naziv: 'Betonska podloga', dubina: 'nosiva ploča', velikiBroj: 'beton', h: 40, strane: ['#5D5A55', '#76736D'],
    naslov: 'Nosiva konstrukcija',
    tekst: 'Armiranobetonska ploča na kojoj počiva cijeli sustav. Sve iznad nje mora biti izvedeno redom i u pravim debljinama.',
    link: null,
  },
];

const HRAST = ['#B88A57', '#A87B4A', '#C29563', '#9E7244', '#B4844F', '#C8A06E'];
const f = (n: number) => +n.toFixed(2);

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/**
 * Planke riblje kosti (L x w) na rešetki t1=(w,w), t2=(L,-L), zarotirane 45° oko središta,
 * samo one koje padaju u pravokutnik [0,width] x [0,height] (uz rub od L).
 */
function planke(width: number, height: number, w: number, L: number, seed: number): string {
  const rnd = rng(seed);
  const cx = width / 2, cy = height / 2;
  const cos = Math.SQRT1_2, sin = Math.SQRT1_2;
  const vidljiva = (x: number, y: number) => {
    const dx = x - cx, dy = y - cy;
    const rx = cx + dx * cos - dy * sin, ry = cy + dx * sin + dy * cos;
    return rx > -L && rx < width + L && ry > -L && ry < height + L;
  };
  const r = Math.hypot(width, height);
  const iMax = Math.ceil(r / w) + 2, jMax = Math.ceil(r / (2 * L)) + 2;
  const sw = f(w * 0.06);
  let out = '';
  for (let i = -iMax; i <= iMax; i++) {
    for (let j = -jMax; j <= jMax; j++) {
      const x = cx + i * w + j * L, y = cy + i * w - j * L;
      if (vidljiva(x + L / 2, y + w / 2)) {
        out += `<rect x="${f(x)}" y="${f(y)}" width="${f(L)}" height="${f(w)}" fill="${HRAST[Math.floor(rnd() * HRAST.length)]}"/>`;
      }
      const vx = x + L, vy = y - L + w;
      if (vidljiva(vx + w / 2, vy + L / 2)) {
        out += `<rect x="${f(vx)}" y="${f(vy)}" width="${f(w)}" height="${f(L)}" fill="${HRAST[Math.floor(rnd() * HRAST.length)]}"/>`;
      }
    }
  }
  return `<g transform="rotate(45 ${f(cx)} ${f(cy)})" stroke="#6E4B2A" stroke-width="${sw}">${out}</g>`;
}

export function ribljaKostSvg(opts: { width: number; height: number; w: number; L: number }): string {
  const { width, height, w, L } = opts;
  return (
    `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="LVT pod u uzorku riblje kosti">` +
    `<defs><linearGradient id="rk-svjetlo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>` +
    `<clipPath id="rk-clip"><rect width="${width}" height="${height}"/></clipPath></defs>` +
    `<g clip-path="url(#rk-clip)">${planke(width, height, w, L, 7)}</g>` +
    `<rect width="${width}" height="${height}" fill="url(#rk-svjetlo)"/></svg>`
  );
}

// ---------- Izometrijski presjek ----------
const CX = 310, R = 250, S = 100, DNO = 700;
const iso = (y: number) => `matrix(${R / S} ${R / (2 * S)} ${-R / S} ${R / (2 * S)} ${CX} ${f(y)})`;

function tockice(id: string, tile: number, n: number, boje: string[], rMin: number, rMax: number, seed: number, podloga: string) {
  const rnd = rng(seed);
  let c = '';
  for (let k = 0; k < n; k++) {
    c += `<circle cx="${f(rnd() * tile)}" cy="${f(rnd() * tile)}" r="${f(rMin + rnd() * (rMax - rMin))}" fill="${boje[Math.floor(rnd() * boje.length)]}"/>`;
  }
  return `<pattern id="${id}" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse"><rect width="${tile}" height="${tile}" fill="${podloga}"/>${c}</pattern>`;
}

function uzorci(): string {
  return (
    `<clipPath id="ps-unit"><rect width="${S}" height="${S}"/></clipPath>` +
    tockice('ps-estrih', 25, 22, ['#6F6B65', '#BDB9B2'], 0.3, 1.2, 3, '#A29E97') +
    tockice('ps-beton', 25, 22, ['#6F6B65', '#BDB9B2'], 0.3, 1.2, 5, '#8C8882') +
    tockice('ps-nivelir', 20, 8, ['#B9B5AE'], 0.35, 0.35, 9, '#CFCBC4') +
    tockice('ps-xps', 20, 6, ['#79B0D8'], 0.4, 0.4, 13, '#5E9DCB') +
    `<pattern id="ps-ljepilo" width="${S}" height="3.2" patternUnits="userSpaceOnUse"><rect width="${S}" height="3.2" fill="#DCCDA9"/><line x1="0" y1="1.6" x2="${S}" y2="1.6" stroke="#BBAA82" stroke-width="1.2"/></pattern>` +
    `<pattern id="ps-mreza" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#9C9891"/><path d="M10 0V10M0 10H10" stroke="#C0473A" stroke-width=".35" opacity=".7"/></pattern>`
  );
}

function gornjaPloha(s: Sloj, y: number): string {
  let sadrzaj: string;
  switch (s.id) {
    case 'lvt':
      sadrzaj = planke(S, S, 4.2, 16.8, 11);
      break;
    case 'grijanje': {
      let d = 'M 8 6';
      for (let k = 0; k < 6; k++) {
        const yy = 6 + k * 15;
        d += k % 2 === 0 ? ` L 88 ${yy} A 7.5 7.5 0 0 1 88 ${yy + 15}` : ` L 12 ${yy} A 7.5 7.5 0 0 0 12 ${yy + 15}`;
      }
      sadrzaj =
        `<rect width="${S}" height="${S}" fill="url(#ps-mreza)"/>` +
        `<path d="${d}" fill="none" stroke="#7A1F17" stroke-width="3.6" stroke-linecap="round"/>` +
        `<path d="${d}" fill="none" stroke="#D6372A" stroke-width="2.6" stroke-linecap="round"/>`;
      break;
    }
    default:
      sadrzaj = `<rect width="${S}" height="${S}" fill="url(#ps-${s.id})"/>`;
  }
  return (
    `<g transform="${iso(y)}"><g clip-path="url(#ps-unit)">${sadrzaj}</g>` +
    `<rect width="${S}" height="${S}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width=".4"/></g>`
  );
}

export function renderPresjekSvg(slojevi: Sloj[]): string {
  let y = DNO - R;
  let grupe = '';
  [...slojevi].reverse().forEach((s, i) => {
    y -= s.h;
    const h = s.h;
    grupe +=
      `<g class="layer" data-id="${s.id}" style="--i:${i}">` +
      `<polygon points="${CX - R},${f(y + R / 2)} ${CX},${f(y + R)} ${CX},${f(y + R + h)} ${CX - R},${f(y + R / 2 + h)}" fill="${s.strane[0]}"/>` +
      `<polygon points="${CX},${f(y + R)} ${CX + R},${f(y + R / 2)} ${CX + R},${f(y + R / 2 + h)} ${CX},${f(y + R + h)}" fill="${s.strane[1]}"/>` +
      gornjaPloha(s, y) +
      `</g>`;
  });
  const opis = 'Presjek poda: ' + slojevi.map((s) => s.naziv.toLowerCase()).join(', ');
  return `<svg viewBox="0 0 620 720" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${opis}"><defs>${uzorci()}</defs>${grupe}</svg>`;
}
