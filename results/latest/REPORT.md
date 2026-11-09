# Measured results

iniBase run: 2026-11-09T00-43-11.567Z. Apple M5; darwin/arm64; Node v26.9.0.

All other engine rows reuse the [archived comparator run](https://github.com/inicontent/benchmarks/tree/11123a511e1c5dc2dce0b80f113ab1f65c02093d) from 2026-10-11T19-11-32.741Z. Its environment and dependency versions are recorded in [environment.json](environment.json). The fixture hashes match across sessions. Timings reflect separate sessions and may vary with host software, filesystem cache, and background activity.

Each cell is a median of 3 independent runs when complete. All successful runs passed full-content SHA-256 verification, projected-content verification, and CRUD checks.

**Scope:** local embedded engines and loopback-only native servers, synthetic fixtures, one table, no replicas or backups. PGlite is PostgreSQL in WASM, not a production PostgreSQL server. LevelDB/LMDB are key-value engines. Timings include adapter/API work and are not feature-equivalent server benchmarks.

Storage is measured after each engine’s documented maintenance and clean close. Both total footprint and growth over an empty database are reported. Physical allocation uses stat.blocks × 512 (not an invoice, and may differ with APFS compression/clones). No OS cache eviction; reads are cache-affected. RSS includes fixtures, JS/WASM runtime, and result verification; native server child memory is excluded. Sparse file logical lengths are not physical disk consumption.

## cms — 1,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| iniBase (gzip) | 3 | 0.017 | 0.043 | 0.016 | 0.039 | 65.0 | 8.4 | 1.9 |
| iniBase (gzip + legacy log) | 3 | 0.017 | 0.047 | 0.016 | 0.039 | 65.2 | 8.7 | 2.0 |
| leveldb | 3 | 0.155 | 0.172 | 0.155 | 0.160 | 3.4 | 2.8 | 1.7 |
| lmdb-lz4 | 3 | 0.242 | 0.246 | 0.203 | 0.203 | 16.4 | 2.6 | 1.2 |
| mongodb | 3 | 200.519 | 0.656 | 0.215 | 0.293 | 10.0 | 6.2 | 2.7 |
| duckdb | 3 | 1.012 | 1.012 | 0.750 | 0.750 | 2.0 | 2.2 | 1.0 |
| iniBase (plain) | 3 | 1.269 | 1.285 | 1.268 | 1.281 | 63.0 | 7.3 | 1.7 |
| iniBase (plain + legacy log) | 3 | 1.269 | 1.289 | 1.268 | 1.281 | 64.4 | 7.6 | 1.9 |
| sqlite | 3 | 1.313 | 1.313 | 1.305 | 1.305 | 2.6 | 0.8 | 0.2 |
| lmdb | 3 | 1.477 | 1.480 | 1.438 | 1.438 | 10.5 | 2.5 | 0.9 |
| pglite | 3 | 39.391 | 39.434 | 1.367 | 1.367 | 10.2 | 4.6 | 1.4 |
| postgresql | 3 | 40.563 | 40.613 | 1.375 | 1.375 | 6.6 | 1.9 | 0.4 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| iniBase (gzip) | 244.6 | 63.1 | 52.2 | 0.0 | 65.0–68.0 |
| iniBase (gzip + legacy log) | 249.1 | 51.1 | 458.6 | 0.0 | 63.2–69.3 |
| leveldb | 0.6 | 0.4 | 0.2 | 1.4 | 3.4–3.5 |
| lmdb-lz4 | 0.2 | 19.8 | 19.8 | 0.0 | 15.4–16.9 |
| mongodb | 4.1 | 19.2 | 20.2 | 40.3 | 7.2–10.4 |
| duckdb | 3.1 | 1.1 | 0.9 | 3.7 | 1.9–4.0 |
| iniBase (plain) | 231.7 | 63.4 | 51.6 | 0.0 | 61.0–66.0 |
| iniBase (plain + legacy log) | 239.6 | 49.9 | 413.5 | 0.0 | 61.4–72.2 |
| sqlite | 0.3 | 0.3 | 0.2 | 4.3 | 2.6–2.7 |
| lmdb | 0.3 | 18.9 | 18.9 | 0.0 | 10.5–10.7 |
| pglite | 4.0 | 1.1 | 0.7 | 3.5 | 10.1–10.4 |
| postgresql | 2.4 | 0.9 | 0.6 | 3.7 | 6.5–7.0 |

## mixed — 1,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| iniBase (gzip) | 3 | 0.706 | 0.730 | 0.705 | 0.727 | 83.6 | 10.7 | 1.8 |
| iniBase (gzip + legacy log) | 3 | 0.706 | 0.734 | 0.705 | 0.727 | 83.4 | 10.6 | 1.9 |
| duckdb | 3 | 1.262 | 1.262 | 1.000 | 1.000 | 2.0 | 2.3 | 0.3 |
| iniBase (plain) | 3 | 1.271 | 1.285 | 1.270 | 1.281 | 62.0 | 7.4 | 1.8 |
| iniBase (plain + legacy log) | 3 | 1.271 | 1.289 | 1.270 | 1.281 | 62.2 | 8.1 | 2.0 |
| sqlite | 3 | 1.313 | 1.313 | 1.305 | 1.305 | 2.6 | 0.6 | 0.2 |
| leveldb | 3 | 1.329 | 1.348 | 1.329 | 1.336 | 2.9 | 2.4 | 1.7 |
| lmdb | 3 | 1.477 | 1.480 | 1.438 | 1.438 | 8.1 | 2.5 | 1.1 |
| lmdb-lz4 | 3 | 1.586 | 1.590 | 1.547 | 1.547 | 19.4 | 2.6 | 1.2 |
| mongodb | 3 | 201.655 | 2.965 | 1.352 | 2.602 | 12.0 | 7.2 | 1.4 |
| pglite | 3 | 39.391 | 39.434 | 1.367 | 1.367 | 10.0 | 4.6 | 1.5 |
| postgresql | 3 | 40.563 | 40.613 | 1.375 | 1.375 | 7.0 | 1.9 | 0.4 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| iniBase (gzip) | 297.6 | 63.3 | 50.9 | 0.0 | 80.7–84.0 |
| iniBase (gzip + legacy log) | 295.0 | 50.8 | 650.1 | 0.0 | 81.2–86.3 |
| duckdb | 3.0 | 1.0 | 0.9 | 3.8 | 1.9–2.1 |
| iniBase (plain) | 239.1 | 63.5 | 51.5 | 0.0 | 59.6–62.9 |
| iniBase (plain + legacy log) | 247.6 | 50.7 | 413.8 | 0.0 | 61.2–64.3 |
| sqlite | 0.2 | 0.4 | 0.3 | 4.2 | 2.6–2.6 |
| leveldb | 0.6 | 0.4 | 0.2 | 3.2 | 2.9–3.0 |
| lmdb | 0.2 | 18.8 | 19.9 | 0.0 | 7.6–8.4 |
| lmdb-lz4 | 0.2 | 17.3 | 18.9 | 0.0 | 19.4–19.6 |
| mongodb | 4.0 | 18.4 | 20.1 | 45.0 | 11.7–12.3 |
| pglite | 4.0 | 1.1 | 0.6 | 3.5 | 9.6–10.3 |
| postgresql | 2.2 | 0.8 | 0.5 | 3.7 | 6.7–7.0 |

## compact — 1,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| iniBase (gzip) | 3 | 0.010 | 0.035 | 0.010 | 0.031 | 62.1 | 6.9 | 1.9 |
| iniBase (gzip + legacy log) | 3 | 0.011 | 0.039 | 0.010 | 0.031 | 71.3 | 7.2 | 2.0 |
| sqlite | 3 | 0.051 | 0.051 | 0.043 | 0.043 | 0.7 | 0.4 | 0.2 |
| leveldb | 3 | 0.037 | 0.055 | 0.036 | 0.043 | 1.3 | 1.3 | 0.8 |
| iniBase (plain) | 3 | 0.058 | 0.074 | 0.057 | 0.070 | 56.7 | 6.0 | 1.6 |
| iniBase (plain + legacy log) | 3 | 0.058 | 0.078 | 0.057 | 0.070 | 61.1 | 7.0 | 1.9 |
| lmdb | 3 | 0.148 | 0.152 | 0.109 | 0.109 | 7.9 | 2.3 | 0.7 |
| lmdb-lz4 | 3 | 0.148 | 0.152 | 0.109 | 0.109 | 7.2 | 2.9 | 0.8 |
| mongodb | 3 | 200.413 | 0.488 | 0.109 | 0.125 | 8.3 | 3.4 | 1.3 |
| duckdb | 3 | 0.762 | 0.762 | 0.500 | 0.500 | 1.6 | 1.6 | 0.4 |
| pglite | 3 | 38.156 | 38.199 | 0.133 | 0.133 | 4.3 | 3.4 | 1.4 |
| postgresql | 3 | 39.329 | 39.379 | 0.141 | 0.141 | 4.2 | 1.6 | 0.4 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| iniBase (gzip) | 239.4 | 62.5 | 50.6 | 0.0 | 57.9–79.1 |
| iniBase (gzip + legacy log) | 258.4 | 49.5 | 438.3 | 0.0 | 51.2–83.0 |
| sqlite | 0.2 | 0.3 | 0.2 | 0.5 | 0.7–1.1 |
| leveldb | 0.4 | 0.3 | 0.2 | 0.6 | 1.3–1.7 |
| iniBase (plain) | 243.2 | 63.5 | 48.0 | 0.0 | 56.6–61.0 |
| iniBase (plain + legacy log) | 239.8 | 47.5 | 397.1 | 0.0 | 58.2–74.3 |
| lmdb | 0.3 | 19.9 | 19.9 | 0.0 | 7.8–8.7 |
| lmdb-lz4 | 0.3 | 17.4 | 19.0 | 0.0 | 5.3–8.9 |
| mongodb | 3.8 | 16.9 | 19.5 | 42.2 | 7.3–9.0 |
| duckdb | 3.0 | 0.9 | 0.9 | 2.0 | 1.3–6.4 |
| pglite | 3.8 | 1.3 | 1.0 | 3.2 | 3.8–5.7 |
| postgresql | 2.1 | 0.9 | 0.5 | 3.4 | 4.0–4.7 |

## cms — 10,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| iniBase (gzip) | 3 | 0.161 | 0.188 | 0.161 | 0.184 | 471.7 | 35.0 | 5.7 |
| iniBase (gzip + legacy log) | 3 | 0.161 | 0.191 | 0.161 | 0.184 | 470.9 | 36.0 | 6.0 |
| leveldb | 3 | 1.528 | 1.555 | 1.528 | 1.543 | 30.3 | 21.3 | 18.8 |
| lmdb-lz4 | 3 | 2.023 | 2.027 | 1.984 | 1.984 | 143.2 | 16.3 | 14.4 |
| mongodb | 3 | 201.865 | 2.895 | 1.516 | 2.484 | 67.6 | 42.3 | 10.0 |
| duckdb | 3 | 3.012 | 3.012 | 2.750 | 2.750 | 18.3 | 12.9 | 2.3 |
| iniBase (plain) | 3 | 12.722 | 12.738 | 12.722 | 12.734 | 475.9 | 25.7 | 5.7 |
| iniBase (plain + legacy log) | 3 | 12.722 | 12.742 | 12.722 | 12.734 | 464.1 | 25.9 | 5.7 |
| sqlite | 3 | 13.063 | 13.063 | 13.055 | 13.055 | 34.1 | 7.4 | 3.6 |
| lmdb | 3 | 14.367 | 14.371 | 14.328 | 14.328 | 51.3 | 14.7 | 11.0 |
| pglite | 3 | 67.305 | 67.348 | 29.281 | 29.281 | 97.6 | 36.3 | 13.0 |
| postgresql | 3 | 68.477 | 68.527 | 29.290 | 29.289 | 52.3 | 11.6 | 2.2 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| iniBase (gzip) | 401.6 | 58.4 | 51.9 | 0.0 | 467.9–567.6 |
| iniBase (gzip + legacy log) | 407.8 | 51.2 | 813.3 | 0.0 | 470.8–533.6 |
| leveldb | 0.7 | 0.6 | 0.2 | 3.0 | 29.9–32.8 |
| lmdb-lz4 | 0.3 | 19.0 | 19.9 | 0.0 | 138.9–147.3 |
| mongodb | 5.3 | 18.4 | 19.2 | 144.0 | 67.6–71.6 |
| duckdb | 3.4 | 1.8 | 0.8 | 20.5 | 17.5–23.1 |
| iniBase (plain) | 305.0 | 113.6 | 102.2 | 0.0 | 468.0–591.7 |
| iniBase (plain + legacy log) | 299.5 | 97.7 | 401.7 | 0.0 | 462.9–468.8 |
| sqlite | 0.4 | 0.5 | 0.2 | 45.7 | 32.4–34.9 |
| lmdb | 0.3 | 19.9 | 20.0 | 0.0 | 48.5–61.5 |
| pglite | 3.6 | 2.1 | 0.7 | 19.0 | 89.4–97.8 |
| postgresql | 2.7 | 1.0 | 0.6 | 16.5 | 49.3–61.1 |

## mixed — 10,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| duckdb | 3 | 7.012 | 7.012 | 6.750 | 6.750 | 17.6 | 15.1 | 2.1 |
| iniBase (gzip) | 3 | 7.049 | 7.074 | 7.048 | 7.070 | 678.7 | 58.3 | 6.1 |
| iniBase (gzip + legacy log) | 3 | 7.049 | 7.078 | 7.048 | 7.070 | 678.9 | 58.3 | 6.5 |
| iniBase (plain) | 3 | 12.733 | 12.750 | 12.732 | 12.746 | 482.8 | 26.4 | 8.5 |
| iniBase (plain + legacy log) | 3 | 12.733 | 12.754 | 12.732 | 12.746 | 490.0 | 26.5 | 8.2 |
| sqlite | 3 | 13.063 | 13.063 | 13.055 | 13.055 | 33.2 | 6.8 | 5.1 |
| leveldb | 3 | 13.306 | 13.324 | 13.305 | 13.313 | 37.8 | 20.8 | 18.7 |
| lmdb | 3 | 14.367 | 14.371 | 14.328 | 14.328 | 54.2 | 14.7 | 11.3 |
| lmdb-lz4 | 3 | 15.758 | 15.762 | 15.719 | 15.719 | 186.3 | 18.4 | 13.7 |
| mongodb | 3 | 213.874 | 26.637 | 13.570 | 26.273 | 87.9 | 46.9 | 10.5 |
| pglite | 3 | 67.305 | 67.348 | 29.281 | 29.281 | 104.5 | 39.9 | 20.0 |
| postgresql | 3 | 68.477 | 68.527 | 29.290 | 29.289 | 56.4 | 10.0 | 2.3 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| duckdb | 3.2 | 1.0 | 0.8 | 20.7 | 15.0–20.2 |
| iniBase (gzip) | 826.4 | 60.6 | 49.9 | 0.0 | 674.8–691.9 |
| iniBase (gzip + legacy log) | 831.8 | 51.7 | 2984.7 | 0.0 | 677.8–679.8 |
| iniBase (plain) | 292.4 | 113.8 | 97.7 | 0.0 | 478.7–489.9 |
| iniBase (plain + legacy log) | 297.1 | 97.5 | 407.6 | 0.0 | 479.9–493.7 |
| sqlite | 0.4 | 0.5 | 0.3 | 47.6 | 31.9–41.5 |
| leveldb | 1.0 | 2.3 | 0.3 | 13.5 | 31.0–44.2 |
| lmdb | 0.3 | 19.6 | 19.9 | 0.0 | 51.8–57.0 |
| lmdb-lz4 | 0.4 | 19.8 | 19.9 | 0.0 | 167.2–199.4 |
| mongodb | 5.6 | 17.6 | 20.1 | 147.7 | 80.2–88.3 |
| pglite | 4.1 | 1.5 | 0.7 | 19.4 | 100.0–109.2 |
| postgresql | 2.7 | 1.0 | 0.5 | 19.2 | 48.6–60.3 |

## compact — 10,000 records

| Engine | Runs | Total MiB | Allocated MiB | Growth logical MiB | Growth allocated MiB | Insert ms | Full read ms | Projection ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| iniBase (gzip) | 3 | 0.096 | 0.121 | 0.095 | 0.117 | 434.9 | 26.5 | 6.3 |
| iniBase (gzip + legacy log) | 3 | 0.096 | 0.125 | 0.095 | 0.117 | 427.6 | 25.9 | 6.4 |
| leveldb | 3 | 0.357 | 0.375 | 0.357 | 0.363 | 9.8 | 11.2 | 8.3 |
| sqlite | 3 | 0.438 | 0.438 | 0.430 | 0.430 | 7.7 | 4.1 | 2.1 |
| iniBase (plain) | 3 | 0.610 | 0.629 | 0.610 | 0.625 | 432.7 | 24.4 | 5.7 |
| iniBase (plain + legacy log) | 3 | 0.610 | 0.633 | 0.610 | 0.625 | 438.9 | 24.9 | 6.1 |
| duckdb | 3 | 0.762 | 0.762 | 0.500 | 0.500 | 10.8 | 7.6 | 3.4 |
| lmdb | 3 | 1.023 | 1.027 | 0.984 | 0.984 | 48.1 | 12.8 | 8.7 |
| lmdb-lz4 | 3 | 1.023 | 1.027 | 0.984 | 0.984 | 49.3 | 11.7 | 11.0 |
| mongodb | 3 | 200.773 | 1.176 | 0.469 | 0.813 | 58.4 | 21.2 | 11.8 |
| pglite | 3 | 39.008 | 39.051 | 0.984 | 0.984 | 41.2 | 39.5 | 14.9 |
| postgresql | 3 | 40.180 | 40.230 | 0.993 | 0.992 | 30.6 | 7.2 | 3.6 |

| Engine | 20 lookups ms | 5 updates ms | 5 deletes ms | Maintenance ms | Insert min–max ms |
|---|---:|---:|---:|---:|---:|
| iniBase (gzip) | 326.6 | 62.2 | 49.4 | 0.0 | 427.9–441.8 |
| iniBase (gzip + legacy log) | 328.9 | 51.2 | 549.2 | 0.0 | 422.7–431.8 |
| leveldb | 0.5 | 0.5 | 0.2 | 3.2 | 9.3–13.2 |
| sqlite | 0.3 | 0.5 | 0.3 | 2.8 | 6.9–7.9 |
| iniBase (plain) | 325.9 | 60.4 | 50.9 | 0.0 | 428.9–434.8 |
| iniBase (plain + legacy log) | 331.3 | 48.6 | 491.7 | 0.0 | 430.9–442.1 |
| duckdb | 4.2 | 1.2 | 0.9 | 5.6 | 10.5–13.4 |
| lmdb | 0.3 | 19.7 | 19.9 | 0.0 | 47.2–49.4 |
| lmdb-lz4 | 0.4 | 19.4 | 19.9 | 0.0 | 48.9–51.9 |
| mongodb | 5.0 | 17.5 | 20.1 | 38.4 | 58.3–59.9 |
| pglite | 5.2 | 1.8 | 1.2 | 13.1 | 38.4–41.4 |
| postgresql | 2.7 | 1.2 | 0.7 | 15.5 | 30.2–36.9 |

## Failures (excluded from rankings)

None.

iniBase version: 3.9.0. Published package, without runtime patches.

The `inibase-log` and `inibase-gzip-log` configurations use the format-2 log through `log: true`. Plain and gzip configurations use the published package defaults. The main storage snapshot precedes updates. The five-write phases capture any maintenance triggered during those operations.

The complete samples, configuration, checksums, input sizes, churn footprints, and RSS measurements are preserved in JSON. Do not infer cloud prices or universal winners from this run.
