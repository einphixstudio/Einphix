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

// ---------- Commission page ----------
// All four are small, hand-editable CSVs — separate from works.csv because
// none of this is artwork data (no image, medium, dimensions...); it's page
// copy and a price table, so a shared schema would just be a bunch of
// columns that don't apply to either kind of row.

const commissionPricing = defineCollection({
  loader: file('src/content/commission/pricing.csv', { parser: parseCsv }),
  schema: z.object({
    animal: z.coerce.number(),
    portrait: z.coerce.number(),
  }),
});

// `step` groups rows under the same numbered badge (e.g. two rows can both
// be step "2"), so one step can show more than one title/description block.
const commissionSteps = defineCollection({
  loader: file('src/content/commission/steps.csv', { parser: parseCsv }),
  schema: z.object({
    step: z.coerce.number(),
    title: z.string(),
    description: z.string(),
  }),
});

const commissionAddons = defineCollection({
  loader: file('src/content/commission/addons.csv', { parser: parseCsv }),
  schema: z.object({
    order: z.coerce.number(),
    label: z.string(),
    description: z.string(),
  }),
});

// Key/value settings (promo banner on/off + its text, hero copy, deposit
// copy...) — the CSV's `id` column IS the setting name, so it reads as a
// plain two-column table in Excel.
const commissionSettings = defineCollection({
  loader: file('src/content/commission/settings.csv', { parser: parseCsv }),
  schema: z.object({
    value: z.string(),
  }),
});

// ---------- Class page ----------
// Same idea as the commission CSVs: separate small tables, none of it is
// artwork data. Product photos are optional (`imageExt` blank = no photo
// yet) and live in public/class-supplies/ as plain static files rather than
// through astro:assets, since most rows won't have one yet and image()
// would fail validation on a missing file.

const classSupplies = defineCollection({
  loader: file('src/content/class/supplies.csv', { parser: parseCsv }),
  schema: z.object({
    imageExt: z.preprocess(emptyToUndefined, z.string().optional()),
    name: z.string(),
    description: z.preprocess(emptyToUndefined, z.string().optional()),
    link: z.preprocess(emptyToUndefined, z.string().optional()),
    order: z.coerce.number(),
  }),
});

const classColors = defineCollection({
  loader: file('src/content/class/colors.csv', { parser: parseCsv }),
  schema: z.object({
    name: z.string(),
    note: z.preprocess(emptyToUndefined, z.string().optional()),
    order: z.coerce.number(),
  }),
});

const classFaq = defineCollection({
  loader: file('src/content/class/faq.csv', { parser: parseCsv }),
  schema: z.object({
    order: z.coerce.number(),
    question: z.string(),
    answer: z.string(),
  }),
});

const classSettings = defineCollection({
  loader: file('src/content/class/settings.csv', { parser: parseCsv }),
  schema: z.object({
    value: z.string(),
  }),
});

export const collections = {
  works,
  commissionPricing,
  commissionSteps,
  commissionAddons,
  commissionSettings,
  classSupplies,
  classColors,
  classFaq,
  classSettings,
};
