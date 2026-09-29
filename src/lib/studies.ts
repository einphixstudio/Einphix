import { getCollection } from 'astro:content';
import { formatDimensions, type Work } from './works';

export interface StudyMedium {
  slug: string;
  label: string;
}

// Categories aren't a fixed list like the Work year buckets — they're
// whatever `medium` values actually show up on study-kind works, so a new
// medium in the CSV automatically gets its own page and dropdown entry.
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getStudies(): Promise<Work[]> {
  const studies = await getCollection('works', ({ data }) => data.kind === 'study');
  return studies.sort((a, b) => {
    if (b.data.year !== a.data.year) return b.data.year - a.data.year;
    return (a.data.order ?? 0) - (b.data.order ?? 0);
  });
}

export async function getStudyMedia(): Promise<StudyMedium[]> {
  const studies = await getStudies();
  const bySlug = new Map<string, string>();
  for (const s of studies) {
    const slug = slugify(s.data.medium);
    if (!bySlug.has(slug)) bySlug.set(slug, s.data.medium);
  }
  return [...bySlug.entries()].map(([slug, label]) => ({ slug, label }));
}

export async function getStudiesByMediumSlug(slug: string): Promise<Work[]> {
  const studies = await getStudies();
  return studies.filter((s) => slugify(s.data.medium) === slug);
}

export function studyCaption(work: Work): string {
  const { medium, dimensions, year } = work.data;
  const capitalizedMedium = medium.charAt(0).toUpperCase() + medium.slice(1);
  return `${capitalizedMedium}, ${formatDimensions(dimensions)}, ${year}.`;
}
