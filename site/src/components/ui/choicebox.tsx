// 21st.dev „Choicebox” (@halaska-studio) — izvornik u podovi-gjp/komponente-21st/.
// Prenesen doslovno: isti stilovi (zaobljene kartice u stupcu, suptilna podloga, odabrano = tinta + tanki obrub akcenta,
// kružić 16 px, naslov 14 px medium, opis 12 px), iste tranzicije.
// `kit-theme` nije stigao s preuzimanjem, pa su njegove vrijednosti (Geist ljestvica) definirane ovdje; akcent = hrast.
// Funkcionalne razlike: samo jedan odabir (radiogroup), navigacija strelicama (roving tabindex) i poruka greške.
import * as React from 'react';

const tokens = {
  radius: { md: 12 },
  weight: { medium: 500 },
  type: {
    sm: { fontSize: 14, lineHeight: '20px' },
    xs: { fontSize: 12, lineHeight: '16px' },
  },
};
const motion = { normal: '150ms', smooth: '200ms', easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', easeOut: 'cubic-bezier(0, 0, 0.2, 1)' };
const interactiveBase: React.CSSProperties = { cursor: 'pointer', font: 'inherit', outlineOffset: 2, width: '100%' };
const pal = {
  accent: 'var(--hrast)',
  accentBg: 'rgb(168 116 63 / 0.10)',
  bgSubtle: 'rgb(0 0 0 / 0.05)',
  text: 'var(--crna)',
  textSecondary: 'var(--muted-foreground)',
  textMuted: 'var(--nivelir)',
};

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
    <div data-21st style={{ marginBottom: 24 }}>
      <p id={`${id}-label`} className={vidljivLabel ? 'mb-3 text-lg font-bold' : 'sr-only'}>{label}</p>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-describedby={greska ? `${id}-greska` : undefined}
        aria-invalid={greska ? true : undefined}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {opcije.map((opt, i) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={i === fokusIndex ? 0 : -1}
              onClick={() => onChange(opt.value, true)}
              onKeyDown={(e) => onKeyDown(e, i)}
              style={{
                ...interactiveBase,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: tokens.radius.md,
                textAlign: 'left',
                background: selected ? pal.accentBg : pal.bgSubtle,
                border: `1px solid ${selected ? pal.accent : 'transparent'}`,
                transition: `all ${motion.normal} ${motion.easeInOut}`,
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  flexShrink: 0,
                  marginTop: 1,
                  border: `1.5px solid ${selected ? pal.accent : pal.textMuted}`,
                  background: selected ? pal.accent : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: `all ${motion.normal} ${motion.easeInOut}`,
                }}
              >
                {selected && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      background: '#fff',
                      animation: `halaska-scale-in 0.2s ${motion.easeOut} both`,
                    }}
                  />
                )}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    ...tokens.type.sm,
                    fontWeight: tokens.weight.medium,
                    color: pal.text,
                    display: 'block',
                    transition: `color ${motion.smooth} ${motion.easeInOut}`,
                  }}
                >
                  {opt.label}
                </span>
                {opt.opis && (
                  <span
                    style={{
                      ...tokens.type.xs,
                      color: pal.textSecondary,
                      display: 'block',
                      marginTop: 2,
                      lineHeight: 1.5,
                      transition: `color ${motion.smooth} ${motion.easeInOut}`,
                    }}
                  >
                    {opt.opis}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      {greska ? (
        <p id={`${id}-greska`} className="mt-2 font-semibold text-[#9B2C1F]">{greska}</p>
      ) : null}
      <style>{'@keyframes halaska-scale-in { from { transform: scale(0); } to { transform: scale(1); } }'}</style>
    </div>
  );
}
