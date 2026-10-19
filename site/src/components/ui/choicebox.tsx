// Prilagođeno iz 21st.dev „Choicebox” (@halaska-studio), izvornik u podovi-gjp/komponente-21st/.
// Izmjene: kit-theme zamijenjen GJP tokenima (Tailwind), samo jedan odabir (radiogroup),
// navigacija strelicama s „roving tabindex”, poruka greške povezana s grupom.
import * as React from 'react';

export type ChoiceOpcija = { value: string; label: string; opis?: string };

type Props = {
  id: string;
  label: string;
  opcije: readonly ChoiceOpcija[];
  value?: string;
  /** potvrdi = true za klik/Enter/razmaknicu; false za strelice (samo pomicanje odabira, bez prelaska dalje). */
  onChange: (value: string, potvrdi: boolean) => void;
  greska?: string;
  /** Prikazati label grupe kao vidljivi podnaslov (višepoljni koraci). */
  vidljivLabel?: boolean;
};

export default function Choicebox({ id, label, opcije, value, onChange, greska, vidljivLabel = false }: Props) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const odabraniIndex = opcije.findIndex((o) => o.value === value);
  const fokusIndex = odabraniIndex >= 0 ? odabraniIndex : 0;

  const pomakni = (i: number) => {
    const n = (i + opcije.length) % opcije.length;
    refs.current[n]?.focus();
    onChange(opcije[n].value, false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); pomakni(i + 1); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); pomakni(i - 1); }
  };

  return (
    <div className="mb-6">
      <p id={`${id}-label`} className={vidljivLabel ? 'mb-3 text-lg font-bold' : 'sr-only'}>{label}</p>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-describedby={greska ? `${id}-greska` : undefined}
        aria-invalid={greska ? true : undefined}
        className="grid gap-2 sm:grid-cols-2"
      >
        {opcije.map((o, i) => {
          const odabran = o.value === value;
          return (
            <button
              key={o.value}
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={odabran}
              tabIndex={i === fokusIndex ? 0 : -1}
              onClick={() => onChange(o.value, true)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`flex min-h-14 w-full cursor-pointer items-start gap-3 rounded-[2px] border-2 px-4 py-3 text-left transition-colors duration-200 ${
                odabran ? 'border-primary bg-primary/15' : 'border-border bg-background hover:border-foreground'
              }`}
            >
              <span
                aria-hidden="true"
                className={`mt-1 flex size-4 flex-none items-center justify-center rounded-full border-2 ${
                  odabran ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`}
              >
                {odabran ? <span className="size-1.5 rounded-full bg-background" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{o.label}</span>
                {o.opis ? <span className="mt-0.5 block text-sm text-muted-foreground">{o.opis}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
      {greska ? (
        <p id={`${id}-greska`} className="mt-2 font-semibold text-[#9B2C1F]">{greska}</p>
      ) : null}
    </div>
  );
}
