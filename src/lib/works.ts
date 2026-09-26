import { getCollection, type CollectionEntry } from 'astro:content';

export type Work = CollectionEntry<'works'>;

export async function getFeaturedWorks(): Promise<Work[]> {
  const works = await getCollection('works', ({ data }) => data.featured);
  return works.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
}

export function captionLine2(work: Work): string {
  const { year, medium, dimensionsImperial, dimensionsMetric } = work.data;
  return `${year}, ${medium}, ${dimensionsImperial} / ${dimensionsMetric}`;
}
