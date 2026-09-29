import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

// Minimal RFC4180-ish CSV parser: handles quoted fields, escaped quotes, commas/newlines inside quotes.
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      pushField();
    } else if (c === '\r') {
      // skip, \n (or trailing \r at EOF) ends the row
    } else if (c === '\n') {
      pushField();
      pushRow();
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRow();
  }

  const nonEmptyRows = rows.filter((r) => r.some((cell) => cell.trim() !== ''));
  const [header, ...dataRows] = nonEmptyRows;
  if (!header) return [];

  return dataRows.map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((key, idx) => {
      obj[key.trim()] = (r[idx] ?? '').trim();
    });
    return obj;
  });
}

const emptyToUndefined = (v: unknown) => (v === '' || v == null ? undefined : v);
// Excel/Numbers/Sheets all export boolean-looking cells as "TRUE"/"FALSE" (not
// lowercase), so match case-insensitively rather than requiring one spelling.
const isTrue = (v: unknown) => typeof v === 'string' && v.toLowerCase() === 'true';
// Accept "study"/"studies"/"work"/"works" in any case — whichever reads
// naturally when typing — rather than requiring one exact spelling.
const normalizeKind = (v: unknown) => {
  const s = emptyToUndefined(v);
  if (typeof s !== 'string') return 'work';
  return /^stud/i.test(s.trim()) ? 'study' : 'work';
};

// The CSV only carries an `imageExt` (jpg/png/...) — the actual filename is
// always `<id>.<ext>` (all images live flat in src/content/works/, with the
// id conventionally starting with the year, e.g. "2025-the-fish-thief"), so
// the artist never has to type the filename twice.
function withImagePath(rows: Record<string, string>[]): Record<string, string>[] {
  return rows.map((row) => ({
    ...row,
    image: `${row.id}.${row.imageExt}`,
  }));
}

const works = defineCollection({
  loader: file('src/content/works/works.csv', {
    parser: (text) => withImagePath(parseCsv(text)),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      year: z.coerce.number(),
      medium: z.string(),
      dimensions: z.string(),
      image: image(),
      description: z.preprocess(emptyToUndefined, z.string().optional()),
      series: z.preprocess(emptyToUndefined, z.string().optional()),
      kind: z.preprocess(normalizeKind, z.enum(['work', 'study'])),
      featured: z.preprocess(isTrue, z.boolean()),
      // featuredOrder: home carousel sequence (only meaningful when featured).
      // order: manual "pin to the front" for the Work year / Studies pages.
      // Two fields because a piece's place in the home carousel and its place
      // in its own year/medium page are independent decisions.
      featuredOrder: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
      order: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
    }),
});

export const collections = { works };
