# Measured results

Run: 2026-10-11T09-21-50.365Z. Apple M5; darwin/arm64; Node v26.9.0.

Each cell is a median of 3 independent runs when complete. All successful runs passed full-content SHA-256 verification, projected-content verification, and CRUD checks.

**Scope:** local embedded engines and loopback-only native servers, synthetic fixtures, one table, no replicas or backups. PGlite is PostgreSQL in WASM, not a production PostgreSQL server. LevelDB/LMDB are key-value engines. Timings include adapter/API work and are not feature-equivalent server benchmarks.

Storage is measured after each engine’s documented maintenance and clean close. Both total footprint and growth over an empty database are reported. Physical allocation uses stat.blocks × 512 (not an invoice, and may differ with APFS compression/clones). No OS cache eviction; reads are cache-affected. RSS includes fixtures, JS/WASM runtime, and result verification; native server child memory is excluded. Sparse file logical lengths are not physical disk consumption.

## cms — 100,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| inibase-gzip | 3 | 1.622 | 1.637 | 1.621 | 1.633 | 3223.0 | 211.1 | 44.3 |
| leveldb | 3 | 15.295 | 15.387 | 15.295 | 15.375 | 281.1 | 186.9 | 166.2 |
| lmdb-lz4 | 3 | 18.914 | 19.387 | 18.875 | 19.344 | 1391.6 | 140.0 | 111.7 |
| mongodb | 3 | 211.291 | 21.918 | 10.988 | 21.555 | 616.3 | 330.6 | 82.5 |
| duckdb | 3 | 48.512 | 48.762 | 48.250 | 48.500 | 849.1 | 137.5 | 18.9 |
| inibase | 3 | 127.597 | 127.613 | 127.596 | 127.609 | 6039.7 | 178.1 | 47.1 |
| sqlite | 3 | 130.539 | 130.539 | 130.531 | 130.531 | 299.9 | 91.0 | 38.2 |
| lmdb | 3 | 149.352 | 149.355 | 149.313 | 149.313 | 544.1 | 138.9 | 86.4 |
| pglite | 3 | 314.445 | 314.488 | 276.422 | 276.422 | 855.7 | 322.7 | 131.2 |
| postgresql | 3 | 315.618 | 315.668 | 276.430 | 276.430 | 467.1 | 76.5 | 17.6 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| inibase-gzip | 1309.4 | 4270.3 | 1655.4 | 0.0 | 3003.7–3228.9 |
| leveldb | 0.5 | 0.7 | 0.3 | 2.6 | 264.7–283.6 |
| lmdb-lz4 | 0.3 | 19.2 | 20.0 | 0.0 | 1374.7–1392.5 |
| mongodb | 6.7 | 18.4 | 20.4 | 45.0 | 615.5–624.9 |
| duckdb | 3.7 | 2.0 | 0.8 | 199.4 | 846.4–856.5 |
| inibase | 1011.9 | 598.6 | 949.3 | 0.0 | 5934.9–6912.0 |
| sqlite | 0.4 | 0.7 | 0.3 | 394.6 | 298.0–301.9 |
| lmdb | 0.3 | 18.3 | 19.1 | 0.1 | 522.3–545.1 |
| pglite | 3.4 | 1.3 | 0.6 | 104.8 | 837.4–870.4 |
| postgresql | 1.9 | 1.1 | 0.5 | 104.7 | 466.1–467.7 |

## Failures (excluded from rankings)

None.

iniBase version: 3.7.0. Published package, without runtime patches.

The complete samples, configuration, checksums, input sizes, churn footprints, and RSS measurements are preserved in JSON. Do not infer cloud prices or universal winners from this run.
