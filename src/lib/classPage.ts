import { getCollection, getEntry } from 'astro:content';

export async function getClassSetting(key: string): Promise<string | undefined> {
  const entry = await getEntry('classSettings', key);
  return entry?.data.value;
}

export async function getSupplies() {
  const rows = await getCollection('classSupplies');
  return rows
    .map((r) => ({ id: r.id, ...r.data }))
    .sort((a, b) => a.order - b.order);
}

export async function getColors() {
  const rows = await getCollection('classColors');
  return rows
    .map((r) => ({ id: r.id, ...r.data }))
    .sort((a, b) => a.order - b.order);
}

export async function getFaq() {
  const rows = await getCollection('classFaq');
  return rows.map((r) => r.data).sort((a, b) => a.order - b.order);
}
