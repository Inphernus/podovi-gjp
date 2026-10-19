// Vrste obloge (korak 2 forme) i veza stranice usluge → unaprijed odabrana obloga u formi.
export const OBLOGE = [
  { value: 'pvc-rola', label: 'PVC / vinil u roli' },
  { value: 'lvt', label: 'LVT vinil ploče i daske' },
  { value: 'linoleum', label: 'Linoleum' },
  { value: 'tepih-ploce', label: 'Tepih ploče' },
  { value: 'tepih-rola', label: 'Tepih u roli' },
  { value: 'guma', label: 'Gumeni pod' },
  { value: 'laminat', label: 'Laminat' },
  { value: 'epoksid', label: 'Epoksidni pod' },
  { value: 'dupli-pod', label: 'Dupli / kompjuterski pod' },
  { value: 'samo-priprema', label: 'Samo priprema podloge, niveliranje i brušenje' },
  { value: 'ne-znam', label: 'Nisam siguran, trebam savjet' },
] as const;

export type OblogaValue = (typeof OBLOGE)[number]['value'];

export const USLUGA_U_OBLOGU: Partial<Record<string, OblogaValue>> = {
  'pvc-podovi': 'pvc-rola',
  'lvt-vinil': 'lvt',
  linoleum: 'linoleum',
  'tepih-ploce': 'tepih-ploce',
  'tepih-u-roli': 'tepih-rola',
  'tepih-na-gripere': 'tepih-rola',
  'gumeni-podovi': 'guma',
  laminat: 'laminat',
  'epoksidni-podovi': 'epoksid',
  'dupli-podovi': 'dupli-pod',
  'priprema-podloge': 'samo-priprema',
};

export const ponudaHref = (uslugaSlug: string) => {
  const o = USLUGA_U_OBLOGU[uslugaSlug];
  return o ? `/zatrazi-ponudu/?obloga=${o}` : '/zatrazi-ponudu/';
};
