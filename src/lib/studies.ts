import { getCollection } from 'astro:content';
import { compareWorks, type Work } from './works';

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
  const studies = await getCollection('works', ({ data }) => data.kind === 'study' || data.kind2 === 'study');
  return studies.sort((a, b) => compareWorks(a, b, 'study'));
}

// Default order (when a medium has no row in order.csv): most recently
// painted medium first — the original automatic behavior, kept as a
// fallback so a brand-new medium always gets a sensible spot without
// needing a CSV edit first.
export async function getStudyMedia(): Promise<StudyMedium[]> {
  const studies = await getStudies();
  const bySlug = new Map<string, string>();
  for (const s of studies) {
    const slug = slugify(s.data.medium);
    if (!bySlug.has(slug)) bySlug.set(slug, s.data.medium);
  }
  const media = [...bySlug.entries()].map(([slug, label], i) => ({ slug, label, autoOrder: i }));

  const orderRows = await getCollection('studyMediaOrder');
  const orderBySlug = new Map(orderRows.map((r) => [r.id, r.data.order]));

  return media
    .sort((a, b) => {
      const aOrder = orderBySlug.get(a.slug);
      const bOrder = orderBySlug.get(b.slug);
      if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
      if (aOrder !== undefined) return -1;
      if (bOrder !== undefined) return 1;
      return a.autoOrder - b.autoOrder;
    })
    .map(({ slug, label }) => ({ slug, label }));
}

export async function getStudiesByMediumSlug(slug: string): Promise<Work[]> {
  const studies = await getStudies();
  return studies.filter((s) => slugify(s.data.medium) === slug);
}
