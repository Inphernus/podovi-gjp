// Prilagođeno iz 21st.dev „Hover Expand Gallery” (@kedhareswer), izvornik u podovi-gjp/komponente-21st/.
// Izmjene: otvoreni panel nosi opis i pravi link na uslugu, aria-expanded umjesto aria-current,
// GJP tokeni i Archivo, širina otvorenog panela popunjava redak, neaktivni sadržaj nije fokusabilan.
import * as React from 'react';

export type GalerijaStavka = {
  naslov: string;
  opis: string;
  href: string;
  linkTekst: string;
  meta?: string;
  /** URL fotografije; bez nje se koristi `podloga` (CSS pozadina). */
  slika?: string;
  podloga: string;
};

type Props = {
  items: GalerijaStavka[];
  height?: string;
  railWidth?: number;
  mobileImageHeight?: number;
  duration?: number;
};

export default function HoverExpandGallery({
  items,
  height = '560px',
  railWidth = 76,
  mobileImageHeight = 260,
  duration = 620,
}: Props) {
  const [active, setActive] = React.useState(0);
  const uid = React.useId();

  const rootVars = {
    '--hx-h': height,
    '--hx-rail': `${railWidth}px`,
    '--hx-open': `calc(100% - ${(items.length - 1) * railWidth}px)`,
    '--hx-t': `${duration}ms`,
  } as React.CSSProperties;

  return (
    <div data-usluge-galerija style={rootVars} className="w-full lg:h-[var(--hx-h)]">
      <ul className="flex w-full flex-col lg:h-full lg:flex-row">
        {items.map((item, index) => {
          const isActive = index === active;
          const panelId = `${uid}-panel-${index}`;
          const panelVars = {
            '--hx-basis': isActive ? 'var(--hx-open)' : 'var(--hx-rail)',
            '--hx-img-h': isActive ? `${mobileImageHeight}px` : '0px',
          } as React.CSSProperties;

          return (
            <li
              key={item.href}
              data-panel
              style={panelVars}
              className="relative border-b border-border lg:h-full lg:min-w-0 lg:border-b-0 lg:border-l lg:last:border-r lg:[flex-basis:var(--hx-basis)] lg:[flex-grow:0] lg:[flex-shrink:0] lg:overflow-hidden lg:transition-[flex-basis] lg:duration-[var(--hx-t)] lg:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
            >
              <button
                type="button"
                aria-expanded={isActive}
                aria-controls={panelId}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') setActive(index);
                }}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
                className={`flex min-h-16 w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-5 text-left text-lg font-bold transition-colors duration-300 lg:absolute lg:inset-y-0 lg:left-0 lg:z-10 lg:h-full lg:w-[var(--hx-rail)] lg:flex-col-reverse lg:justify-between lg:px-0 lg:py-6 ${
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="lg:rotate-180 lg:whitespace-nowrap lg:[writing-mode:vertical-rl] [font-stretch:75%] text-xl lg:text-2xl">
                  {item.naslov}
                </span>
                <span
                  aria-hidden="true"
                  className={`text-sm font-medium lg:rotate-180 lg:whitespace-nowrap lg:[writing-mode:vertical-rl] transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {item.meta}
                </span>
              </button>

              <div
                id={panelId}
                aria-hidden={!isActive}
                className={`overflow-hidden transition-[height,opacity] duration-[var(--hx-t)] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none h-[var(--hx-img-h)] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[var(--hx-rail)] lg:h-auto ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="relative h-full w-full" style={{ background: item.podloga }}>
                  {item.slika ? (
                    <img src={item.slika} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                  ) : null}
                  <div className="absolute bottom-0 left-0 max-w-md bg-background p-5 text-foreground lg:p-7">
                    <p className="m-0 mb-3 text-base leading-relaxed">{item.opis}</p>
                    <a href={item.href} tabIndex={isActive ? 0 : -1} className="link">
                      {item.linkTekst}
                    </a>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
