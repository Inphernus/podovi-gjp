import { getCollection, type CollectionEntry } from 'astro:content';
import { filtrirajReference, type ReferencaFilter } from './reference-filter';

// Draft reference (primjeri dok kum ne pošalje podatke) vide se samo uz PUBLIC_DRAFTOVI=1.
const DRAFTOVI = import.meta.env.PUBLIC_DRAFTOVI === '1';

export async function getReference(filter: ReferencaFilter = {}): Promise<CollectionEntry<'reference'>[]> {
  return filtrirajReference(await getCollection('reference'), filter, DRAFTOVI);
}
