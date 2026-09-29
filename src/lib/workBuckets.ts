import { getCollection } from 'astro:content';
import { compareWorks, formatDimensions, type Work } from './works';

export interface YearBucket {
  slug: string;
  label: string;
  test: (year: number) => boolean;
}

// Order matters: newest bucket first, matching the nav/dropdown order everywhere else.
export const YEAR_BUCKETS: YearBucket[] = [
  { slug: '2026', label: '2026', test: (y) => y === 2026 },
  { slug: '2025-2024', label: '2025 – 2024', test: (y) => y === 2024 || y === 2025 },
  { slug: '2023-2022', label: '2023 – 2022', test: (y) => y === 2022 || y === 2023 },
  { slug: '2021-2020', label: '2021 – 2020', test: (y) => y === 2020 || y === 2021 },
  { slug: '2019-2018', label: '2019 – 2018', test: (y) => y === 2018 || y === 2019 },
  { slug: 'before-2017', label: 'Before 2017', test: (y) => y <= 2017 },
];

export function getBucket(slug: string): YearBucket | undefined {
  return YEAR_BUCKETS.find((b) => b.slug === slug);
}

export async function getWorksForBucket(bucket: YearBucket): Promise<Work[]> {
  const works = await getCollection(
    'works',
    ({ data }) => data.kind === 'work' && bucket.test(data.year),
  );
  return works.sort(compareWorks);
}

export function workYearCaptionLine2(work: Work): string {
  const { medium, dimensions, year } = work.data;
  const capitalizedMedium = medium.charAt(0).toUpperCase() + medium.slice(1);
  return `${capitalizedMedium}, ${formatDimensions(dimensions)}, ${year}.`;
}
