# Measured results

Run: 2026-10-11T09-19-47.745Z. Apple M5; darwin/arm64; Node v26.9.0.

Each cell is a median of 3 independent runs when complete. All successful runs passed full-content SHA-256 verification, projected-content verification, and CRUD checks.

**Scope:** local embedded engines and loopback-only native servers, synthetic fixtures, one table, no replicas or backups. PGlite is PostgreSQL in WASM, not a production PostgreSQL server. LevelDB/LMDB are key-value engines. Timings include adapter/API work and are not feature-equivalent server benchmarks.

Storage is measured after each engine’s documented maintenance and clean close. Both total footprint and growth over an empty database are reported. Physical allocation uses stat.blocks × 512 (not an invoice, and may differ with APFS compression/clones). No OS cache eviction; reads are cache-affected. RSS includes fixtures, JS/WASM runtime, and result verification; native server child memory is excluded. Sparse file logical lengths are not physical disk consumption.

## cms — 1,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| inibase-gzip | 3 | 0.017 | 0.043 | 0.016 | 0.039 | 52.9 | 7.7 | 1.7 |
| leveldb | 3 | 0.155 | 0.172 | 0.155 | 0.160 | 3.3 | 2.4 | 1.7 |
| lmdb-lz4 | 3 | 0.242 | 0.246 | 0.203 | 0.203 | 15.8 | 2.5 | 1.1 |
| mongodb | 3 | 200.519 | 0.656 | 0.215 | 0.293 | 9.7 | 5.8 | 2.6 |
| duckdb | 3 | 0.762 | 0.762 | 0.500 | 0.500 | 1.8 | 2.1 | 0.9 |
| inibase | 3 | 1.269 | 1.285 | 1.268 | 1.281 | 48.9 | 6.4 | 1.5 |
| sqlite | 3 | 1.313 | 1.313 | 1.305 | 1.305 | 2.4 | 0.7 | 0.2 |
| lmdb | 3 | 1.477 | 1.480 | 1.438 | 1.438 | 9.8 | 2.3 | 0.9 |
| pglite | 3 | 39.391 | 39.434 | 1.367 | 1.367 | 9.5 | 4.4 | 1.5 |
| postgresql | 3 | 40.563 | 40.613 | 1.375 | 1.375 | 6.1 | 1.9 | 0.4 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| inibase-gzip | 189.2 | 206.3 | 225.9 | 0.0 | 52.2–52.9 |
| leveldb | 0.6 | 0.4 | 0.2 | 1.3 | 3.3–3.3 |
| lmdb-lz4 | 0.3 | 19.3 | 19.9 | 0.0 | 15.7–16.5 |
| mongodb | 3.8 | 18.2 | 20.3 | 43.2 | 9.7–10.0 |
| duckdb | 3.0 | 1.1 | 0.8 | 3.1 | 1.8–2.0 |
| inibase | 180.6 | 170.6 | 198.7 | 0.0 | 47.9–50.0 |
| sqlite | 0.3 | 0.4 | 0.3 | 4.0 | 2.4–2.5 |
| lmdb | 0.2 | 19.2 | 19.9 | 0.0 | 9.7–10.0 |
| pglite | 3.7 | 1.0 | 0.6 | 3.1 | 9.3–10.1 |
| postgresql | 2.3 | 0.9 | 0.6 | 3.4 | 5.9–6.7 |

## mixed — 1,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| inibase-gzip | 3 | 0.706 | 0.730 | 0.705 | 0.727 | 68.1 | 10.2 | 1.7 |
| inibase | 3 | 1.271 | 1.285 | 1.270 | 1.281 | 47.2 | 6.5 | 1.6 |
| sqlite | 3 | 1.313 | 1.313 | 1.305 | 1.305 | 2.5 | 0.6 | 0.2 |
| leveldb | 3 | 1.329 | 1.348 | 1.329 | 1.336 | 2.7 | 2.2 | 1.7 |
| lmdb | 3 | 1.477 | 1.480 | 1.438 | 1.438 | 8.5 | 2.3 | 1.0 |
| lmdb-lz4 | 3 | 1.586 | 1.590 | 1.547 | 1.547 | 18.6 | 2.4 | 1.1 |
| duckdb | 3 | 2.012 | 2.012 | 1.750 | 1.750 | 1.9 | 2.0 | 0.3 |
| mongodb | 3 | 201.655 | 2.965 | 1.352 | 2.602 | 12.1 | 7.5 | 1.4 |
| pglite | 3 | 39.391 | 39.434 | 1.367 | 1.367 | 9.6 | 4.4 | 1.4 |
| postgresql | 3 | 40.563 | 40.613 | 1.375 | 1.375 | 6.7 | 1.8 | 0.4 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| inibase-gzip | 220.9 | 211.8 | 312.8 | 0.0 | 68.1–68.1 |
| inibase | 178.6 | 171.8 | 199.2 | 0.0 | 44.9–47.9 |
| sqlite | 0.2 | 0.4 | 0.2 | 4.0 | 2.4–2.5 |
| leveldb | 0.5 | 0.4 | 0.2 | 3.3 | 2.7–3.1 |
| lmdb | 0.2 | 20.1 | 19.9 | 0.0 | 7.6–9.5 |
| lmdb-lz4 | 0.2 | 18.0 | 19.0 | 0.0 | 17.6–19.2 |
| duckdb | 2.9 | 0.9 | 0.8 | 3.5 | 1.8–1.9 |
| mongodb | 4.3 | 18.6 | 20.1 | 44.2 | 12.0–12.9 |
| pglite | 3.7 | 1.2 | 0.6 | 3.1 | 9.4–9.9 |
| postgresql | 2.3 | 0.8 | 0.5 | 3.4 | 6.1–6.8 |

## compact — 1,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| inibase-gzip | 3 | 0.010 | 0.035 | 0.010 | 0.031 | 43.0 | 6.0 | 1.6 |
| sqlite | 3 | 0.051 | 0.051 | 0.043 | 0.043 | 0.6 | 0.3 | 0.2 |
| leveldb | 3 | 0.037 | 0.055 | 0.036 | 0.043 | 1.3 | 1.2 | 0.8 |
| inibase | 3 | 0.058 | 0.074 | 0.057 | 0.070 | 44.2 | 5.9 | 1.5 |
| lmdb | 3 | 0.148 | 0.152 | 0.109 | 0.109 | 8.6 | 2.1 | 0.6 |
| lmdb-lz4 | 3 | 0.148 | 0.152 | 0.109 | 0.109 | 5.5 | 2.1 | 0.7 |
| mongodb | 3 | 200.459 | 0.535 | 0.109 | 0.125 | 7.6 | 3.8 | 1.4 |
| duckdb | 3 | 0.762 | 0.762 | 0.500 | 0.500 | 1.2 | 1.4 | 0.4 |
| pglite | 3 | 38.156 | 38.199 | 0.133 | 0.133 | 3.7 | 3.1 | 1.4 |
| postgresql | 3 | 39.329 | 39.379 | 0.141 | 0.141 | 3.7 | 1.4 | 0.4 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| inibase-gzip | 180.9 | 199.5 | 212.4 | 0.0 | 42.0–50.0 |
| sqlite | 0.2 | 0.3 | 0.3 | 0.4 | 0.6–0.7 |
| leveldb | 0.4 | 0.3 | 0.2 | 0.5 | 1.3–1.3 |
| inibase | 176.3 | 162.5 | 191.4 | 0.0 | 42.0–45.1 |
| lmdb | 0.2 | 17.9 | 19.0 | 0.0 | 8.0–8.6 |
| lmdb-lz4 | 0.3 | 17.7 | 19.0 | 0.0 | 5.4–6.6 |
| mongodb | 3.9 | 17.1 | 20.4 | 42.3 | 7.4–8.2 |
| duckdb | 2.9 | 0.9 | 0.8 | 1.7 | 1.2–1.9 |
| pglite | 3.1 | 1.0 | 0.6 | 2.6 | 3.7–3.8 |
| postgresql | 2.2 | 0.8 | 0.5 | 2.9 | 3.6–3.7 |

## cms — 10,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| inibase-gzip | 3 | 0.161 | 0.188 | 0.161 | 0.184 | 331.8 | 31.8 | 5.4 |
| leveldb | 3 | 1.528 | 1.555 | 1.528 | 1.543 | 27.7 | 18.5 | 15.9 |
| lmdb-lz4 | 3 | 2.023 | 2.027 | 1.984 | 1.984 | 136.5 | 14.9 | 12.5 |
| mongodb | 3 | 201.865 | 2.895 | 1.562 | 2.531 | 68.6 | 41.5 | 9.5 |
| duckdb | 3 | 3.012 | 3.012 | 2.750 | 2.750 | 15.0 | 11.7 | 2.1 |
| inibase | 3 | 12.722 | 12.738 | 12.722 | 12.734 | 343.1 | 24.7 | 5.9 |
| sqlite | 3 | 13.063 | 13.063 | 13.055 | 13.055 | 30.9 | 6.4 | 3.4 |
| lmdb | 3 | 14.367 | 14.371 | 14.328 | 14.328 | 52.5 | 14.4 | 9.8 |
| pglite | 3 | 67.305 | 67.348 | 29.281 | 29.281 | 90.5 | 41.4 | 11.2 |
| postgresql | 3 | 68.477 | 68.527 | 29.290 | 29.289 | 47.7 | 9.9 | 2.0 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| inibase-gzip | 299.9 | 567.0 | 343.9 | 0.0 | 323.0–334.0 |
| leveldb | 0.5 | 0.6 | 0.2 | 2.9 | 27.6–28.0 |
| lmdb-lz4 | 0.3 | 19.5 | 20.1 | 0.0 | 133.9–136.5 |
| mongodb | 5.1 | 18.9 | 20.3 | 147.9 | 64.6–68.6 |
| duckdb | 2.9 | 1.0 | 0.9 | 18.9 | 14.6–15.4 |
| inibase | 271.4 | 203.5 | 263.4 | 0.0 | 339.9–348.9 |
| sqlite | 0.3 | 0.5 | 0.3 | 42.4 | 30.7–30.9 |
| lmdb | 0.3 | 20.1 | 19.9 | 0.0 | 52.5–53.4 |
| pglite | 3.4 | 1.3 | 0.6 | 15.5 | 87.4–94.2 |
| postgresql | 2.3 | 0.9 | 0.5 | 14.5 | 47.7–48.1 |

## mixed — 10,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| duckdb | 3 | 7.012 | 7.012 | 6.750 | 6.750 | 14.5 | 13.2 | 1.7 |
| inibase-gzip | 3 | 7.049 | 7.074 | 7.048 | 7.070 | 545.0 | 57.1 | 6.2 |
| inibase | 3 | 12.733 | 12.750 | 12.732 | 12.746 | 336.1 | 23.5 | 8.4 |
| sqlite | 3 | 13.063 | 13.063 | 13.055 | 13.055 | 30.9 | 6.4 | 4.4 |
| leveldb | 3 | 13.306 | 13.324 | 13.305 | 13.313 | 30.4 | 17.8 | 15.6 |
| lmdb | 3 | 14.367 | 14.371 | 14.328 | 14.328 | 54.5 | 14.0 | 9.5 |
| lmdb-lz4 | 3 | 15.758 | 15.762 | 15.719 | 15.719 | 166.3 | 13.9 | 10.2 |
| mongodb | 3 | 213.920 | 26.684 | 13.616 | 26.320 | 81.6 | 49.8 | 9.1 |
| pglite | 3 | 67.305 | 67.348 | 29.281 | 29.281 | 87.7 | 34.0 | 15.3 |
| postgresql | 3 | 68.477 | 68.527 | 29.290 | 29.289 | 47.3 | 7.9 | 1.8 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| duckdb | 2.9 | 1.0 | 0.8 | 16.9 | 14.4–15.1 |
| inibase-gzip | 559.3 | 573.6 | 1388.0 | 0.0 | 539.7–548.8 |
| inibase | 272.0 | 204.2 | 263.0 | 0.0 | 328.0–343.0 |
| sqlite | 0.4 | 0.4 | 0.3 | 42.1 | 30.9–30.9 |
| leveldb | 1.0 | 1.3 | 0.3 | 11.2 | 30.2–31.1 |
| lmdb | 0.3 | 20.4 | 20.0 | 0.0 | 53.5–55.4 |
| lmdb-lz4 | 0.3 | 18.7 | 19.9 | 0.0 | 162.5–177.4 |
| mongodb | 4.6 | 16.8 | 20.4 | 146.2 | 80.7–82.6 |
| pglite | 3.4 | 1.3 | 0.6 | 15.5 | 86.7–88.3 |
| postgresql | 2.3 | 0.9 | 0.5 | 14.4 | 47.3–47.3 |

## compact — 10,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| inibase-gzip | 3 | 0.096 | 0.121 | 0.095 | 0.117 | 308.1 | 24.1 | 6.2 |
| leveldb | 3 | 0.357 | 0.375 | 0.357 | 0.363 | 7.9 | 8.4 | 6.3 |
| sqlite | 3 | 0.438 | 0.438 | 0.430 | 0.430 | 5.4 | 3.1 | 1.6 |
| inibase | 3 | 0.610 | 0.629 | 0.610 | 0.625 | 301.1 | 22.1 | 5.4 |
| duckdb | 3 | 0.762 | 0.762 | 0.500 | 0.500 | 9.2 | 5.9 | 2.8 |
| lmdb | 3 | 1.023 | 1.027 | 0.984 | 0.984 | 48.2 | 9.9 | 6.3 |
| lmdb-lz4 | 3 | 1.023 | 1.027 | 0.984 | 0.984 | 41.5 | 9.5 | 6.2 |
| mongodb | 3 | 200.773 | 1.176 | 0.469 | 0.813 | 59.5 | 18.6 | 8.8 |
| pglite | 3 | 39.008 | 39.051 | 0.984 | 0.984 | 27.9 | 25.4 | 10.6 |
| postgresql | 3 | 40.180 | 40.230 | 0.993 | 0.992 | 24.0 | 5.6 | 2.8 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| inibase-gzip | 245.4 | 568.9 | 227.7 | 0.0 | 305.1–316.0 |
| leveldb | 0.4 | 0.4 | 0.2 | 2.4 | 7.8–7.9 |
| sqlite | 0.2 | 0.4 | 0.2 | 1.8 | 5.3–5.6 |
| inibase | 250.9 | 208.5 | 204.2 | 0.0 | 295.0–315.0 |
| duckdb | 2.9 | 1.2 | 0.9 | 4.1 | 8.7–9.3 |
| lmdb | 0.2 | 19.8 | 20.0 | 0.0 | 42.3–50.3 |
| lmdb-lz4 | 0.2 | 20.1 | 19.7 | 0.0 | 37.1–42.6 |
| mongodb | 4.0 | 18.3 | 20.3 | 43.5 | 58.6–59.6 |
| pglite | 3.6 | 1.3 | 0.7 | 9.0 | 27.7–28.4 |
| postgresql | 2.3 | 0.9 | 0.5 | 11.0 | 23.8–24.1 |

## Failures (excluded from rankings)

None.

iniBase version: 3.7.0. Published package, without runtime patches.

The complete samples, configuration, checksums, input sizes, churn footprints, and RSS measurements are preserved in JSON. Do not infer cloud prices or universal winners from this run.
