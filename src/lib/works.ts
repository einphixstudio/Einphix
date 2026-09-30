import { getCollection, type CollectionEntry } from 'astro:content';

export type Work = CollectionEntry<'works'>;

export async function getFeaturedWorks(): Promise<Work[]> {
  const works = await getCollection('works', ({ data }) => data.featured);
  return works.sort((a, b) => (a.data.featuredOrder ?? 0) - (b.data.featuredOrder ?? 0));
}

// A manually set `order` acts as a pin: it always outranks anything without
// one, and two pinned works compare by that number. Everything unpinned
// falls back to year, newest first — the previous default behavior.
//
// `kindContext` is the page family being sorted for (e.g. 'work' for a
// Work-year page, 'study' for a Studies page). A piece showing up there via
// `kind2` (rather than its primary `kind`) is pinned by `kind2Order`
// instead of `order` — its place on that page is independent of its place
// on its primary one.
export function compareWorks(a: Work, b: Work, kindContext?: Work['data']['kind']): number {
  const orderOf = (w: Work) =>
    kindContext && w.data.kind !== kindContext && w.data.kind2 === kindContext
      ? w.data.kind2Order
      : w.data.order;
  const aOrder = orderOf(a);
  const bOrder = orderOf(b);
  if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
  if (aOrder !== undefined) return -1;
  if (bOrder !== undefined) return 1;
  return b.data.year - a.data.year;
}

// Dimensions are always inches; the artist just types the numbers ("14x14",
// "7.5 x 9.5", "35 x 24 in" — anything with two numbers around an x/×) and
// this normalizes it to one consistent "W x H in" for display.
export function formatDimensions(raw: string): string {
  const match = raw.match(/([\d.]+)\s*[x×]\s*([\d.]+)/i);
  if (!match) return raw;
  const [, w, h] = match;
  return `${w} x ${h} in`;
}

// "Oil on canvas" — except a sketchbook is something you paint *in*, not
// *on*, so that one surface gets its own preposition. surface is optional
// (e.g. digital work has none), in which case it's just the medium alone.
export function formatMediumSurface(medium: string, surface?: string): string {
  if (!surface) return medium;
  const preposition = surface.trim().toLowerCase() === 'sketchbook' ? 'in' : 'on';
  return `${medium} ${preposition} ${surface}`;
}

export function captionLine2(work: Work): string {
  const { year, medium, surface, dimensions } = work.data;
  return `${year}, ${formatMediumSurface(medium, surface)}, ${formatDimensions(dimensions)}`;
}

export async function getWorksBySeries(seriesName: string): Promise<Work[]> {
  const works = await getCollection(
    'works',
    ({ data }) => data.series?.toLowerCase() === seriesName.toLowerCase(),
  );
  return works.sort(compareWorks);
}
