import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

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
// Accept "study"/"studies"/"work"/"works"/"commission"/"commissions" in any
// case — whichever reads naturally when typing — rather than requiring one
// exact spelling. Empty/unrecognized defaults to "work".
const normalizeKind = (v: unknown) => {
  const s = emptyToUndefined(v);
  if (typeof s !== 'string') return 'work';
  const trimmed = s.trim();
  if (/^stud/i.test(trimmed)) return 'study';
  if (/^comm/i.test(trimmed)) return 'commission';
  // A piece with its own series page that shouldn't also clutter a
  // Work-year page — the `series` CSV field still puts it on that page
  // regardless of `kind`; this just keeps it OUT of Work/Studies.
  if (/^seri/i.test(trimmed)) return 'series';
  return 'work';
};
// Same vocabulary as `kind`, but for the optional *second* page a work
// should also appear on (e.g. a study that should also show up on its
// Work-year page). Unlike `kind`, empty/unrecognized stays unset rather
// than defaulting to "work" — most works don't have a second placement.
const normalizeKind2 = (v: unknown) => {
  const s = emptyToUndefined(v);
  if (typeof s !== 'string') return undefined;
  const trimmed = s.trim();
  if (/^stud/i.test(trimmed)) return 'study';
  if (/^comm/i.test(trimmed)) return 'commission';
  if (/^seri/i.test(trimmed)) return 'series';
  if (/^work/i.test(trimmed)) return 'work';
  return undefined;
};

// The CSV only carries an `imageExt` (jpg/png/...) — the actual filename is
// always `<id>.<ext>` (all images live flat in src/content/works/, with the
// id conventionally starting with the year, e.g. "2025-the-fish-thief"), so
// the artist never has to type the filename twice. A row whose file doesn't
// actually exist on disk (typo, upload forgotten, etc.) must never crash the
// whole site — image() would throw ImageNotFound for every page, not just
// the one work — so we check the file exists here and fall back to
// `image: undefined`, which every page renders as an "image missing" tile
// instead of the artwork (see WorkImage.astro).
const worksDir = fileURLToPath(new URL('./content/works/', import.meta.url));
function withImagePath(rows: Record<string, string>[]): Record<string, string | undefined>[] {
  return rows.map((row) => {
    const filename = `${row.id}.${row.imageExt}`;
    const exists = fs.existsSync(`${worksDir}${filename}`);
    if (!exists) {
      console.warn(`[works.csv] image not found for "${row.id}": ${filename}`);
    }
    return { ...row, image: exists ? filename : undefined };
  });
}

const works = defineCollection({
  loader: file('src/content/works/works.csv', {
    parser: (text) => withImagePath(parseCsv(text)),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      year: z.coerce.number(),
      // medium = what paint/material was used (oil, acrylic, watercolor...).
      // surface = what it was applied to (canvas, board, paper...) — split
      // out so a display caption can join them ("Oil on canvas"). surface
      // is optional since some media (e.g. digital) have no physical one.
      medium: z.string(),
      surface: z.preprocess(emptyToUndefined, z.string().optional()),
      dimensions: z.string(),
      image: image().optional(),
      description: z.preprocess(emptyToUndefined, z.string().optional()),
      series: z.preprocess(emptyToUndefined, z.string().optional()),
      kind: z.preprocess(normalizeKind, z.enum(['work', 'study', 'commission', 'series'])),
      // kind2: lets a piece also appear on a second page (e.g. kind=study,
      // kind2=work shows it on both its Studies page and its Work-year
      // page). kind2Order is its pin-order on that *second* page only —
      // kept separate from `order` for the same reason featuredOrder is
      // separate: a piece's place on each page is an independent decision.
      kind2: z.preprocess(normalizeKind2, z.enum(['work', 'study', 'commission', 'series']).optional()),
      featured: z.preprocess(isTrue, z.boolean()),
      // featuredOrder: home carousel sequence (only meaningful when featured).
      // order: manual "pin to the front" for the Work year / Studies pages.
      // Two fields because a piece's place in the home carousel and its place
      // in its own year/medium page are independent decisions.
      featuredOrder: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
      order: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
      kind2Order: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
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
// yet) and, same as works.csv, live flat next to the CSV in
// src/content/class/ with filename = `<id>.<imageExt>`, resolved through
// astro:assets via the `image()` schema helper. `highlight` marks the one
// row (the Michaels acrylic paint) that gets its own callout block instead
// of appearing in the regular supply grid.

const classSupplies = defineCollection({
  loader: file('src/content/class/supplies.csv', {
    parser: (text) =>
      parseCsv(text).map((row) => ({
        ...row,
        image: row.imageExt ? `${row.id}.${row.imageExt}` : undefined,
      })),
  }),
  schema: ({ image }) =>
    z.object({
      image: image().optional(),
      name: z.string(),
      description: z.preprocess(emptyToUndefined, z.string().optional()),
      link: z.preprocess(emptyToUndefined, z.string().optional()),
      order: z.coerce.number(),
      highlight: z.preprocess(isTrue, z.boolean()),
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

// ---------- Series page ----------
// Optional per-series blurb for the generic /series/<slug> template (not
// Furry Forces, which is hand-built). Keyed by the same slug getSeriesList()
// derives from works.csv's `series` column. A series with no row here (or a
// blank description) just doesn't show one — this file is entirely optional.
const seriesInfo = defineCollection({
  loader: file('src/content/series/series.csv', { parser: parseCsv }),
  schema: z.object({
    description: z.preprocess(emptyToUndefined, z.string().optional()),
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
  seriesInfo,
};
