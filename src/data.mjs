import { createHash } from 'node:crypto';
export const fields = ['seq', 'title', 'category', 'body', 'score'];
export const profiles = ['cms', 'mixed', 'compact'];
export function dataset(profile, n) {
  if (!profiles.includes(profile)) throw new Error(`Unknown profile ${profile}`);
  return Array.from({ length: n }, (_, i) => ({
    seq: i + 1,
    title: `Article ${i + 1}`,
    category: `category-${i % 20}`,
    body: profile === 'cms'
      ? `<article><h1>Article ${i + 1}</h1><p>${'Reusable content blocks help teams publish consistent multilingual websites. '.repeat(16)}</p></article>`
      : profile === 'mixed'
        ? Array.from({ length: 20 }, (_, j) => createHash('sha256').update(`seed-42:${i}:${j}`).digest('hex')).join('')
        : `Item ${i + 1}`,
    score: (i * 7919) % 10000,
  }));
}
export function digest(rows, columns = fields) {
  const h = createHash('sha256');
  for (const row of [...rows].sort((a, b) => Number(a.seq) - Number(b.seq)))
    h.update(JSON.stringify(columns.map(k => typeof row[k] === 'bigint' ? Number(row[k]) : row[k])) + '\n');
  return h.digest('hex');
}
