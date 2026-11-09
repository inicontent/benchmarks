import assert from "node:assert/strict";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const [target, freshDir, archiveDir, archiveCommit] = process.argv.slice(2);
assert.ok(
	target && freshDir && archiveDir && /^[0-9a-f]{40}$/.test(archiveCommit ?? ""),
	"Usage: node src/refresh-inibase.mjs <new-output> <fresh-inibase-results> <archived-results> <archive-commit>",
);
const [fresh, archive] = await Promise.all(
	[freshDir, archiveDir].map(async (dir) =>
		JSON.parse(await readFile(join(dir, "results.json"), "utf8")),
	),
);
const isIniBase = (engine) =>
	engine === "inibase" || engine.startsWith("inibase-");
const iniBaseEngines = archive.metadata.engines.filter(isIniBase);
assert.deepEqual(fresh.metadata.engines, iniBaseEngines);
assert.ok(iniBaseEngines.length > 0);
assert.equal(fresh.failures.length, 0, "Fresh iniBase trials must pass");
for (const key of [
	"sizes", "profiles", "repeats", "batchSize", "seed", "iniBaseDurability", "concurrency",
]) {
	assert.deepEqual(
		fresh.metadata[key], archive.metadata[key], `Incompatible ${key}`,
	);
}

const fixtureKey = ({ profile, rows }) => `${profile}-${rows}`;
const trialKey = ({ engine, profile, rows, repeat }) =>
	`${engine}-${profile}-${rows}-${repeat}`;
assert.deepEqual(
	fresh.results.map(trialKey).sort(),
	archive.results.filter(({ engine }) => isIniBase(engine)).map(trialKey).sort(),
	"Fresh iniBase trials must cover the archived matrix",
);
const fixtureHashes = new Map();
for (const row of archive.results) {
	const key = fixtureKey(row);
	const expected = fixtureHashes.get(key) ?? row.expectedHash;
	assert.equal(row.expectedHash, expected, `Inconsistent archive fixture ${key}`);
	fixtureHashes.set(key, expected);
}
for (const row of fresh.results) {
	assert.equal(row.verified, true);
	assert.equal(row.serverVersion, fresh.metadata.dependencies.inibase);
	assert.equal(row.expectedHash, fixtureHashes.get(fixtureKey(row)), "Fixture changed");
}

const comparators = archive.results.filter(({ engine }) => !isIniBase(engine));
const metadata = {
	...fresh.metadata,
	engines: archive.metadata.engines,
	archivedComparators: {
		commit: archiveCommit,
		metadata: archive.metadata,
	},
};
const results = [...fresh.results, ...comparators];
const failures = archive.failures.filter(({ id }) =>
	archive.metadata.engines.some((engine) => !isIniBase(engine) && id.startsWith(`${engine}-`)),
);

await mkdir(target);
for (const [dir, rows] of [[freshDir, fresh.results], [archiveDir, comparators]]) {
	for (const row of rows) {
		const name = `${trialKey(row)}.json`;
		await copyFile(join(dir, name), join(target, name));
	}
}
await writeFile(
	join(target, "environment.json"), JSON.stringify(metadata, null, 2) + "\n",
);
await writeFile(
	join(target, "results.json"), JSON.stringify({ metadata, results, failures }, null, 2) + "\n",
);
