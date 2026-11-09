# iniContent database benchmarks

Storage and write performance for iniBase, SQLite, and PostgreSQL. The qualification verified **81 trials** across three synthetic datasets and three record counts on an Apple M5, with three independent trials per configuration.

[Qualification report](https://github.com/inicontent/inibase/blob/315a74652999fac8af085606cdda62ca989bcb61/benchmark/results/automatic-deltas-20261101/REPORT.md) · [Raw results](https://github.com/inicontent/inibase/tree/315a74652999fac8af085606cdda62ca989bcb61/benchmark/results/automatic-deltas-20261101/qualified) · [Reproduction script](https://github.com/inicontent/inibase/blob/315a74652999fac8af085606cdda62ca989bcb61/benchmark/results/automatic-deltas-20261101/REPRODUCE.sh)

## 100,000 CMS records

[![Final disk footprint for 100,000 synthetic CMS records. iniBase used 12.14 MiB, SQLite used 149.48 MiB, and PostgreSQL used 330.14 MiB.](https://raw.githubusercontent.com/inicontent/inibase/315a74652999fac8af085606cdda62ca989bcb61/.github/assets/storage-benchmark-100k.svg)](#benchmark-method)

[![Median update and delete times in milliseconds. iniBase took 11.79 and 9.96, SQLite took 3.93 and 3.98, and PostgreSQL took 3.97 and 3.99.](https://raw.githubusercontent.com/inicontent/inibase/315a74652999fac8af085606cdda62ca989bcb61/.github/assets/write-benchmark-100k.svg)](#benchmark-method)

| Engine | Bulk insert (ms) | Full read (ms) | Projection (ms) | Update p50 (ms) | Delete p50 (ms) | Mixed with maintenance (ms) | Final disk (MiB) |
|---|---:|---:|---:|---:|---:|---:|---:|
| iniBase | 4,567.13 | 252.13 | 54.99 | 11.79 | 9.96 | 7,449.30 | 12.14 |
| SQLite | 1,069.86 | 121.73 | 39.67 | 3.93 | 3.98 | 130.29 | 149.48 |
| PostgreSQL | 1,091.92 | 135.56 | 32.61 | 3.97 | 3.99 | 592.46 | 330.14 |

## Benchmark method

The engines stored the same six application fields and used full durability and explicit key indexes. iniBase used gzip compression with query caching disabled. Bulk inserts commit in batches of up to 1,000 and include fixture creation. Reads use the existing filesystem cache.

Each update and delete median pools 24 committed operations and includes first-use activation. The mixed workload includes updates, verification reads, deletes, and three maintenance calls. Disk usage is measured in allocated bytes at the end of the workload. The PostgreSQL total includes the entire cluster and WAL.

## Benchmark archive

The [archived eight-engine comparison](https://github.com/inicontent/benchmarks/blob/11123a511e1c5dc2dce0b80f113ab1f65c02093d/README.md) documents the runner, workloads, and original figures stored in this repository.
