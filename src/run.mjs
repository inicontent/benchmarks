import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { resolve, join } from "node:path";
import os from "node:os";
import { engines as allEngines } from "./adapters.mjs";
import { profiles as allProfiles } from "./data.mjs";
const options = Object.fromEntries(
	process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")),
);
const sizes = (options.rows ?? "1000,10000").split(",").map(Number);
const repeats = Number(options.repeats ?? 3);
const engines = options.engines?.split(",") ?? allEngines;
const profiles = options.profiles?.split(",") ?? allProfiles;
if (
	sizes.some((n) => !Number.isSafeInteger(n) || n < 20) ||
	!Number.isSafeInteger(repeats) ||
	repeats < 1
)
	throw new Error("Use integer rows >=20 and repeats >=1");
if (
	engines.some((e) => !allEngines.includes(e)) ||
	profiles.some((p) => !allProfiles.includes(p))
)
	throw new Error("Unknown engine/profile");
const output = resolve(options.output ?? "results/latest");
await mkdir(output, { recursive: true });
const runId = new Date().toISOString().replaceAll(":", "-");
const work = resolve(".work", runId);
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const metadata = {
	runId,
	node: process.version,
	platform: process.platform,
	arch: process.arch,
	os: os.release(),
	cpu: os.cpus()[0]?.model,
	cores: os.cpus().length,
	ramBytes: os.totalmem(),
	sizes,
	repeats,
	engines,
	profiles,
	dependencies: pkg.dependencies,
	batchSize: 1000,
	seed: 42,
	iniBaseDurability: "full",
	concurrency: 1,
};
await writeFile(
	join(output, "environment.json"),
	JSON.stringify(metadata, null, 2) + "\n",
);
const results = [],
	failures = [];
for (const n of sizes)
	for (const profile of profiles)
		for (let repeat = 0; repeat < repeats; repeat++) {
			// Rotate engine order to reduce a systematic first/last engine bias.
			const ordered = engines
				.slice(repeat % engines.length)
				.concat(engines.slice(0, repeat % engines.length));
			for (const engine of ordered) {
				const id = `${engine}-${profile}-${n}-${repeat + 1}`;
				const destination = join(output, `${id}.json`);
				const directory = join(work, id);
				console.log(`Running ${id}`);
				const child = spawnSync(
					process.execPath,
					[
						"src/worker.mjs",
						engine,
						profile,
						String(n),
						directory,
						destination,
					],
					{
						encoding: "utf8",
						timeout: 300000,
						maxBuffer: 2 * 1024 * 1024,
						env: {
							...process.env,
							INIBASE_DURABILITY: "full",
							INIBASE_CACHE: "false",
							INIBASE_COMPRESSION: "false",
						},
					},
				);
				if (child.status === 0) {
					const result = JSON.parse(await readFile(destination, "utf8"));
					results.push({ ...result, repeat: repeat + 1 });
					console.log(child.stdout.trim());
				} else {
					failures.push({
						id,
						status: child.status,
						signal: child.signal,
						error: child.error?.message,
						stdout: child.stdout,
						stderr: child.stderr,
					});
					console.error(`FAILED ${id}: ${child.stderr?.slice(-1200)}`);
				}
				await writeFile(
					join(output, "results.json"),
					JSON.stringify({ metadata, results, failures }, null, 2) + "\n",
				);
				await rm(directory, { recursive: true, force: true });
			}
		}
const report = spawnSync(process.execPath, ["src/report.mjs", output], {
	stdio: "inherit",
});
if (report.status || failures.length) process.exitCode = 1;
