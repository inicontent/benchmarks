import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { openAdapter } from "../src/adapters.mjs";
import { dataset, digest } from "../src/data.mjs";
test("published 3.8.0 gzip append preserves two large batches and quoted text", async () => {
	const root = await mkdtemp(join(tmpdir(), "inibase-append-test-"));
	try {
		const db = await openAdapter("inibase-gzip", root);
		const rows = dataset("cms", 2000);
		rows[1200].body =
			"A customer's text with 'quotes', backslashes \\ and Unicode العربية";
		await db.insert(rows.slice(0, 1000));
		await db.insert(rows.slice(1000));
		const actual = await db.all();
		assert.equal(actual.length, 2000);
		assert.equal(digest(actual), digest(rows));
		await db.close();
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});
