import assert from "node:assert/strict";
import { execFileSync, fork } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";

const options = JSON.parse(process.argv[2]);
const { engine, root, rows = 1000, operations = 32 } = options;
const sqlite = engine === "sqlite";
let db, statement;
const open = async (initialize = false) => {
	if (sqlite) {
		const { DatabaseSync } = await import("node:sqlite");
		db = new DatabaseSync(join(root, "db.sqlite"));
		db.exec("PRAGMA busy_timeout=30000; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA cache_size=-16384");
		if (initialize) db.exec("CREATE TABLE records (seq INTEGER PRIMARY KEY, key TEXT UNIQUE, score INTEGER, body TEXT)");
		statement = { point: db.prepare("SELECT * FROM records WHERE key=?"), update: db.prepare("UPDATE records SET score=? WHERE key=?") };
	} else {
		const Engine = (await import(pathToFileURL(options.module))).default;
		db = new Engine("db", root);
		if (initialize) await db.createTable("records", [{ key: "seq", type: "number" }, { key: "key", type: "string", unique: true },
			{ key: "score", type: "number" }, { key: "body", type: "string" }],
			{ log: true, compression: true, cache: false, decodeID: true,
				...(engine === "indexed" ? { seekable: true, indexes: ["seq", "key"], tombstones: true } : {}) });
	}
};
const close = async () => sqlite ? db.close() : await db.close?.();
if (options.role) {
	await open();
	process.send("ready");
	await new Promise((done) => process.once("message", done));
	const samples = [];
	const before = process.resourceUsage();
	const start = performance.now();
	for (let i = 0; i < operations; i++) {
		const seq = 1 + ((i * 2 + options.worker) % rows), key = `key-${seq}`;
		const start = performance.now();
		if (options.role === "writer") {
			if (sqlite) statement.update.run(i + 100, key);
			else await db.put("records", { score: i + 100 }, { key });
		} else {
			const value = sqlite ? statement.point.get(key) : (await db.get("records", { key }))?.[0];
			assert.equal(value.seq, seq); assert.equal(value.body, `body-${seq}`); assert.equal(typeof value.score, "number");
		}
		samples.push(performance.now() - start);
	}
	const elapsed = performance.now() - start;
	await close();
	process.send({ role: options.role, worker: options.worker, elapsed, samples, cpu: process.resourceUsage(), baselineUsage: before });
	process.disconnect();
} else {
	await open(true);
	if (sqlite) {
		const insert = db.prepare("INSERT INTO records VALUES (?,?,?,?)");
		db.exec("BEGIN");
		for (let seq = 1; seq <= rows; seq++) insert.run(seq, `key-${seq}`, 0, `body-${seq}`);
		db.exec("COMMIT");
	} else for (let start = 0; start < rows; start += 1000)
		await db.post("records", Array.from({ length: Math.min(1000, rows - start) }, (_, i) => ({ seq: start + i + 1,
			key: `key-${start + i + 1}`, score: 0, body: `body-${start + i + 1}` })));
	await close();
	const children = [];
	const resourceSamples = [];
	const monitor = setInterval(() => {
		const processes = execFileSync("ps", ["-axo", "pid=,ppid=,rss="], { encoding: "utf8" }).trim().split("\n")
			.map((line) => line.trim().split(/\s+/).map(Number));
		const descendants = new Set([process.pid]);
		for (let pass = 0; pass < 8; pass++) for (const [pid, parent] of processes) if (descendants.has(parent)) descendants.add(pid);
		resourceSamples.push({ time: Date.now(), processTreeRss: processes.reduce((sum, [pid, , rss]) => sum + (descendants.has(pid) ? rss * 1024 : 0), 0) });
	}, 100);
	const timeout = setTimeout(() => { for (const { child } of children) child.kill("SIGKILL"); }, 120000);
	for (const role of ["writer", "reader"]) for (let worker = 0; worker < 2; worker++) {
		const child = fork(new URL(import.meta.url), [JSON.stringify({ ...options, role, worker })],
			{ stdio: ["ignore", "ignore", "pipe", "ipc"] });
		let stderr = "", result;
		child.stderr.on("data", (data) => { stderr += data; });
		const ready = new Promise((done, reject) => {
			let started = false;
			child.on("message", (message) => { if (message === "ready") { started = true; done(); } else result = message; });
			child.on("error", reject); child.on("exit", (code) => { if (!started) reject(new Error(`worker failed before ready: ${code}: ${stderr}`)); });
		});
		const finished = new Promise((done) => child.on("exit", (code, signal) => done({ code, signal, stderr, result })));
		children.push({ child, ready, finished });
	}
	await Promise.all(children.map((child) => child.ready));
	const start = performance.now();
	for (const { child } of children) child.send("go");
	const outcomes = await Promise.all(children.map((child) => child.finished));
	clearTimeout(timeout); clearInterval(monitor);
	const elapsed = performance.now() - start;
	await open();
	const values = sqlite ? db.prepare("SELECT * FROM records").all() : await db.get("records", undefined, { perPage: -1 });
	assert.equal(values.length, rows);
	for (let worker = 0; worker < 2; worker++) for (let i = 0; i < operations; i++) {
		const seq = 1 + ((i * 2 + worker) % rows);
		assert.equal(values.find((row) => row.seq === seq).score, i + 100);
	}
	await close();
	const result = { workload: "two writers and two readers; durable key updates; barrier start", options, elapsed, outcomes, resourceSamples,
		verified: outcomes.every((value) => value.code === 0),
		note: "Per-process resourceUsage and 100-ms sampled parent/worker process-tree RSS are retained. Samples can miss short peaks." };
	await writeFile(options.destination, JSON.stringify(result, null, 2) + "\n");
	if (!result.verified) process.exitCode = 1;
}
