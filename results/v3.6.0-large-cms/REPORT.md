# Measured results

Run: 2026-10-10T19-09-06.380Z. Apple M5; darwin/arm64; Node v26.9.0.

Each cell is a median of 3 independent runs when complete. All successful runs passed full-content SHA-256 verification, projected-content verification, and CRUD checks.

**Scope:** local embedded engines and loopback-only native servers, synthetic fixtures, one table, no replicas or backups. PGlite is PostgreSQL in WASM, not a production PostgreSQL server. LevelDB/LMDB are key-value engines. Timings include adapter/API work and are not feature-equivalent server benchmarks.

Storage is measured after each engine’s documented maintenance and clean close. Both total footprint and growth over an empty database are reported. Physical allocation uses stat.blocks × 512 (not an invoice, and may differ with APFS compression/clones). No OS cache eviction; reads are cache-affected. RSS includes fixtures, JS/WASM runtime, and result verification; native server child memory is excluded. Sparse file logical lengths are not physical disk consumption.

## cms — 100,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| inibase-gzip-patched | 3 | 1.622 | 1.637 | 1.621 | 1.633 | 3299.7 | 212.4 | 44.2 |
| leveldb | 3 | 15.295 | 15.387 | 15.295 | 15.375 | 283.6 | 194.0 | 187.9 |
| lmdb-lz4 | 3 | 18.914 | 19.574 | 18.875 | 19.531 | 1387.0 | 143.0 | 113.0 |
| mongodb | 3 | 211.315 | 22.332 | 11.011 | 21.922 | 595.3 | 338.4 | 82.1 |
| duckdb | 3 | 47.512 | 47.762 | 47.250 | 47.500 | 871.9 | 138.3 | 19.1 |
| inibase | 3 | 127.597 | 127.613 | 127.596 | 127.609 | 6377.8 | 181.7 | 48.5 |
| sqlite | 3 | 130.539 | 130.539 | 130.531 | 130.531 | 316.5 | 95.3 | 46.6 |
| lmdb | 3 | 149.352 | 149.355 | 149.313 | 149.313 | 547.7 | 140.3 | 86.6 |
| pglite | 3 | 314.445 | 314.488 | 276.422 | 276.422 | 874.0 | 341.0 | 138.3 |
| postgresql | 3 | 315.618 | 315.668 | 276.430 | 276.430 | 499.9 | 82.4 | 17.2 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| inibase-gzip-patched | 87889.5 | 4352.3 | 1659.4 | 0.0 | 2946.6–3364.3 |
| leveldb | 0.5 | 0.6 | 0.3 | 2.7 | 268.8–300.7 |
| lmdb-lz4 | 0.3 | 20.2 | 19.9 | 0.0 | 1379.3–1388.9 |
| mongodb | 7.0 | 20.3 | 19.4 | 42.8 | 590.8–609.8 |
| duckdb | 3.6 | 2.3 | 0.8 | 207.7 | 851.6–1124.5 |
| inibase | 90640.6 | 663.7 | 1006.5 | 0.0 | 6188.5–7065.5 |
| sqlite | 0.4 | 0.7 | 0.3 | 422.2 | 315.8–319.9 |
| lmdb | 0.3 | 19.1 | 19.9 | 0.0 | 530.5–551.7 |
| pglite | 3.5 | 1.3 | 0.6 | 109.3 | 858.4–896.4 |
| postgresql | 2.2 | 1.0 | 0.5 | 105.6 | 497.1–509.1 |

## Failures (excluded from rankings)

- inibase-gzip-cms-100000-1: exit 1
- inibase-gzip-cms-100000-2: exit 1
- inibase-gzip-cms-100000-3: exit 1

`inibase-gzip-patched` is an unreleased experiment, not the published iniBase package. See [patch details](../../patches/README.md). Native PostgreSQL/MongoDB and patched iniBase were collected in a separate sequential phase when metadata.phases is present; all phase metadata is retained.

The complete samples, configuration, checksums, input sizes, churn footprints, and RSS measurements are preserved in JSON. Do not infer cloud prices or universal winners from this run.
