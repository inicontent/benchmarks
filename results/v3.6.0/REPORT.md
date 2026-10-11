# Measured results

Run: 2026-10-10T19-03-20.447Z. Apple M5; darwin/arm64; Node v26.9.0.

Each cell is a median of 3 independent runs when complete. All successful runs passed full-content SHA-256 verification, projected-content verification, and CRUD checks.

**Scope:** local embedded engines and loopback-only native servers, synthetic fixtures, one table, no replicas or backups. PGlite is PostgreSQL in WASM, not a production PostgreSQL server. LevelDB/LMDB are key-value engines. Timings include adapter/API work and are not feature-equivalent server benchmarks.

Storage is measured after each engine’s documented maintenance and clean close. Both total footprint and growth over an empty database are reported. Physical allocation uses stat.blocks × 512 (not an invoice, and may differ with APFS compression/clones). No OS cache eviction; reads are cache-affected. RSS includes fixtures, JS/WASM runtime, and result verification; native server child memory is excluded. Sparse file logical lengths are not physical disk consumption.

## cms — 1,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| inibase-gzip | 3 | 0.017 | 0.043 | 0.016 | 0.039 | 53.0 | 7.5 | 1.7 |
| inibase-gzip-patched | 3 | 0.017 | 0.043 | 0.016 | 0.039 | 51.0 | 7.6 | 1.7 |
| leveldb | 3 | 0.155 | 0.172 | 0.155 | 0.160 | 3.4 | 2.6 | 1.8 |
| lmdb-lz4 | 3 | 0.242 | 0.246 | 0.203 | 0.203 | 16.5 | 2.7 | 1.2 |
| mongodb | 3 | 200.519 | 0.656 | 0.215 | 0.293 | 10.5 | 7.0 | 2.7 |
| duckdb | 3 | 1.012 | 1.012 | 0.750 | 0.750 | 2.0 | 2.1 | 1.0 |
| inibase | 3 | 1.269 | 1.285 | 1.268 | 1.281 | 48.1 | 6.7 | 1.5 |
| sqlite | 3 | 1.313 | 1.313 | 1.305 | 1.305 | 2.5 | 0.7 | 0.2 |
| lmdb | 3 | 1.477 | 1.480 | 1.438 | 1.438 | 10.5 | 2.4 | 0.9 |
| pglite | 3 | 39.391 | 39.434 | 1.367 | 1.367 | 10.2 | 4.8 | 1.6 |
| postgresql | 3 | 40.563 | 40.613 | 1.375 | 1.375 | 7.3 | 2.0 | 0.4 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| inibase-gzip | 1197.7 | 214.3 | 225.7 | 0.0 | 50.8–53.9 |
| inibase-gzip-patched | 1214.3 | 209.2 | 243.2 | 0.0 | 50.0–52.1 |
| leveldb | 0.6 | 0.4 | 0.2 | 1.4 | 3.3–3.5 |
| lmdb-lz4 | 0.3 | 19.7 | 19.9 | 0.0 | 16.4–16.9 |
| mongodb | 4.0 | 18.0 | 20.1 | 39.2 | 9.3–10.7 |
| duckdb | 3.2 | 1.0 | 0.9 | 3.7 | 2.0–3.6 |
| inibase | 1134.8 | 176.7 | 206.4 | 0.0 | 47.7–48.9 |
| sqlite | 0.3 | 0.3 | 0.2 | 4.2 | 2.5–2.6 |
| lmdb | 0.3 | 19.7 | 19.9 | 0.0 | 8.3–11.4 |
| pglite | 3.8 | 1.4 | 0.7 | 3.5 | 10.1–10.7 |
| postgresql | 2.3 | 0.9 | 0.5 | 4.0 | 6.8–7.7 |

## mixed — 1,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| inibase-gzip | 3 | 0.706 | 0.730 | 0.705 | 0.727 | 71.1 | 10.4 | 1.7 |
| inibase-gzip-patched | 3 | 0.706 | 0.730 | 0.705 | 0.727 | 70.9 | 10.2 | 1.7 |
| duckdb | 3 | 1.262 | 1.262 | 1.000 | 1.000 | 2.2 | 2.4 | 0.3 |
| inibase | 3 | 1.271 | 1.285 | 1.270 | 1.281 | 49.9 | 6.7 | 1.6 |
| sqlite | 3 | 1.313 | 1.313 | 1.305 | 1.305 | 2.6 | 0.6 | 0.2 |
| leveldb | 3 | 1.329 | 1.348 | 1.329 | 1.336 | 2.8 | 2.3 | 1.7 |
| lmdb | 3 | 1.477 | 1.480 | 1.438 | 1.438 | 8.3 | 2.4 | 1.1 |
| lmdb-lz4 | 3 | 1.586 | 1.590 | 1.547 | 1.547 | 18.9 | 2.7 | 1.1 |
| mongodb | 3 | 201.655 | 2.965 | 1.352 | 2.602 | 11.9 | 7.8 | 1.5 |
| pglite | 3 | 39.391 | 39.434 | 1.367 | 1.367 | 10.3 | 4.6 | 1.5 |
| postgresql | 3 | 40.563 | 40.613 | 1.375 | 1.375 | 6.7 | 1.8 | 0.4 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| inibase-gzip | 1213.1 | 217.2 | 328.7 | 0.0 | 67.9–71.7 |
| inibase-gzip-patched | 1219.2 | 212.2 | 333.1 | 0.0 | 70.8–71.9 |
| duckdb | 3.1 | 1.0 | 0.8 | 3.8 | 1.9–2.2 |
| inibase | 1141.0 | 170.0 | 198.7 | 0.0 | 47.7–56.4 |
| sqlite | 0.2 | 0.4 | 0.2 | 4.3 | 2.5–3.0 |
| leveldb | 0.5 | 0.4 | 0.2 | 3.2 | 2.8–2.9 |
| lmdb | 0.2 | 19.6 | 20.2 | 0.0 | 8.1–9.6 |
| lmdb-lz4 | 0.2 | 18.6 | 20.0 | 0.0 | 17.7–19.2 |
| mongodb | 4.0 | 19.2 | 20.4 | 45.4 | 11.9–12.3 |
| pglite | 4.3 | 1.2 | 0.6 | 3.6 | 10.2–10.7 |
| postgresql | 2.3 | 0.9 | 0.6 | 3.7 | 6.7–6.7 |

## compact — 1,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| inibase-gzip | 3 | 0.010 | 0.035 | 0.010 | 0.031 | 50.1 | 6.3 | 1.6 |
| inibase-gzip-patched | 3 | 0.010 | 0.035 | 0.010 | 0.031 | 45.5 | 5.8 | 1.7 |
| sqlite | 3 | 0.051 | 0.051 | 0.043 | 0.043 | 0.7 | 0.3 | 0.2 |
| leveldb | 3 | 0.037 | 0.055 | 0.036 | 0.043 | 1.3 | 1.3 | 0.8 |
| inibase | 3 | 0.058 | 0.074 | 0.057 | 0.070 | 43.0 | 5.8 | 1.5 |
| lmdb | 3 | 0.148 | 0.152 | 0.109 | 0.109 | 9.3 | 2.3 | 0.7 |
| lmdb-lz4 | 3 | 0.148 | 0.152 | 0.109 | 0.109 | 6.5 | 2.4 | 0.7 |
| mongodb | 3 | 200.413 | 0.488 | 0.109 | 0.125 | 12.1 | 4.5 | 1.8 |
| duckdb | 3 | 0.762 | 0.762 | 0.500 | 0.500 | 1.4 | 1.5 | 0.5 |
| pglite | 3 | 38.156 | 38.199 | 0.133 | 0.133 | 3.9 | 3.2 | 1.4 |
| postgresql | 3 | 39.329 | 39.379 | 0.141 | 0.141 | 4.0 | 1.4 | 0.5 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| inibase-gzip | 376.7 | 218.0 | 215.9 | 0.0 | 47.6–50.9 |
| inibase-gzip-patched | 356.6 | 208.4 | 213.2 | 0.0 | 41.3–56.3 |
| sqlite | 0.2 | 0.3 | 0.2 | 0.5 | 0.7–0.7 |
| leveldb | 0.4 | 0.3 | 0.2 | 0.5 | 1.2–1.3 |
| inibase | 281.1 | 169.8 | 203.8 | 0.0 | 40.9–45.2 |
| lmdb | 0.3 | 19.7 | 20.0 | 0.0 | 7.1–10.2 |
| lmdb-lz4 | 0.3 | 20.3 | 19.9 | 0.0 | 5.2–7.4 |
| mongodb | 3.9 | 17.0 | 20.3 | 49.3 | 8.9–15.5 |
| duckdb | 2.9 | 1.0 | 0.8 | 1.9 | 1.3–1.7 |
| pglite | 3.3 | 1.3 | 0.7 | 2.8 | 3.7–4.1 |
| postgresql | 2.1 | 0.9 | 0.6 | 3.3 | 3.9–5.0 |

## cms — 10,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| inibase-gzip-patched | 3 | 0.161 | 0.188 | 0.161 | 0.184 | 339.8 | 34.6 | 6.8 |
| leveldb | 3 | 1.528 | 1.555 | 1.528 | 1.543 | 29.4 | 20.8 | 18.1 |
| lmdb-lz4 | 3 | 2.023 | 2.027 | 1.984 | 1.984 | 142.9 | 16.3 | 12.9 |
| mongodb | 3 | 201.819 | 2.848 | 1.516 | 2.484 | 66.7 | 42.4 | 9.9 |
| duckdb | 3 | 3.012 | 3.012 | 2.750 | 2.750 | 15.8 | 11.9 | 2.2 |
| inibase | 3 | 12.722 | 12.738 | 12.722 | 12.734 | 348.1 | 26.2 | 6.5 |
| sqlite | 3 | 13.063 | 13.063 | 13.055 | 13.055 | 32.3 | 6.6 | 3.6 |
| lmdb | 3 | 14.367 | 14.371 | 14.328 | 14.328 | 53.3 | 14.4 | 10.5 |
| pglite | 3 | 67.305 | 67.348 | 29.281 | 29.281 | 93.9 | 39.1 | 13.0 |
| postgresql | 3 | 68.477 | 68.527 | 29.290 | 29.289 | 55.1 | 10.2 | 2.1 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| inibase-gzip-patched | 9020.9 | 594.0 | 354.5 | 0.0 | 322.1–343.2 |
| leveldb | 1.4 | 0.6 | 0.2 | 3.1 | 28.0–32.0 |
| lmdb-lz4 | 0.3 | 20.1 | 19.9 | 0.0 | 141.5–143.1 |
| mongodb | 6.6 | 19.0 | 18.5 | 148.1 | 63.9–71.9 |
| duckdb | 3.1 | 1.0 | 0.7 | 21.5 | 15.5–18.3 |
| inibase | 8569.9 | 216.5 | 275.3 | 0.0 | 341.4–361.7 |
| sqlite | 0.4 | 0.5 | 0.2 | 44.5 | 31.4–34.2 |
| lmdb | 0.3 | 19.9 | 20.0 | 0.0 | 48.0–53.9 |
| pglite | 3.8 | 1.4 | 0.9 | 16.5 | 89.7–106.0 |
| postgresql | 2.4 | 0.8 | 0.5 | 16.0 | 49.3–65.2 |

## mixed — 10,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| duckdb | 3 | 7.012 | 7.012 | 6.750 | 6.750 | 17.0 | 14.6 | 1.8 |
| inibase-gzip-patched | 3 | 7.049 | 7.074 | 7.048 | 7.070 | 564.2 | 60.5 | 5.8 |
| inibase | 3 | 12.733 | 12.750 | 12.732 | 12.746 | 352.0 | 23.7 | 8.6 |
| sqlite | 3 | 13.063 | 13.063 | 13.055 | 13.055 | 34.2 | 7.1 | 5.0 |
| leveldb | 3 | 13.306 | 13.324 | 13.305 | 13.313 | 33.1 | 18.5 | 16.9 |
| lmdb | 3 | 14.367 | 14.371 | 14.328 | 14.328 | 53.3 | 15.0 | 10.5 |
| lmdb-lz4 | 3 | 15.758 | 15.762 | 15.719 | 15.719 | 171.8 | 14.5 | 10.9 |
| mongodb | 3 | 213.918 | 26.684 | 13.593 | 26.297 | 83.7 | 48.9 | 10.0 |
| pglite | 3 | 67.305 | 67.348 | 29.281 | 29.281 | 101.7 | 38.0 | 20.2 |
| postgresql | 3 | 68.477 | 68.527 | 29.290 | 29.289 | 51.1 | 8.3 | 1.8 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| duckdb | 3.3 | 1.0 | 0.8 | 18.7 | 16.0–17.4 |
| inibase-gzip-patched | 8516.6 | 586.5 | 1439.3 | 0.0 | 524.1–569.8 |
| inibase | 8833.8 | 228.2 | 279.2 | 0.0 | 343.6–362.9 |
| sqlite | 0.4 | 0.5 | 0.2 | 47.7 | 31.7–42.3 |
| leveldb | 1.1 | 0.7 | 0.9 | 12.4 | 32.0–34.6 |
| lmdb | 0.3 | 19.8 | 17.9 | 0.0 | 44.1–53.8 |
| lmdb-lz4 | 0.3 | 19.4 | 19.9 | 0.0 | 167.6–187.5 |
| mongodb | 4.4 | 18.6 | 20.1 | 144.0 | 82.8–86.5 |
| pglite | 4.3 | 1.6 | 0.8 | 17.9 | 98.3–114.9 |
| postgresql | 2.5 | 0.9 | 0.5 | 16.6 | 49.9–52.0 |

## compact — 10,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| inibase-gzip | 3 | 0.096 | 0.121 | 0.095 | 0.117 | 386.7 | 19.8 | 5.8 |
| inibase-gzip-patched | 3 | 0.096 | 0.121 | 0.095 | 0.117 | 319.0 | 23.1 | 6.0 |
| leveldb | 3 | 0.357 | 0.375 | 0.357 | 0.363 | 8.1 | 8.5 | 6.4 |
| sqlite | 3 | 0.438 | 0.438 | 0.430 | 0.430 | 6.0 | 3.2 | 1.6 |
| inibase | 3 | 0.610 | 0.629 | 0.610 | 0.625 | 300.8 | 21.5 | 5.6 |
| duckdb | 3 | 0.762 | 0.762 | 0.500 | 0.500 | 9.3 | 6.3 | 3.0 |
| lmdb | 3 | 1.023 | 1.027 | 0.984 | 0.984 | 47.3 | 10.0 | 6.8 |
| lmdb-lz4 | 3 | 1.023 | 1.027 | 0.984 | 0.984 | 45.4 | 10.0 | 6.7 |
| mongodb | 3 | 200.773 | 1.176 | 0.469 | 0.813 | 60.8 | 18.6 | 9.6 |
| pglite | 3 | 39.008 | 39.051 | 0.984 | 0.984 | 28.8 | 26.0 | 10.9 |
| postgresql | 3 | 40.180 | 40.230 | 0.993 | 0.992 | 23.9 | 5.5 | 2.6 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| inibase-gzip | 734.6 | 595.6 | 302.7 | 0.0 | 382.2–406.1 |
| inibase-gzip-patched | 735.6 | 611.4 | 237.4 | 0.0 | 314.2–1215.2 |
| leveldb | 0.4 | 0.4 | 0.3 | 2.5 | 8.1–8.4 |
| sqlite | 0.3 | 0.4 | 0.2 | 2.0 | 5.5–6.1 |
| inibase | 701.9 | 227.5 | 216.2 | 0.0 | 289.0–308.8 |
| duckdb | 3.3 | 0.9 | 0.8 | 4.3 | 9.3–9.4 |
| lmdb | 0.2 | 19.8 | 19.8 | 0.0 | 43.0–48.7 |
| lmdb-lz4 | 0.3 | 18.6 | 20.0 | 0.0 | 42.2–46.4 |
| mongodb | 4.5 | 21.3 | 20.2 | 43.5 | 59.8–80.6 |
| pglite | 4.0 | 1.5 | 0.8 | 9.2 | 28.7–30.6 |
| postgresql | 2.4 | 0.9 | 0.5 | 11.5 | 23.8–33.3 |

## Failures (excluded from rankings)

- inibase-gzip-cms-10000-1: exit 1
- inibase-gzip-cms-10000-2: exit 1
- inibase-gzip-cms-10000-3: exit 1
- inibase-gzip-mixed-10000-1: exit 1
- inibase-gzip-mixed-10000-2: exit 1
- inibase-gzip-mixed-10000-3: exit 1

`inibase-gzip-patched` is an unreleased experiment, not the published iniBase package. See [patch details](../../patches/README.md). Native PostgreSQL/MongoDB and patched iniBase were collected in a separate sequential phase when metadata.phases is present; all phase metadata is retained.

The complete samples, configuration, checksums, input sizes, churn footprints, and RSS measurements are preserved in JSON. Do not infer cloud prices or universal winners from this run.
