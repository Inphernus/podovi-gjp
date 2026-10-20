// 21st.dev „Hover Expand Gallery” (@kedhareswer) — izvornik u podovi-gjp/komponente-21st/.
// Prenesen doslovno (iste Tailwind klase, rail širina 64, otvoreni panel do 520 px, zaobljena slika, sitni okomiti natpisi).
// Jedine razlike: otvorena slika je link na uslugu (href, nevidljivi opis za čitače ekrana i tražilice),
// aria-expanded umjesto aria-current, visina zadana prop-om, i data-* oznake za testove.
import * as React from 'react';

export type HoverExpandItem = {
  /** The label. Rotated into the rail on desktop, a plain row on mobile. */
  title: string;
  /** Secondary label — a year, a role, a client. Only shown on the open panel. */
  meta?: string;
  /** Image URL. Panels without one fall back to `accent`. */
  src?: string;
  alt?: string;
  /** Any CSS background. Used when `src` is absent, and behind it while it decodes. */
  accent?: string;
  /** Kamo vodi otvorena slika (stranica usluge). */
  href: string;
  /** Kratki opis usluge — samo za čitače ekrana i tražilice, vizualno skriven. */
  opis?: string;
};

export type HoverExpandGalleryProps = {
  items: HoverExpandItem[];
  height?: string;
  railWidth?: number;
  maxOpenWidth?: number;
  mobileImageHeight?: number;
  defaultIndex?: number;
  duration?: number;
  onChange?: (index: number, item: HoverExpandItem) => void;
  className?: string;
};

export default function HoverExpandGallery({
  items,
  height = '100svh',
  railWidth = 64,
  maxOpenWidth = 520,
  mobileImageHeight = 420,
  defaultIndex = 0,
  duration = 620,
  onChange,
  className = '',
}: HoverExpandGalleryProps) {
  const [active, setActive] = React.useState(defaultIndex);

  const open = (index: number) => {
    if (index === active) return;
    setActive(index);
    onChange?.(index, items[index]);
  };

  const rootVars = {
    '--hx-h': height,
    '--hx-rail': `${railWidth}px`,
    '--hx-max': `${maxOpenWidth}px`,
    '--hx-t': `${duration}ms`,
  } as React.CSSProperties;

  return (
    <section
      data-usluge-galerija
      data-21st
      style={rootVars}
      className={`relative w-full bg-background text-foreground lg:h-[var(--hx-h)] lg:overflow-hidden ${className}`}
    >
      <ul className="flex w-full flex-col lg:h-full lg:flex-row lg:justify-center">
        {items.map((item, index) => {
          const isActive = index === active;
          const panelVars = {
            '--hx-basis': isActive ? 'var(--hx-max)' : 'var(--hx-rail)',
            '--hx-img-h': isActive ? `${mobileImageHeight}px` : '0px',
            '--hx-img-o': isActive ? 1 : 0,
          } as React.CSSProperties;

          return (
            <li
              key={`${item.title}-${index}`}
              data-panel
              style={panelVars}
              className="relative border-b border-border last:border-b-0 lg:h-full lg:min-w-0 lg:border-b-0 lg:border-l lg:last:border-r lg:[flex-basis:var(--hx-basis)] lg:[flex-grow:0] lg:[flex-shrink:1] lg:transition-[flex-basis] lg:duration-[var(--hx-t)] lg:ease-[cubic-bezier(0.32,0.72,0,1)] lg:motion-reduce:transition-none"
            >
              {/* Image. In flow below 1024px (its height animates); pinned next to the rail above it. Link na uslugu. */}
              <a
                href={item.href}
                tabIndex={isActive ? 0 : -1}
                aria-hidden={!isActive}
                style={{ background: item.accent, opacity: 'var(--hx-img-o)' }}
                className="block h-[var(--hx-img-h)] w-full overflow-hidden transition-[height,opacity] duration-[var(--hx-t)] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none lg:absolute lg:inset-y-2 lg:left-[var(--hx-rail)] lg:right-3 lg:h-auto lg:w-auto lg:rounded-[10px] lg:transition-opacity"
              >
                {item.src ? (
                  <img
                    src={item.src}
                    alt={item.alt ?? item.title}
                    draggable={false}
                    style={{ maxWidth: 'none' }}
                    className="block h-full w-full object-cover"
                  />
                ) : null}
                <span className="sr-only">
                  {item.title}
                  {item.opis ? `: ${item.opis}` : ''}
                </span>
              </a>

              <button
                type="button"
                aria-expanded={isActive}
                aria-label={item.title}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') open(index);
                }}
                onFocus={() => open(index)}
                onClick={() => open(index)}
                className="group relative block w-full cursor-pointer border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40 lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-[var(--hx-rail)] lg:overflow-hidden"
              >
                {/* Label. A row below 1024px; above it a rail down the left of the panel. */}
                <span
                  className={`flex h-16 w-full items-center justify-between gap-3 overflow-hidden px-5 text-[14px] tracking-tight transition-colors duration-[var(--hx-t)] ease-out motion-reduce:transition-none lg:h-full lg:w-[var(--hx-rail)] lg:flex-col-reverse lg:justify-between lg:px-0 lg:py-5 ${
                    isActive ? 'text-foreground' : 'text-foreground/40'
                  }`}
                >
                  <span className="truncate lg:overflow-hidden lg:rotate-180 lg:whitespace-nowrap lg:[writing-mode:vertical-rl]">
                    {item.title}
                  </span>
                  <span
                    style={{ opacity: isActive && item.meta ? 1 : 0 }}
                    className="shrink-0 text-[13px] font-medium transition-opacity duration-[var(--hx-t)] ease-out motion-reduce:transition-none lg:rotate-180 lg:whitespace-nowrap lg:[writing-mode:vertical-rl]"
                  >
                    {item.meta}
                  </span>
                </span>
              </button>

            </li>
          );
        })}
      </ul>
    </section>
  );
}
