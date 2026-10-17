# Local iniBase optimization experiment

This experiment is **not a completed qualification against all requested constraints**.
The implementation adds incremental log replay, disk-backed overlays, seekable
compressed columns, disk indexes and opt-in tombstones. Hard total-working-memory
accounting and bounded-I/O/latency compaction remain incomplete. Group commit is
not implemented. No universal SQLite superiority is claimed.

The historical `src/run.mjs`, adapters, fixtures and prior results are unchanged.
New workloads are implemented in `src/local-*.mjs` and labeled with their own
workload version. Do not mix their timings with historical fixture timings.

## Source and environment

* Baseline engine: `917cc6f062b23e5cb45e77bdd0f82848d8086666`, iniBase 3.8.0 plus
  the pre-existing local sparse-reader/release-validation commits.
* Candidate storage engine: `18fba6e` plus its ancestor durability fix `8a3e35a`;
  exact full commit and compiled module-tree hashes are in each environment JSON.
* Historical benchmark source: `11123a511e1c5dc2dce0b80f113ab1f65c02093d`.
* Apple M5, 10 cores, 16 GiB RAM, arm64; macOS 27.0.1 (26A434); Node 26.9.0;
  pnpm 10.33.0; bundled SQLite 3.53.4. Filesystem and dependency/lock/source
  identities are recorded in `results/local-optimization/*provenance.json`.
* No dependency replacement, alternative storage engine, publish, push or deployment.
  Baseline and candidate load explicit local compiled module paths, not the registry
  `inibase` dependency. Every `.js` module is hashed, not just the entrypoint.

## Workloads and fairness

Version-2 local comparisons store the same six application fields: `seq`, random
deterministic string `key`, `title`, `category`, `body`, and `score`. Compact,
repetitive CMS and high-entropy hexadecimal controls use the same generator for
every engine. Sizes are 1k/10k/100k; the larger CMS/entropy data exceed the configured
16 MiB cache budget. Generated native metadata, indexes and logs count toward disk.

Configurations:

* `baseline`: frozen local baseline, gzip + update log, query caching disabled.
* `optimized`: candidate gzip + seekable columns + log/tombstones, no application-key
  index. Application-key queries are deliberately still non-indexed filtering.
* `indexed`: candidate plus application `seq` and `key` disk indexes.
* `sqlite`: native Node SQLite, `seq` primary key and `key` index, prepared statements,
  WAL, FULL synchronous, 16 MiB page-cache setting. Actual PRAGMAs are retained.

All new comparisons use full durability. The candidate retains the pre-existing
restriction on transactions for log tables; ordinary seekable legacy tables still
support existing transactions. Equal feature coverage between benchmark configurations
must not be inferred from equal application data.

Each trial has a fresh directory and separate worker. Engines run sequentially,
with rotated order across repetitions. Three trials provide descriptive medians,
not statistical confidence intervals. OS filesystem pages are **not evicted**;
reopen is not a cold-disk test. Other host activity is not controlled.

Bulk inserts commit batches of 1,000, excluding separately recorded deterministic
fixture-generation time. A separate 32-row fixture measures individual durable
inserts; its complete storage is counted. Full reads and projections are checked.
Random, sequential, missing and hot-key samples are retained. Lookup quantiles
exclude correctness assertions, whose time is retained separately. Adapters and
query-key construction remain included.

The workload additionally measures individual durable updates/deletes, up to
1,024 pending bulk updates and 256 pending deletes, reads against those states,
and a bounded mixed micro-workload with three explicit compactions/checkpoints
plus any automatic backpressure maintenance. It is **not** a production-length
steady-state endurance run. SQLite checkpoints rather than VACUUMs in these new
cases; historical maintenance remains untouched. All maintenance elapsed time in
the mixed phase is retained. Reopen and complete post-churn verification follow.

## Measurement limits

* Raw per-operation samples support p50/p95; p99 is withheld below 1,000 samples.
  The separate tail-latency runs use larger sample counts. Quantiles are empirical.
* The parent samples process-tree RSS and total logical database footprint every
  100 ms. Samples can miss short peaks; raw timestamps, phase markers and failures
  are retained. Worker `resourceUsage().maxRSS`, CPU and available I/O counters are
  also retained. CPU counters are worker-only, not aggregate subprocess CPU.
* RSS includes runtime, fixture/input buffers, caller-requested materialized results,
  verification and engine memory. Runtime baseline and cache accounting are separate.
  Do not present cache-accounting bytes as total engine memory. Several transient
  buffers, metadata caches and concurrent operation paths remain outside the budget.
* Workers use `--max-old-space-size=512`. This enforces a V8 heap limit, **not** a
  process-tree RSS cap. A Linux cgroup limit was not available in this local macOS
  run. No unsupported RSS-limit claim is made.
* Logical and allocated bytes include all regular files. Directory metadata and
  runtime/package binaries are excluded. APFS sparse allocation matters, especially
  for numeric ID directories after churn.
* Peak full-directory footprint is sampled. Exact peak temporary bytes, physical
  device bytes and complete read/write amplification are not qualified. Darwin I/O
  counters that report zero are retained, not interpreted as zero physical I/O.
* Profiling runs separately wrap filesystem/subprocess/codec calls and retain CPU
  profiles. They are diagnostic runs, **not** the normal throughput samples.

## Correctness and recovery

The unchanged baseline passed 393 existing tests. The candidate's final main suite
passed 411, plus 11 process/recovery cases and two journal-hardening cases. Raw
outputs and commands are under `results/local-optimization/final-correctness/`.
SIGKILL cases cover append, post-sync, acknowledgment, compaction and migration
publication; concurrent processes cover key changes, deletes, uniqueness and
compaction. These are **process-crash tests, not power-loss qualification**.

Early failures are retained: an exploratory overlay benchmark ran while development
was starting; a temporary custom-ID validation regression was caught and corrected;
the first profiling wrapper lost Node's custom promisify contract and was corrected.
Use the isolated baseline and final comparison directories for performance conclusions,
not the early exploratory runs. Successful worker databases are removed after raw
results are saved; failed databases remain under `.work/` for investigation.

## Reproduce

From `../inibase`, build without the formatting prebuild hook:

```sh
pnpm exec tsc
pnpm test
pnpm exec tsx tests/storage-process.test.ts
pnpm exec tsx tests/journal-hardening.test.ts
```

Reconstruct the frozen baseline inside this benchmark repository without changing
the working engine checkout:

```sh
mkdir -p .work/reproduced-baseline
git -C ../inibase archive 917cc6f062b23e5cb45e77bdd0f82848d8086666 | tar -x -C .work/reproduced-baseline
ln -s "$(realpath ../inibase/node_modules)" .work/reproduced-baseline/node_modules
node ../inibase/node_modules/typescript/bin/tsc -p .work/reproduced-baseline/tsconfig.json
```

Run the additional matrix from this repository:

```sh
node src/local-run.mjs \
  --baseline="$PWD/.work/reproduced-baseline/dist/index.js" \
  --optimized="$(realpath ../inibase/dist/index.js)" \
  --baselineCommit=917cc6f062b23e5cb45e77bdd0f82848d8086666 \
  --optimizedCommit="$(git -C ../inibase rev-parse HEAD)" \
  --rows=1000,10000,100000 --profiles=compact,cms,mixed \
  --repeats=3 --samples=128 --writes=32 \
  --output=results/reproduced-local-comparison
node src/local-report.mjs results/reproduced-local-comparison
```

Use `--engines=indexed,sqlite --samples=1024` for larger lookup tails;
`--blockBytes=65536`, `131072`, or `262144` for block-size controls;
`--instrument=true` for separate filesystem/codec counts and `.cpuprofile` files.
Use a new output path for every reproduction; previous failures must not be erased.

The unmodified historical runner still defaults to its pinned published dependency.
For the recorded historical-local baseline, only its temporary adapter import path
was redirected to the frozen local module; workloads and settings were not altered.
The redirect and artifact hashes are described by the provenance artifacts.

## Remaining priorities

1. Shared reservations for **all** engine working memory, operation concurrency,
   wide-schema reads, metadata, sorts and large-value/frame processing.
2. Segmented crash-safe compaction with bounded I/O and reader-safe reclamation;
   current streaming rewrites remain whole-column and hold the writer lock.
3. Incremental/COW application indexes for inserts, paged secondary delta indexes,
   and dense disk ID structures for sparse/high-churn ID ranges.
4. Broader schema/DDL/index lifecycle, large-value, platform and actual power-loss
   qualification. Automatic index rebuild across every DDL shape is not claimed.
5. Evaluate bounded group commit with a proven cross-process coordinator after
   reducing write amplification. No synchronization or locking is disabled here.
