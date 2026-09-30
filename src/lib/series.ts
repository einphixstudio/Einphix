import { getCollection } from 'astro:content';
import { compareWorks, type Work } from './works';

export interface SeriesEntry {
  slug: string;
  label: string;
}

// Series that already have their own hand-built page (different layout,
// hero copy, etc.) — excluded here so they don't also get a generic page.
const CUSTOM_SERIES_SLUGS = ['furry-force'];

// Same idea as Studies' medium pages: a series isn't a fixed list — it's
// whatever non-empty `series` values show up on works, so a new one in the
// CSV automatically gets its own page and dropdown entry, no code change
// needed, as long as it doesn't need special treatment like Furry Forces.
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(value: string): string {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

export async function getSeriesList(): Promise<SeriesEntry[]> {
  const works = await getCollection('works', ({ data }) => Boolean(data.series));
  const bySlug = new Map<string, string>();
  for (const w of works) {
    const slug = slugify(w.data.series!);
    if (!bySlug.has(slug)) bySlug.set(slug, w.data.series!);
  }
  return [...bySlug.entries()]
    .filter(([slug]) => !CUSTOM_SERIES_SLUGS.includes(slug))
    .map(([slug, raw]) => ({ slug, label: titleCase(raw) }));
}

export async function getWorksBySeriesSlug(slug: string): Promise<Work[]> {
  const works = await getCollection('works', ({ data }) => Boolean(data.series) && slugify(data.series!) === slug);
  return works.sort(compareWorks);
}
