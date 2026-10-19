import { describe, it, expect } from 'vitest';
import { SLOJEVI, renderPresjekSvg, ribljaKostSvg } from '../../src/lib/presjek';

describe('presjek', () => {
  it('ima 7 slojeva odozgo prema dolje', () => {
    expect(SLOJEVI.map((s) => s.id)).toEqual(['lvt', 'ljepilo', 'nivelir', 'estrih', 'grijanje', 'xps', 'beton']);
  });

  it('svg ima jednu grupu .layer po sloju s data-id', () => {
    const svg = renderPresjekSvg(SLOJEVI);
    expect(svg.match(/class="layer"/g)).toHaveLength(7);
    for (const s of SLOJEVI) expect(svg).toContain(`data-id="${s.id}"`);
  });

  it('crtež je deterministički', () => {
    expect(renderPresjekSvg(SLOJEVI)).toBe(renderPresjekSvg(SLOJEVI));
    expect(ribljaKostSvg({ width: 400, height: 500, w: 22, L: 88 })).toBe(ribljaKostSvg({ width: 400, height: 500, w: 22, L: 88 }));
  });

  it('linkovi slojeva vode na postojeće rute usluga ili savjeta', () => {
    const linkovi = SLOJEVI.flatMap((s) => (s.link ? [s.link.href] : []));
    expect(linkovi).toContain('/usluge/priprema-podloge/');
    expect(linkovi).toContain('/usluge/lvt-vinil/');
    expect(linkovi).toContain('/savjeti/koji-pod-za-podno-grijanje/');
    for (const l of linkovi) expect(l).toMatch(/^\/(usluge|savjeti)\/[a-z-]+\/$/);
  });
});
