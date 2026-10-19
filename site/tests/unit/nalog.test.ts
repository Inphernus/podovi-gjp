import { describe, it, expect } from 'vitest';
import {
  STEPS,
  MAX_PRILOG_BYTES,
  visibleSteps,
  nextStep,
  prevStep,
  prefillFromQuery,
  validateStep,
  toFormData,
  nalogSummary,
  loadAnswers,
  saveAnswers,
  loadKorak,
  pocetniKorak,
} from '../../src/lib/nalog';

const datoteka = (ime: string, bajtova: number) => new File([new Uint8Array(bajtova)], ime);
const kontaktOk = { ime: 'Ana Horvat', email: 'ana@primjer.hr', telefon: '091 234 5678', privola: 'da' };

describe('koraci', () => {
  it('ima 8 koraka redom', () => {
    expect(STEPS.map((s) => s.id)).toEqual(['objekt', 'obloga', 'raspored', 'povrsina', 'podloga', 'tehnicki', 'lokacija', 'kontakt']);
  });

  it('raspored je vidljiv samo za LVT i laminat', () => {
    expect(visibleSteps({ obloga: 'lvt' })).toContain('raspored');
    expect(visibleSteps({ obloga: 'laminat' })).toContain('raspored');
    expect(visibleSteps({ obloga: 'pvc-rola' })).not.toContain('raspored');
    expect(visibleSteps({})).not.toContain('raspored');
  });

  it('nextStep i prevStep preskaču nevidljivi korak', () => {
    expect(nextStep('obloga', { obloga: 'epoksid' })).toBe('povrsina');
    expect(nextStep('obloga', { obloga: 'lvt' })).toBe('raspored');
    expect(nextStep('kontakt', {})).toBeNull();
    expect(prevStep('povrsina', { obloga: 'pvc-rola' })).toBe('obloga');
    expect(prevStep('objekt', {})).toBeNull();
  });
});

describe('prefillFromQuery', () => {
  it('prihvaća poznate vrijednosti', () => {
    expect(prefillFromQuery(new URLSearchParams('objekt=hotel&obloga=lvt'))).toEqual({ objekt: 'hotel', obloga: 'lvt' });
  });
  it('ignorira nepoznate i zlonamjerne vrijednosti', () => {
    expect(prefillFromQuery(new URLSearchParams('objekt=xyz&obloga=%3Cscript%3E'))).toEqual({});
  });
  it('ignorira nepoznate parametre', () => {
    expect(prefillFromQuery(new URLSearchParams('ime=Ana'))).toEqual({});
  });
});

describe('pocetniKorak', () => {
  it('kreće od prvog neodgovorenog vidljivog koraka', () => {
    expect(pocetniKorak({})).toBe('objekt');
    expect(pocetniKorak({ objekt: 'hotel', obloga: 'lvt' })).toBe('raspored');
    expect(pocetniKorak({ objekt: 'hotel', obloga: 'epoksid' })).toBe('povrsina');
  });
});

describe('validateStep', () => {
  it('kontakt bez podataka vraća sve poruke', () => {
    expect(validateStep('kontakt', {})).toEqual({
      ime: 'Upišite ime i prezime.',
      email: 'Upišite ispravnu e-mail adresu.',
      telefon: 'Upišite broj telefona, npr. 091 234 5678.',
      privola: 'Potrebna je privola za obradu podataka.',
    });
  });

  it('ispravan kontakt nema grešaka', () => {
    expect(validateStep('kontakt', kontaktOk)).toEqual({});
  });

  it('telefon prihvaća hrvatske formate', () => {
    for (const t of ['091 234 5678', '+385 91 234 5678', '01/2345-678', '(01) 2345 678']) {
      expect(validateStep('kontakt', { ...kontaktOk, telefon: t }).telefon, t).toBeUndefined();
    }
    expect(validateStep('kontakt', { ...kontaktOk, telefon: '12345' }).telefon).toBe('Upišite broj telefona, npr. 091 234 5678.');
  });

  it('telefon prihvaća strane brojeve i 00 oblik', () => {
    for (const t of ['00385 91 234 5678', '+386 40 123 456', '+49 151 23456789', '0043 664 1234567']) {
      expect(validateStep('kontakt', { ...kontaktOk, telefon: t }).telefon, t).toBeUndefined();
    }
    for (const t of ['0912', '+38', 'abc']) {
      expect(validateStep('kontakt', { ...kontaktOk, telefon: t }).telefon, t).toBeDefined();
    }
  });

  it('e-mail mora imati ispravan oblik', () => {
    expect(validateStep('kontakt', { ...kontaktOk, email: 'ana@' }).email).toBe('Upišite ispravnu e-mail adresu.');
  });

  it('korak s izborom traži odgovor', () => {
    expect(validateStep('objekt', {})).toEqual({ objekt: 'Odaberite jedan odgovor.' });
    expect(validateStep('objekt', { objekt: 'hotel' })).toEqual({});
  });

  it('lokacija traži grad ili mjesto', () => {
    expect(validateStep('lokacija', { kat: 'prizemlje', dizalo: 'da', pocetak: 'odmah' }).lokacija).toBe('Upišite grad ili mjesto.');
  });

  it('prilog veći od 8 MB je odbijen', () => {
    expect(validateStep('kontakt', kontaktOk, datoteka('troskovnik.pdf', MAX_PRILOG_BYTES + 1)).prilog).toBe(
      'Prilog je veći od 8 MB. Pošaljite manju datoteku ili nam je pošaljite e-mailom.',
    );
  });

  it('nepodržana vrsta priloga je odbijena', () => {
    expect(validateStep('kontakt', kontaktOk, datoteka('virus.exe', 10)).prilog).toBe(
      'Ovu vrstu datoteke ne možemo primiti. Pošaljite PDF, Excel, Word, DWG ili fotografiju.',
    );
  });

  it('podržan prilog prolazi', () => {
    expect(validateStep('kontakt', kontaktOk, datoteka('Troskovnik.XLSX', 1000))).toEqual({});
  });
});

describe('toFormData', () => {
  it('sadrži ime forme, odgovore i prilog', () => {
    const fd = toFormData({ objekt: 'hotel', obloga: 'lvt', raspored: 'riblja-kost', ...kontaktOk }, datoteka('t.pdf', 10));
    expect(fd.get('form-name')).toBe('radni-nalog');
    expect(fd.get('objekt')).toBe('hotel');
    expect(fd.get('raspored')).toBe('riblja-kost');
    expect(fd.get('email')).toBe('ana@primjer.hr');
    expect((fd.get('prilog') as File).name).toBe('t.pdf');
  });

  it('ne šalje odgovor iz nevidljivog koraka', () => {
    const fd = toFormData({ obloga: 'pvc-rola', raspored: 'riblja-kost' });
    expect(fd.get('raspored')).toBeNull();
  });
});

describe('nalogSummary', () => {
  it('pretvara vrijednosti u čitljive oznake', () => {
    expect(nalogSummary({ objekt: 'hotel', povrsina: '150-500' })).toEqual([
      { step: 'objekt', label: 'Objekt', value: 'Hotel, turistički ili ugostiteljski objekt' },
      { step: 'povrsina', label: 'Površina', value: '150 – 500 m²' },
    ]);
  });

  it('uključuje tekstualnu lokaciju, a ne kontakt podatke', () => {
    const s = nalogSummary({ lokacija: 'Split', ...kontaktOk });
    expect(s).toEqual([{ step: 'lokacija', label: 'Lokacija', value: 'Split' }]);
  });
});

describe('spremanje', () => {
  const memorija = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
  };
  const pokvaren = { getItem: () => { throw new Error('nema'); }, setItem: () => { throw new Error('nema'); } };

  it('sprema i vraća odgovore i korak', () => {
    const s = memorija();
    saveAnswers(s, { objekt: 'hotel' }, 'podloga');
    expect(loadAnswers(s)).toEqual({ objekt: 'hotel' });
    expect(loadKorak(s)).toBe('podloga');
  });

  it('bez storagea vraća prazno', () => {
    expect(loadAnswers(null)).toEqual({});
    expect(loadKorak(null)).toBeNull();
  });

  it('storage koji baca iznimku ne ruši formu', () => {
    expect(loadAnswers(pokvaren)).toEqual({});
    expect(() => saveAnswers(pokvaren, { objekt: 'hotel' }, 'objekt')).not.toThrow();
  });

  it('pokvaren JSON i nepoznata polja se odbacuju', () => {
    const s = memorija();
    s.setItem('gjp-radni-nalog', '{nije json');
    expect(loadAnswers(s)).toEqual({});
    s.setItem('gjp-radni-nalog', JSON.stringify({ a: { objekt: 'hotel', zlo: 'x' }, korak: 'nepostojeci' }));
    expect(loadAnswers(s)).toEqual({ objekt: 'hotel' });
    expect(loadKorak(s)).toBeNull();
  });
});
