# Measured results

Run: 2026-10-11T19-14-49.144Z. Apple M5; darwin/arm64; Node v26.9.0.

Each cell is a median of 3 independent runs when complete. All successful runs passed full-content SHA-256 verification, projected-content verification, and CRUD checks.

**Scope:** local embedded engines and loopback-only native servers, synthetic fixtures, one table, no replicas or backups. PGlite is PostgreSQL in WASM, not a production PostgreSQL server. LevelDB/LMDB are key-value engines. Timings include adapter/API work and are not feature-equivalent server benchmarks.

Storage is measured after each engine’s documented maintenance and clean close. Both total footprint and growth over an empty database are reported. Physical allocation uses stat.blocks × 512 (not an invoice, and may differ with APFS compression/clones). No OS cache eviction; reads are cache-affected. RSS includes fixtures, JS/WASM runtime, and result verification; native server child memory is excluded. Sparse file logical lengths are not physical disk consumption.

## cms — 100,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| inibase-gzip | 3 | 1.622 | 1.637 | 1.621 | 1.633 | 3141.9 | 258.7 | 63.1 |
| inibase-gzip-log | 3 | 1.622 | 1.641 | 1.621 | 1.633 | 3194.7 | 257.6 | 64.1 |
| leveldb | 3 | 15.295 | 15.387 | 15.295 | 15.375 | 316.7 | 231.3 | 227.0 |
| lmdb-lz4 | 3 | 18.914 | 19.449 | 18.875 | 19.406 | 1552.2 | 170.7 | 135.1 |
| mongodb | 3 | 211.241 | 22.523 | 10.938 | 22.160 | 636.2 | 408.6 | 113.7 |
| duckdb | 3 | 47.012 | 47.512 | 46.750 | 47.250 | 1051.2 | 171.5 | 23.6 |
| inibase | 3 | 127.597 | 127.613 | 127.596 | 127.609 | 6629.7 | 229.7 | 58.9 |
| inibase-log | 3 | 127.597 | 127.617 | 127.596 | 127.609 | 7305.5 | 257.8 | 64.9 |
| sqlite | 3 | 130.539 | 130.539 | 130.531 | 130.531 | 358.5 | 113.9 | 47.7 |
| lmdb | 3 | 149.352 | 149.355 | 149.313 | 149.313 | 522.3 | 167.7 | 113.2 |
| postgresql | 3 | 315.618 | 315.668 | 276.430 | 276.430 | 580.7 | 105.3 | 26.1 |
| pglite | 3 | 314.445 | 327.637 | 276.422 | 289.570 | 1084.9 | 421.3 | 168.3 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| inibase-gzip | 1661.8 | 5174.4 | 1932.1 | 0.0 | 2482.4–3437.7 |
| inibase-gzip-log | 1588.0 | 175.1 | 3273.6 | 0.0 | 2593.7–3463.3 |
| leveldb | 0.6 | 0.8 | 0.5 | 3.0 | 299.6–324.4 |
| lmdb-lz4 | 0.4 | 20.0 | 20.0 | 0.0 | 1515.1–1587.7 |
| mongodb | 7.2 | 18.1 | 20.2 | 148.8 | 635.6–666.1 |
| duckdb | 3.9 | 2.4 | 0.9 | 231.0 | 1041.8–1090.8 |
| inibase | 1296.4 | 738.8 | 1208.2 | 0.0 | 6572.7–7599.3 |
| inibase-log | 1313.9 | 178.2 | 1382.6 | 0.0 | 6764.8–9103.3 |
| sqlite | 0.4 | 0.7 | 0.3 | 497.6 | 352.8–377.9 |
| lmdb | 0.4 | 19.1 | 20.0 | 0.0 | 420.2–533.5 |
| postgresql | 2.4 | 1.0 | 0.5 | 124.6 | 546.9–589.4 |
| pglite | 4.5 | 1.7 | 0.7 | 135.4 | 1044.3–1099.0 |

## Failures (excluded from rankings)

None.

iniBase version: 3.8.0. Published package, without runtime patches.

The `inibase-log` and `inibase-gzip-log` configurations explicitly enable the published opt-in `log: true` setting. Other iniBase configurations retain the default rewrite path. The five updates do not measure sustained compaction amortization; the first subsequent delete may include automatic compaction. The main storage snapshot precedes updates and does not measure peak update-log space. Update-log tables currently restrict transactions and schema changes; these capabilities are not exercised here.

The complete samples, configuration, checksums, input sizes, churn footprints, and RSS measurements are preserved in JSON. Do not infer cloud prices or universal winners from this run.
