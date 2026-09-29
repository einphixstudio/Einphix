import { getCollection, getEntry } from 'astro:content';

export async function getSetting(key: string): Promise<string | undefined> {
  const entry = await getEntry('commissionSettings', key);
  return entry?.data.value;
}

export async function getSettingBool(key: string): Promise<boolean> {
  const value = await getSetting(key);
  return value?.toLowerCase() === 'true';
}

export async function getPricingRows() {
  const rows = await getCollection('commissionPricing');
  // getCollection doesn't preserve CSV row order (it comes back sorted by
  // id, which puts "9 x 12" after "40 x 60" as strings) — sort by the size's
  // own leading number instead, so it reads smallest to largest regardless.
  return rows
    .map((r) => ({ size: r.id, animal: r.data.animal, portrait: r.data.portrait }))
    .sort((a, b) => (parseFloat(a.size) || 0) - (parseFloat(b.size) || 0));
}

export interface StepBlock {
  title: string;
  description: string;
}
export interface Step {
  step: number;
  blocks: StepBlock[];
}

// Rows share a `step` number when more than one title/description block
// belongs under the same numbered badge — group them here so the page just
// renders one badge per step with all of its blocks stacked beneath.
export async function getSteps(): Promise<Step[]> {
  const rows = await getCollection('commissionSteps');
  const byStep = new Map<number, StepBlock[]>();
  for (const row of rows) {
    const blocks = byStep.get(row.data.step) ?? [];
    blocks.push({ title: row.data.title, description: row.data.description });
    byStep.set(row.data.step, blocks);
  }
  return [...byStep.entries()]
    .sort(([a], [b]) => a - b)
    .map(([step, blocks]) => ({ step, blocks }));
}

// "YYYY-MM-DD" parses as UTC midnight per spec, but .setHours() below works
// in local time — mixing the two shifts the boundary by the local UTC
// offset (the end date could go inactive up to a day early). Parsing the
// components ourselves keeps everything in local time throughout.
function parseLocalDate(s: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return undefined;
  const [, y, mo, d] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d));
}

// A static site can only re-check "is it promo season?" whenever it's next
// rebuilt — this makes that check correct once it does, rather than relying
// on someone remembering to flip `promoEnabled` off on the right day.
export async function isPromoActive(): Promise<boolean> {
  const enabled = await getSettingBool('promoEnabled');
  if (!enabled) return false;

  const start = await getSetting('promoStart');
  const end = await getSetting('promoEnd');
  const now = new Date();

  if (start) {
    const startDate = parseLocalDate(start);
    if (startDate && now < startDate) return false;
  }
  if (end) {
    const endDate = parseLocalDate(end);
    if (endDate) {
      endDate.setHours(23, 59, 59, 999); // the end date is inclusive, all day
      if (now > endDate) return false;
    }
  }
  return true;
}

export async function getAddons() {
  const rows = await getCollection('commissionAddons');
  return rows
    .map((r) => ({ order: r.data.order, label: r.data.label, description: r.data.description }))
    .sort((a, b) => a.order - b.order);
}
