# Methodology and limitations

## Disclosure

This benchmark is maintained by iniBase's developer organization. It deliberately includes a compressible CMS workload relevant to iniContent, plus equally visible high-entropy and compact-record controls. Results are evidence about these exact workloads and implementations, not a claim that one database is best at everything.

## Data and correctness

Fixtures are generated deterministically from seed 42. All adapters store the same five application fields: numeric `seq`, `title`, `category`, `body`, and numeric `score`. Each synthetic dataset is regenerated independently for every trial. Every loaded row is read back after a close/reopen and hashed in numeric sequence order, including every application field. Projections are independently hashed. Point results, updates, and the entire remaining dataset after deletion are checked.

iniBase adds its native generated ID and timestamps if the engine supplies them; MongoDB adds `_id=seq`; SQL uses `seq` as the primary key; LevelDB and LMDB use `seq` as the native key and also retain it in the stored value. Extra native metadata is included in the disk footprint. iniBase mutates the caller's column-selection array, so the adapter passes a copy. Input rows are copied where APIs can mutate them. Native keys/indexes are retained, not disabled to make another engine slower.

The `mixed` fixture is high-entropy hexadecimal text, not natural-language prose or encrypted binary. `cms` repeats one paragraph across records and is intentionally very compressible. `compact` has short bodies. The corpus does not include media blobs, large joins, nullable fields, many tables, or production distributions. Its schema and generation are public in `src/data.mjs`.

## Writes and durability

Bulk loading commits batches of up to 1,000 rows. SQL uses prepared parameters or a multi-row statement; DuckDB uses its native appender in a transaction; LevelDB uses a sync batch; LMDB uses one transaction and awaits `flushed`; iniBase uses one bulk post per batch. MongoDB uses insertMany with `{w:1,j:true}`; this acknowledges the journal but does not give the whole batch the same transactional semantics as SQL.

iniBase explicitly runs with `INIBASE_DURABILITY=full` and persistent caching off. SQLite uses WAL and FULL synchronous. PostgreSQL uses fsync, synchronous_commit and full_page_writes. PGlite uses `relaxedDurability:false`. LMDB does not enable noSync. None of these settings is independently validated by simulated power failures; the benchmark checks clean reopen persistence, not crash safety. No replicas, high availability, or distributed commits are measured.

Insert timings include adapters, serialization and the commit/flush promises. Fixture generation, database initialization, validation hashing and maintenance are excluded from insert timing. Implementations are representative bulk APIs, not an exhaustive search over each engine's fastest possible loading path (for example PostgreSQL COPY is not used).

## Storage accounting

1. Initialize the empty table/collection, run maintenance, close the engine, and measure the complete engine directory.
2. Reopen and load records; sample file size immediately after insertion.
3. Run engine maintenance, cleanly close, and measure again. This is the main storage snapshot.
4. Reopen, measure reads/projection/lookups/updates/deletes, verify the remaining data, maintain and close, and measure post-churn storage.

Maintenance: SQLite checkpoint + VACUUM + checkpoint; DuckDB CHECKPOINT; PostgreSQL/PGlite VACUUM ANALYZE and CHECKPOINT; LevelDB full-range compactRange; MongoDB fsync followed by clean shutdown; LMDB flush; iniBase completes its own journaled operations without an extra maintenance call. These are documented routine operations, not identical compaction algorithms. LMDB copy-compaction and MongoDB explicit collection compaction are not used. Maintenance duration is published; comparing insert+maintenance is useful for sustained ingestion.

Every regular file under the engine directory is counted, including schemas, journals/WAL, lock files, indexes and database catalogs. Runtime/package binaries and replicas/backups are excluded. Native PostgreSQL is a whole dedicated cluster; PGlite is a whole WASM PostgreSQL data directory; MongoDB is a whole standalone WiredTiger instance. Empty baselines and incremental changes are reported alongside totals to expose fixed overhead. A negative incremental value, if observed, is retained rather than clipped because maintenance can reclaim preallocated files.

`logical` = sum of file lengths. `allocated` = sum of `stat.blocks * 512`. Directories' own metadata is not counted. APFS sparse files, cloning, compression and filesystem accounting can affect these values; neither metric is an actual cloud invoice. The after-insert sample is **not** a continuously sampled peak-space measurement. Temporary peak disk use and bytes written over time remain unmeasured.

## Queries and environment

Full reads materialize all five application fields in JavaScript. Projection materializes only `seq` and `category`; row-oriented key-value adapters must decode values to do this. All SQL systems and key-value engines use their native primary key for point lookups. iniBase filters on the application's `seq` field. This intentionally tests the same application query, not identical execution plans. No category/secondary index is added.

Read timings are affected by the OS cache: closing a database does not evict filesystem pages. `warmReadAllMs` records a second read, but the first read must not be advertised as cold disk. Reads follow bulk ingestion, the workload is sequential and single-client, and background system activity is uncontrolled. There is no concurrency, remote network, connection-pool, multi-tenant, or long-running steady-state test.

Each trial uses a separate Node worker. Native PostgreSQL and MongoDB additionally have child server processes and loopback IPC. PGlite runs WASM and must not be labeled native PostgreSQL. `maxRssBytes` is the Node worker's peak RSS, including dataset construction/results/hashing; **native server child RSS is excluded**, so RSS must not be used as a cross-engine memory-efficiency ranking.

The runner rotates engine order by repetition, does not run engines concurrently, and records every completed sample and failure. Three repetitions give descriptive medians/ranges, not statistical confidence intervals. The fixtures and package lock make input/dependencies reproducible; timing values remain host-dependent.

## References

- [iniBase](https://github.com/inicontent/inibase)
- [SQLite synchronous modes](https://www.sqlite.org/pragma.html#pragma_synchronous)
- [DuckDB Node API](https://duckdb.org/docs/stable/clients/node_neo/overview)
- [PGlite API](https://pglite.dev/docs/api)
- [LMDB Node bindings](https://github.com/kriszyp/lmdb-js)
- [classic-level](https://github.com/Level/classic-level)
- [Embedded PostgreSQL launcher](https://github.com/leinelissen/embedded-postgres)
- [MongoDB launcher](https://typegoose.github.io/mongodb-memory-server/)

## Version transition to 3.7.0

The current suite pins published iniBase 3.7.0 and uses no runtime patch. Historical 3.6.0 samples remain in `results/v3.6.0` and `results/v3.6.0-large-cms`, with their original metadata, failures, and patch labels. The current matrix reruns every competitor; it does not combine older competitor timings with new iniBase samples. Workloads, durability, caching, and application queries are unchanged. MongoDB now receives an explicitly allocated loopback port after a smoke-run port collision; storage and query settings are unchanged. Historical-versus-current lookup comparisons are separate-session observations on the same host, with uncontrolled OS cache and background activity.
