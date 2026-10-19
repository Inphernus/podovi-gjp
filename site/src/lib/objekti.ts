// Tipovi objekta (korak 1 forme, traka na naslovnoj, filter referenci). Vrijednosti = TIPOVI_OBJEKTA u content.config.ts.
export const OBJEKTI = [
  { value: 'ured', label: 'Poslovni prostor / ured', kratko: 'Uredi i poslovni prostori' },
  { value: 'zdravstvo', label: 'Zdravstvena ustanova', kratko: 'Bolnice i ambulante' },
  { value: 'obrazovanje', label: 'Škola, vrtić ili obrazovna ustanova', kratko: 'Škole i vrtići' },
  { value: 'hotel', label: 'Hotel, turistički ili ugostiteljski objekt', kratko: 'Hoteli i ugostiteljstvo' },
  { value: 'sport', label: 'Sportski objekt', kratko: 'Dvorane i teretane' },
  { value: 'industrija', label: 'Industrijski ili skladišni prostor', kratko: 'Industrija i skladišta' },
  { value: 'trgovina', label: 'Trgovina ili retail', kratko: 'Trgovine i showroomi' },
  { value: 'stambeni', label: 'Stambeni prostor', kratko: 'Stanovi i kuće' },
] as const;

export type ObjektValue = (typeof OBJEKTI)[number]['value'];
