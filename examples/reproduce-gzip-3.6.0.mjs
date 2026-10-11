import { openAdapter } from "../src/adapters.mjs";
import { dataset, fields } from "../src/data.mjs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const root = await mkdtemp(join(tmpdir(), "inibase-gzip-repro-"));
const db = await openAdapter("inibase-gzip", root);
const rows = dataset("cms", 2000);
await db.insert(rows.slice(0, 1000));
await db.insert(rows.slice(1000));
const got = await db.all();
console.log("count", got.length);
let count = 0;
for (let i = 0; i < rows.length; i++)
	for (const k of fields)
		if (got[i]?.[k] !== rows[i][k]) {
			if (count++ < 12)
				console.log(
					i,
					k,
					JSON.stringify(rows[i][k]).slice(0, 150),
					JSON.stringify(got[i]?.[k])?.slice(0, 150),
				);
		}
console.log("mismatches", count, "path", root);

await db.close();
await rm(root, { recursive: true, force: true });
process.exitCode = count ? 1 : 0;
