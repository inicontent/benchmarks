import { mkdir, access } from "node:fs/promises";
import { join } from "node:path";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { fields } from "./data.mjs";
const passwords = new Map();
async function freePort() {
	const server = createServer();
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
	const port = server.address().port;
	await new Promise((resolve) => server.close(resolve));
	return port;
}
export async function openServer(engine, root) {
	if (engine === "postgresql") {
		const { default: EmbeddedPostgres } = await import("embedded-postgres");
		const databaseDir = join(root, "postgres");
		if (!passwords.has(root))
			passwords.set(root, randomBytes(24).toString("hex"));
		const server = new EmbeddedPostgres({
			databaseDir,
			user: "benchmark",
			password: passwords.get(root),
			port: await freePort(),
			persistent: true,
			postgresFlags: [
				"-c",
				"listen_addresses=127.0.0.1",
				"-c",
				"unix_socket_directories=",
				"-c",
				"fsync=on",
				"-c",
				"synchronous_commit=on",
				"-c",
				"full_page_writes=on",
			],
			onLog: () => {},
			onError: () => {},
		});
		if (
			!(await access(join(databaseDir, "PG_VERSION")).then(
				() => true,
				() => false,
			))
		)
			await server.initialise();
		await server.start();
		const db = server.getPgClient("postgres", "127.0.0.1");
		await db.connect();
		await db.query(
			"CREATE TABLE IF NOT EXISTS records (seq INTEGER PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, body TEXT NOT NULL, score INTEGER NOT NULL)",
		);
		return {
			version: (await db.query("SELECT version()")).rows[0].version,
			insert: (rows) => {
				const params = rows.flatMap((r) => fields.map((k) => r[k]));
				const groups = rows
					.map(
						(_, i) =>
							`(${fields.map((_, j) => `$${i * 5 + j + 1}`).join(",")})`,
					)
					.join(",");
				return db.query(`INSERT INTO records VALUES ${groups}`, params);
			},
			all: async (cols = fields) =>
				(await db.query(`SELECT ${cols.join(",")} FROM records`)).rows,
			point: async (seq) =>
				(await db.query("SELECT * FROM records WHERE seq=$1", [seq])).rows[0],
			update: (seq) =>
				db.query("UPDATE records SET score=-1 WHERE seq=$1", [seq]),
			remove: (seq) => db.query("DELETE FROM records WHERE seq=$1", [seq]),
			maintain: async () => {
				await db.query("VACUUM ANALYZE records");
				await db.query("CHECKPOINT");
			},
			close: async () => {
				await db.end();
				await server.stop();
			},
		};
	}
	if (engine === "mongodb") {
		const { MongoMemoryServer } = await import("mongodb-memory-server");
		const { MongoClient } = await import("mongodb");
		const dbPath = join(root, "mongo");
		await mkdir(dbPath, { recursive: true });
		const server = await MongoMemoryServer.create({
			binary: { version: "8.2.6" },
			instance: {
				port: await freePort(),
				dbPath,
				storageEngine: "wiredTiger",
				ip: "127.0.0.1",
				args: ["--wiredTigerCacheSizeGB", "0.25"],
			},
		});
		const client = new MongoClient(server.getUri(), {
			writeConcern: { w: 1, j: true },
		});
		await client.connect();
		const db = client.db("benchmark");
		const collections = await db.listCollections({ name: "records" }).toArray();
		if (!collections.length) await db.createCollection("records");
		const records = db.collection("records");
		const clean = (r) =>
			r ? Object.fromEntries(fields.map((k) => [k, r[k]])) : undefined;
		return {
			version: (await db.admin().command({ buildInfo: 1 })).version,
			insert: (rows) =>
				records.insertMany(rows.map((r) => ({ _id: r.seq, ...r }))),
			all: async (cols = fields) =>
				await records
					.find(
						{},
						{
							projection: {
								_id: 0,
								...Object.fromEntries(cols.map((k) => [k, 1])),
							},
						},
					)
					.toArray(),
			point: async (seq) => clean(await records.findOne({ _id: seq })),
			update: (seq) => records.updateOne({ _id: seq }, { $set: { score: -1 } }),
			remove: (seq) => records.deleteOne({ _id: seq }),
			maintain: () => db.admin().command({ fsync: 1 }),
			close: async () => {
				await client.close();
				await server.stop({ doCleanup: false, force: false });
			},
		};
	}
	throw new Error(`Unknown server ${engine}`);
}
