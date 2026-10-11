import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
const root = process.argv[2] ?? "results/latest";
const { metadata, results, failures } = JSON.parse(
	await readFile(join(root, "results.json"), "utf8"),
);
const expected = new Set();
for (const e of metadata.engines)
	for (const p of metadata.profiles)
		for (const n of metadata.sizes)
			for (let r = 1; r <= metadata.repeats; r++)
				expected.add(`${e}-${p}-${n}-${r}`);
for (const r of results) {
	const id = `${r.engine}-${r.profile}-${r.rows}-${r.repeat}`;
	assert.ok(expected.delete(id), `Unexpected or duplicated sample ${id}`);
	assert.equal(r.verified, true);
	assert.match(r.expectedHash, /^[0-9a-f]{64}$/);
	for (const phase of ["empty", "afterInsert", "stored", "afterChurn"])
		for (const key of ["logical", "allocated", "files"])
			assert.ok(
				Number.isFinite(r[phase][key]) && r[phase][key] >= 0,
				`${id}: invalid ${phase}.${key}`,
			);
	for (const value of Object.values(r.timings))
		assert.ok(Number.isFinite(value) && value >= 0);
}
for (const f of failures)
	assert.ok(expected.delete(f.id), `Unexpected or duplicated failure ${f.id}`);
assert.equal(expected.size, 0, `Missing trials: ${[...expected].join(", ")}`);
console.log(
	`Complete matrix: ${results.length} verified successes, ${failures.length} recorded failures. Recorded failures remain disqualified.`,
);
