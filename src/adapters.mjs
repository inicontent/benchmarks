import { join } from "node:path";
import { fields } from "./data.mjs";
export const engines = [
	"inibase",
	"inibase-gzip",
	"sqlite",
	"duckdb",
	"pglite",
	"leveldb",
	"lmdb",
	"lmdb-lz4",
	"postgresql",
	"mongodb",
];
const schema =
	"seq INTEGER PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, body TEXT NOT NULL, score INTEGER NOT NULL";
const sqlQuote = (s) => `'${s.replaceAll("'", "''")}'`;
const values = (rows) =>
	rows
		.map(
			(r) =>
				`(${r.seq},${sqlQuote(r.title)},${sqlQuote(r.category)},${sqlQuote(r.body)},${r.score})`,
		)
		.join(",");
export async function openAdapter(engine, root) {
	if (engine.startsWith("inibase")) {
		const Inibase = (await import("inibase")).default;
		const db = new Inibase("db", root);
		if (!(await db.getTable("records").catch(() => null)))
			await db.createTable(
				"records",
				fields.map((key) => ({
					key,
					type: ["seq", "score"].includes(key) ? "number" : "string",
					required: true,
				})),
				{ compression: engine.includes("gzip"), cache: false, decodeID: true },
			);
		return {
			version: "3.7.0",
			insert: (rows) => db.post("records", structuredClone(rows)),
			all: async (columns = fields) =>
				(await db.get("records", undefined, {
					perPage: -1,
					columns: [...columns],
				})) ?? [],
			point: async (seq) => {
				const rows = await db.get("records", { seq }, { perPage: -1 });
				return Array.isArray(rows) ? rows[0] : rows;
			},
			update: (seq) => db.put("records", { score: -1 }, { seq }),
			remove: (seq) => db.delete("records", { seq }),
			maintain: async () => {},
			close: async () => {},
		};
	}
	if (engine === "sqlite") {
		const { DatabaseSync } = await import("node:sqlite");
		const db = new DatabaseSync(join(root, "db.sqlite"));
		db.exec(
			`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS records (${schema})`,
		);
		const stmt = db.prepare("INSERT INTO records VALUES (?,?,?,?,?)");
		return {
			insert: async (rows) => {
				db.exec("BEGIN");
				try {
					for (const r of rows) stmt.run(...fields.map((k) => r[k]));
					db.exec("COMMIT");
				} catch (e) {
					db.exec("ROLLBACK");
					throw e;
				}
			},
			all: async (cols = fields) =>
				db.prepare(`SELECT ${cols.join(",")} FROM records`).all(),
			point: async (seq) =>
				db.prepare("SELECT * FROM records WHERE seq=?").get(seq),
			update: async (seq) =>
				db.prepare("UPDATE records SET score=-1 WHERE seq=?").run(seq),
			remove: async (seq) =>
				db.prepare("DELETE FROM records WHERE seq=?").run(seq),
			maintain: async () =>
				db.exec(
					"PRAGMA wal_checkpoint(TRUNCATE); VACUUM; PRAGMA wal_checkpoint(TRUNCATE)",
				),
			close: async () => db.close(),
		};
	}
	if (engine === "duckdb") {
		const { DuckDBInstance } = await import("@duckdb/node-api");
		const instance = await DuckDBInstance.create(join(root, "db.duckdb"));
		const db = await instance.connect();
		await db.run(`CREATE TABLE IF NOT EXISTS records (${schema})`);
		const query = async (q) => (await db.runAndReadAll(q)).getRowObjects();
		return {
			insert: async (rows) => {
				await db.run("BEGIN TRANSACTION");
				const app = await db.createAppender("records");
				for (const r of rows) {
					app.appendInteger(r.seq);
					app.appendVarchar(r.title);
					app.appendVarchar(r.category);
					app.appendVarchar(r.body);
					app.appendInteger(r.score);
					app.endRow();
				}
				app.closeSync();
				await db.run("COMMIT");
			},
			all: (cols = fields) => query(`SELECT ${cols.join(",")} FROM records`),
			point: async (seq) =>
				(await query(`SELECT * FROM records WHERE seq=${seq}`))[0],
			update: (seq) => db.run(`UPDATE records SET score=-1 WHERE seq=${seq}`),
			remove: (seq) => db.run(`DELETE FROM records WHERE seq=${seq}`),
			maintain: () => db.run("CHECKPOINT"),
			close: async () => {
				db.closeSync();
				instance.closeSync();
			},
		};
	}
	if (engine === "pglite") {
		const { PGlite } = await import("@electric-sql/pglite");
		const db = await PGlite.create(join(root, "pg"), {
			relaxedDurability: false,
		});
		await db.exec(`CREATE TABLE IF NOT EXISTS records (${schema})`);
		return {
			insert: (rows) => db.exec(`INSERT INTO records VALUES ${values(rows)}`),
			all: async (cols = fields) =>
				(await db.query(`SELECT ${cols.join(",")} FROM records`)).rows,
			point: async (seq) =>
				(await db.query("SELECT * FROM records WHERE seq=$1", [seq])).rows[0],
			update: (seq) =>
				db.query("UPDATE records SET score=-1 WHERE seq=$1", [seq]),
			remove: (seq) => db.query("DELETE FROM records WHERE seq=$1", [seq]),
			maintain: async () => {
				await db.exec("VACUUM ANALYZE records");
				await db.exec("CHECKPOINT");
			},
			close: () => db.close(),
		};
	}
	if (engine === "leveldb") {
		const { Level } = await import("level");
		const db = new Level(join(root, "level"), {
			valueEncoding: "json",
			compression: true,
		});
		await db.open();
		const key = (n) => String(n).padStart(12, "0");
		return {
			insert: (rows) =>
				db.batch(
					rows.map((r) => ({ type: "put", key: key(r.seq), value: r })),
					{ sync: true },
				),
			all: async (cols = fields) =>
				(await db.values().all()).map((r) =>
					Object.fromEntries(cols.map((k) => [k, r[k]])),
				),
			point: (seq) => db.get(key(seq)),
			update: async (seq) => {
				const r = await db.get(key(seq));
				await db.put(key(seq), { ...r, score: -1 }, { sync: true });
			},
			remove: (seq) => db.del(key(seq), { sync: true }),
			maintain: () => db.compactRange("000000000000", "999999999999"),
			close: () => db.close(),
		};
	}
	if (engine.startsWith("lmdb")) {
		const { open } = await import("lmdb");
		const db = open({
			path: join(root, "lmdb"),
			compression: engine.endsWith("lz4"),
			noSync: false,
		});
		return {
			insert: async (rows) => {
				await db.transaction(() => {
					for (const r of rows) db.putSync(r.seq, r);
				});
				await db.flushed;
			},
			all: async (cols = fields) =>
				[...db.getRange()].map(({ value: r }) =>
					Object.fromEntries(cols.map((k) => [k, r[k]])),
				),
			point: async (seq) => db.get(seq),
			update: async (seq) => {
				await db.put(seq, { ...db.get(seq), score: -1 });
				await db.flushed;
			},
			remove: async (seq) => {
				await db.remove(seq);
				await db.flushed;
			},
			maintain: async () => {
				await db.flushed;
			},
			close: () => db.close(),
		};
	}
	if (["postgresql", "mongodb"].includes(engine))
		return (await import("./servers.mjs")).openServer(engine, root);
	throw new Error(`Unsupported engine ${engine}`);
}
