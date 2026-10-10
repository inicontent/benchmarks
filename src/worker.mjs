import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { openAdapter } from './adapters.mjs';
import { dataset, digest, fields } from './data.mjs';
const [engine, profile, count, directory, destination] = process.argv.slice(2);
const n = Number(count);
await mkdir(directory, { recursive: true });
async function disk(path) {
  let logical = 0, allocated = 0, files = 0;
  for (const e of await readdir(path, { withFileTypes: true })) {
    const p = join(path, e.name);
    if (e.isDirectory()) { const s = await disk(p); logical += s.logical; allocated += s.allocated; files += s.files; }
    else { const s = await stat(p); logical += s.size; allocated += s.blocks * 512; files++; }
  }
  return { logical, allocated, files };
}
const rows = dataset(profile, n);
const expected = digest(rows);
const result = { engine, profile, rows: n, inputBytes: Buffer.byteLength(JSON.stringify(rows)), expectedHash: expected, timings: {} };
async function timed(name, fn) { const start = performance.now(); const value = await fn(); result.timings[name] = performance.now() - start; return value; }
let db;
const abort = async () => {
  const timer = setTimeout(() => process.exit(1), 10000);
  try { await db?.close(); } catch {}
  clearTimeout(timer); process.exit(1);
};
process.once('SIGTERM', abort);
try {
db = await openAdapter(engine, directory);
result.serverVersion = db.version;
await db.maintain(); await db.close();
result.empty = await disk(directory);
db = await openAdapter(engine, directory);
await timed('insertMs', async () => { for (let i = 0; i < n; i += 1000) await db.insert(rows.slice(i, i + 1000)); });
result.afterInsert = await disk(directory);
await timed('maintenanceMs', () => db.maintain());
await db.close();
result.stored = await disk(directory);
result.incremental = { logical: result.stored.logical - result.empty.logical, allocated: result.stored.allocated - result.empty.allocated };
db = await openAdapter(engine, directory);
const full = await timed('readAllMs', () => db.all());
assert.equal(full.length, n); assert.equal(digest(full), expected, `${engine}: full read mismatch`);
await timed('warmReadAllMs', () => db.all());
const columns = ['seq', 'category'];
const projection = await timed('projectionMs', () => db.all(columns));
assert.equal(digest(projection, columns), digest(rows, columns), `${engine}: projection mismatch`);
const keys = Array.from({ length: Math.min(20, n) }, (_, i) => 1 + ((i * 7919 + 42) % n));
await timed('point20Ms', async () => { for (const seq of keys) assert.equal(digest([await db.point(seq)]), digest([rows[seq - 1]])); });
await timed('update5Ms', async () => { for (const seq of keys.slice(0, 5)) await db.update(seq); });
for (const seq of keys.slice(0, 5)) { rows[seq - 1].score = -1; assert.equal((await db.point(seq)).score, -1); }
await timed('delete5Ms', async () => { for (const seq of keys.slice(0, 5)) await db.remove(seq); });
const deleted = new Set(keys.slice(0, 5));
assert.equal(digest(await db.all()), digest(rows.filter(r => !deleted.has(r.seq))));
await db.maintain(); await db.close();
result.afterChurn = await disk(directory);
result.verified = true;
result.maxRssBytes = process.resourceUsage().maxRSS * 1024;
await writeFile(destination, JSON.stringify(result, null, 2) + '\n');
console.log(`${engine} ${profile} ${n}: ${(result.stored.logical / 1048576).toFixed(2)} MiB, verified`);
process.exit(0);
} catch (error) {
  console.error(error);
  try { await db?.close(); } catch {}
  process.exit(1);
}
