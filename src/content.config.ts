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

const works = defineCollection({
  loader: file('src/content/works/works.csv', { parser: parseCsv }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      year: z.coerce.number(),
      medium: z.string(),
      dimensionsImperial: z.string(),
      dimensionsMetric: z.string(),
      aspect: z.string(),
      image: image(),
      series: z.preprocess(emptyToUndefined, z.string().optional()),
      kind: z.preprocess((v) => emptyToUndefined(v) ?? 'work', z.enum(['work', 'sketch'])),
      featured: z.preprocess((v) => v === 'true', z.boolean()),
      order: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
    }),
});

export const collections = { works };
