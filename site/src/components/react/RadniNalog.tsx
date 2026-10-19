// Forma „Radni nalog” (specifikacija §8): jedno pitanje po ekranu, desno nalog koji se popunjava.
// Sva logika je u lib/nalog.ts; ovdje je samo stanje i prikaz.
import * as React from 'react';
import Choicebox from '../ui/choicebox';
import {
  STEPS, PRILOG_EXT, visibleSteps, nextStep, prevStep, prefillFromQuery, validateStep, toFormData, nalogSummary,
  loadAnswers, loadKorak, saveAnswers, pocetniKorak, type Answers, type StepId, type FieldName, type Polje,
} from '../../lib/nalog';

type Greske = Partial<Record<FieldName | 'prilog', string>>;
type Status = 'spremno' | 'saljem' | 'greska';

const storage = () => {
  try { return window.sessionStorage; } catch { return null; }
};

export default function RadniNalog({ telefon }: { telefon: string }) {
  const [a, setA] = React.useState<Answers>({});
  const [korak, setKorak] = React.useState<StepId>('objekt');
  const [greske, setGreske] = React.useState<Greske>({});
  const [prilog, setPrilog] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<Status>('spremno');
  const [povlacenje, setPovlacenje] = React.useState(false);
  const naslovRef = React.useRef<HTMLHeadingElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [ucitano, setUcitano] = React.useState(false);
  const fokusiraj = React.useRef(false);

  // Vraćanje spremljenog stanja i prefill iz URL-a (samo u pregledniku).
  // Prefill iz URL-a ima prednost: tada se kreće od prvog neodgovorenog koraka.
  React.useEffect(() => {
    const prefill = prefillFromQuery(new URLSearchParams(location.search));
    const pocetni = { ...loadAnswers(storage()), ...prefill };
    const spremljeniKorak = loadKorak(storage());
    const nastavi = Object.keys(prefill).length === 0 && spremljeniKorak && visibleSteps(pocetni).includes(spremljeniKorak);
    setA(pocetni);
    setKorak(nastavi ? spremljeniKorak : pocetniKorak(pocetni));
    setUcitano(true);
    // Island radi: makni rezervnu formu (inače bi se natpisi duplicirali) i javi stranici da je spreman
    document.querySelector('.nalog-fallback')?.remove();
    (window as unknown as { __gjpNalog?: boolean }).__gjpNalog = true;
  }, []);

  // Sinkrono nakon izmjene, da ni brzo osvježavanje ne izgubi zadnji odgovor
  React.useLayoutEffect(() => {
    if (ucitano) saveAnswers(storage(), a, korak);
  }, [ucitano, a, korak]);

  React.useEffect(() => {
    if (fokusiraj.current) naslovRef.current?.focus();
    fokusiraj.current = false;
  }, [korak]);

  const idiNa = (k: StepId | null) => {
    if (!k) return;
    fokusiraj.current = true;
    setGreske({});
    setKorak(k);
  };

  const def = STEPS.find((s) => s.id === korak)!;
  const vidljivi = visibleSteps(a);
  const redni = vidljivi.indexOf(korak) + 1;
  const jednoIzbor = def.polja.length === 1 && def.polja[0].tip === 'izbor';

  // potvrdi = false kad se odabir pomiče strelicama: tada se ne prelazi na sljedeći korak
  const postavi = (name: FieldName, v: string, potvrdi = true) => {
    const nove = { ...a, [name]: v };
    setA(nove);
    setGreske((g) => ({ ...g, [name]: undefined }));
    if (jednoIzbor && potvrdi) idiNa(nextStep(korak, nove));
  };

  // Greške se prikazuju uz polja, a fokus ide na prvo neispravno polje (redom kao u koraku)
  const prikaziGreske = (g: Greske) => {
    setGreske(g);
    const prvo = [...def.polja.map((p) => p.name), 'prilog'].find((n) => g[n as FieldName | 'prilog']);
    if (!prvo) return;
    requestAnimationFrame(() => {
      const el =
        document.getElementById(`nalog-${prvo}`) ??
        document.querySelector<HTMLElement>(`[aria-labelledby="nalog-${prvo}-label"] [tabindex="0"]`);
      el?.focus();
    });
  };

  const dalje = () => {
    const g = validateStep(korak, a);
    if (Object.keys(g).length) return prikaziGreske(g);
    idiNa(nextStep(korak, a));
  };

  const posalji = async (e: React.FormEvent) => {
    e.preventDefault();
    const g = validateStep('kontakt', a, prilog);
    if (Object.keys(g).length) return prikaziGreske(g);
    for (const id of vidljivi) {
      if (Object.keys(validateStep(id, a)).length) return idiNa(id);
    }
    setStatus('saljem');
    try {
      const odgovor = await fetch('/', { method: 'POST', body: toFormData(a, prilog) });
      if (!odgovor.ok) throw new Error(String(odgovor.status));
      saveAnswers(storage(), {});
      location.assign(`/hvala/?objekt=${encodeURIComponent(a.objekt ?? '')}`);
    } catch {
      setStatus('greska');
    }
  };

  const odaberiDatoteku = (f: File | null | undefined) => {
    setPrilog(f ?? null);
    setGreske((g) => ({ ...g, prilog: undefined }));
  };

  const polje = (p: Polje) => {
    const id = `nalog-${p.name}`;
    const greska = greske[p.name];
    if (p.tip === 'izbor') {
      return (
        <Choicebox key={p.name} id={id} label={p.label} opcije={p.opcije!} value={a[p.name]} greska={greska}
          vidljivLabel={!jednoIzbor} onChange={(v, potvrdi) => postavi(p.name, v, potvrdi)} />
      );
    }
    if (p.tip === 'checkbox') {
      return (
        <div key={p.name} className="mb-5">
          <label className="flex min-h-11 cursor-pointer items-start gap-3">
            <input id={id} type="checkbox" className="mt-1 size-5 accent-[var(--hrast)]" checked={a[p.name] === 'da'}
              aria-invalid={greska ? true : undefined} aria-describedby={greska ? `${id}-greska` : undefined}
              onChange={(e) => postavi(p.name, e.currentTarget.checked ? 'da' : '')} />
            <span>
              {p.label} <a className="link" href="/politika-privatnosti/" target="_blank">Politika privatnosti</a>
            </span>
          </label>
          {greska ? <p id={`${id}-greska`} className="mt-1 font-semibold text-[#9B2C1F]">{greska}</p> : null}
        </div>
      );
    }
    const zajednicko = {
      id, name: p.name, value: a[p.name] ?? '', autoComplete: p.autocomplete,
      'aria-invalid': greska ? true : undefined, 'aria-describedby': greska ? `${id}-greska` : undefined,
      className: 'mt-1 block w-full rounded-[2px] border-2 border-border bg-background px-3 py-3 text-base focus:border-foreground',
      onInput: (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => postavi(p.name, e.currentTarget.value),
    };
    return (
      <div key={p.name} className="mb-5">
        <label htmlFor={id} className="font-semibold">{p.label}</label>
        {p.tip === 'textarea' ? (
          <textarea rows={4} {...zajednicko} />
        ) : (
          p.tip === 'email' ? <input type="email" spellcheck={false} {...zajednicko} />
          : p.tip === 'tel' ? <input type="tel" inputMode="tel" {...zajednicko} />
          : <input type="text" {...zajednicko} />
        )}
        {greska ? <p id={`${id}-greska`} className="mt-1 font-semibold text-[#9B2C1F]">{greska}</p> : null}
      </div>
    );
  };

  const sazetak = nalogSummary(a);

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <form className="lg:col-span-7" onSubmit={posalji} noValidate>
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-muted-foreground">Korak {redni} od {vidljivi.length}</p>
          <div className="h-1 w-full bg-border" aria-hidden="true">
            <div className="h-1 origin-left bg-primary transition-transform duration-300" style={{ transform: `scaleX(${redni / vidljivi.length})` }} />
          </div>
        </div>

        <div key={korak} className="nalog-korak">
          <h2 ref={naslovRef} tabIndex={-1} className="mb-5 text-[clamp(1.9rem,4vw,2.8rem)] outline-none">{def.pitanje}</h2>
          {def.napomena ? <p className="mb-5 max-w-[40em] border-l-2 border-primary pl-4 text-muted-foreground">{def.napomena}</p> : null}
          {def.polja.map(polje)}

          {korak === 'kontakt' ? (
            <div className="mb-6">
              <label htmlFor="nalog-prilog" className="font-semibold">Priložite troškovnik, nacrt ili fotografije (neobavezno)</label>
              <div
                className={`mt-1 flex flex-wrap items-center gap-3 rounded-[2px] border-2 border-dashed px-4 py-5 ${povlacenje ? 'border-primary bg-primary/10' : 'border-border'}`}
                onDragOver={(e) => { e.preventDefault(); setPovlacenje(true); }}
                onDragLeave={() => setPovlacenje(false)}
                onDrop={(e) => { e.preventDefault(); setPovlacenje(false); odaberiDatoteku(e.dataTransfer?.files[0]); }}
              >
                <input ref={fileRef} id="nalog-prilog" type="file" className="sr-only" tabIndex={-1} accept={PRILOG_EXT.map((x) => `.${x}`).join(',')}
                  aria-describedby={greske.prilog ? 'nalog-prilog-greska' : 'nalog-prilog-pomoc'}
                  onChange={(e) => odaberiDatoteku(e.currentTarget.files?.[0])} />
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>Odaberi datoteku</button>
                <span id="nalog-prilog-pomoc" className="text-sm text-muted-foreground">
                  {prilog ? prilog.name : 'ili je povucite ovdje. PDF, Excel, Word, DWG ili fotografija, do 8 MB.'}
                </span>
                {prilog ? (
                  <button type="button" className="link text-sm" onClick={() => { odaberiDatoteku(null); if (fileRef.current) fileRef.current.value = ''; }}>Ukloni</button>
                ) : null}
              </div>
              {greske.prilog ? <p id="nalog-prilog-greska" className="mt-1 font-semibold text-[#9B2C1F]">{greske.prilog}</p> : null}
            </div>
          ) : null}
        </div>

        {status === 'greska' ? (
          <p role="alert" className="mb-4 border-l-4 border-[#9B2C1F] bg-background px-4 py-3 font-semibold">
            Slanje nije uspjelo. Provjerite vezu i pokušajte ponovno ili nas nazovite na {telefon}.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {prevStep(korak, a) ? (
            <button type="button" className="btn btn-secondary" onClick={() => idiNa(prevStep(korak, a))}>Natrag</button>
          ) : null}
          {korak === 'kontakt' ? (
            <button type="submit" className="btn btn-primary" disabled={status === 'saljem'} aria-busy={status === 'saljem'}>
              {status === 'saljem' ? 'Šaljem…' : 'Pošalji radni nalog'}
            </button>
          ) : !jednoIzbor ? (
            <button type="button" className="btn btn-primary" onClick={dalje}>Dalje</button>
          ) : null}
        </div>
      </form>

      <aside aria-label="Radni nalog" className="nalog-aside lg:col-span-5">
        <div className="lg:sticky lg:top-6 border-2 border-foreground bg-background p-5">
          <h2 className="mb-3 text-2xl">Radni nalog</h2>
          {sazetak.length === 0 ? (
            <p className="text-muted-foreground">Odgovori se ovdje upisuju kako ih unosite.</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {sazetak.map((s) => (
                <li key={s.label} className="border-t border-border first:border-t-0">
                  <button type="button" onClick={() => idiNa(s.step)}
                    className="grid w-full cursor-pointer grid-cols-[8.5rem_1fr] gap-3 bg-transparent py-2 text-left hover:underline">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
