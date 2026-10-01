import { getCollection, getEntry } from 'astro:content';

export async function getAboutPhoto() {
  const [entry] = await getCollection('aboutPhoto');
  return entry?.data.image;
}

export async function getSetting(key: string): Promise<string | undefined> {
  const entry = await getEntry('aboutSettings', key);
  return entry?.data.value;
}

export async function getParagraphs(): Promise<string[]> {
  const rows = await getCollection('aboutParagraphs');
  return rows.sort((a, b) => a.data.order - b.data.order).map((r) => r.data.text);
}
