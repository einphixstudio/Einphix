import { getCollection, type CollectionEntry } from 'astro:content';

export type Work = CollectionEntry<'works'>;

export async function getFeaturedWorks(): Promise<Work[]> {
  const works = await getCollection('works', ({ data }) => data.featured);
  return works.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
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

export function captionLine2(work: Work): string {
  const { year, medium, dimensions } = work.data;
  return `${year}, ${medium}, ${formatDimensions(dimensions)}`;
}
