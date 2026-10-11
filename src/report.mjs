import { readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
const output = resolve(process.argv[2] ?? "results/latest");
const { metadata, results, failures } = JSON.parse(
	await readFile(join(output, "results.json"), "utf8"),
);
const median = (a) => {
	a = [...a].sort((a, b) => a - b);
	const m = Math.floor(a.length / 2);
	return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};
const mib = (v) => (v / 1048576).toFixed(3);
const lines = [
	"# Measured results",
	"",
	`Run: ${metadata.runId}. ${metadata.cpu}; ${metadata.platform}/${metadata.arch}; Node ${metadata.node}.`,
	"",
	`Each cell is a median of ${metadata.repeats} independent runs when complete. All successful runs passed full-content SHA-256 verification, projected-content verification, and CRUD checks.`,
	"",
	"**Scope:** local embedded engines and loopback-only native servers, synthetic fixtures, one table, no replicas or backups. PGlite is PostgreSQL in WASM, not a production PostgreSQL server. LevelDB/LMDB are key-value engines. Timings include adapter/API work and are not feature-equivalent server benchmarks.",
	"",
	"Storage is measured after each engine’s documented maintenance and clean close. Both total footprint and growth over an empty database are reported. Physical allocation uses stat.blocks × 512 (not an invoice, and may differ with APFS compression/clones). No OS cache eviction; reads are cache-affected. RSS includes fixtures, JS/WASM runtime, and result verification; native server child memory is excluded. Sparse file logical lengths are not physical disk consumption.",
	"",
];
const csv = [
	"profile,rows,engine,runs,total_logical_bytes,total_allocated_bytes,incremental_logical_bytes,incremental_allocated_bytes,insert_ms,maintenance_ms,read_all_ms,projection_ms,point20_ms,update5_ms,delete5_ms",
];
for (const n of metadata.sizes)
	for (const profile of metadata.profiles) {
		lines.push(
			`## ${profile} — ${n.toLocaleString("en-US")} records`,
			"",
			"| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |",
			"|---|---:|---:|---:|---:|---:|---:|---:|---:|",
		);
		const groups = metadata.engines
			.map((engine) => ({
				engine,
				rows: results.filter(
					(r) => r.engine === engine && r.profile === profile && r.rows === n,
				),
			}))
			.filter((g) => g.rows.length);
		groups.sort(
			(a, b) =>
				median(a.rows.map((r) => r.stored.allocated)) -
				median(b.rows.map((r) => r.stored.allocated)),
		);
		for (const g of groups) {
			const m = (fn) => median(g.rows.map(fn));
			lines.push(
				`| ${g.engine} | ${g.rows.length} | ${mib(m((r) => r.stored.logical))} | ${mib(m((r) => r.stored.allocated))} | ${mib(m((r) => r.incremental.logical))} | ${mib(m((r) => r.incremental.allocated))} | ${m((r) => r.timings.insertMs).toFixed(1)} | ${m((r) => r.timings.readAllMs).toFixed(1)} | ${m((r) => r.timings.projectionMs).toFixed(1)} |`,
			);
			csv.push(
				[
					profile,
					n,
					g.engine,
					g.rows.length,
					m((r) => r.stored.logical),
					m((r) => r.stored.allocated),
					m((r) => r.incremental.logical),
					m((r) => r.incremental.allocated),
					...[
						"insertMs",
						"maintenanceMs",
						"readAllMs",
						"projectionMs",
						"point20Ms",
						"update5Ms",
						"delete5Ms",
					].map((k) => m((r) => r.timings[k])),
				].join(","),
			);
		}
		lines.push(
			"",
			"| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |",
			"|---|---:|---:|---:|---:|---:|",
		);
		for (const g of groups) {
			const m = (k) => median(g.rows.map((r) => r.timings[k])).toFixed(1);
			const inserts = g.rows.map((r) => r.timings.insertMs);
			lines.push(
				`| ${g.engine} | ${m("point20Ms")} | ${m("update5Ms")} | ${m("delete5Ms")} | ${m("maintenanceMs")} | ${Math.min(...inserts).toFixed(1)}–${Math.max(...inserts).toFixed(1)} |`,
			);
		}
		lines.push("");
	}
lines.push(
	"## Failures (excluded from rankings)",
	"",
	failures.length
		? failures
				.map((f) => `- ${f.id}: ${f.error ?? f.signal ?? `exit ${f.status}`}`)
				.join("\n")
		: "None.",
	"",
	"`inibase-gzip-patched` is an unreleased experiment, not the published iniBase package. See [patch details](../../patches/README.md). Native PostgreSQL/MongoDB and patched iniBase were collected in a separate sequential phase when metadata.phases is present; all phase metadata is retained.",
	"",
	"The complete samples, configuration, checksums, input sizes, churn footprints, and RSS measurements are preserved in JSON. Do not infer cloud prices or universal winners from this run.",
	"",
);
await writeFile(join(output, "REPORT.md"), lines.join("\n"));
await writeFile(join(output, "summary.csv"), csv.join("\n") + "\n");
console.log(`Report written to ${join(output, "REPORT.md")}`);
