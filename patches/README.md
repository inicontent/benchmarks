> Historical experiment for iniBase 3.6.0. The current suite uses published 3.7.0 without runtime patches. To reproduce this experiment, check out commit `99a67f9191d0936cb0275b352dcd6a7c904e1fcf`, which retains `src/patched-inibase.mjs` and its original dependency lock.

# Unreleased iniBase gzip-append experiment

`inibase-gzip` benchmarks the unmodified npm package 3.6.0. `inibase-gzip-patched` copies that exact package into ignored `.work/` and applies the narrowly scoped code transformation in `src/patched-inibase.mjs`. The baseline package and the user's iniBase repository are not changed.

The published append implementation interpolates the entire column batch into `echo '...' | gzip`. A batch of 1,000 ~1.3KB bodies exceeds this Mac's 1,048,576-byte ARG_MAX. `exec` raises E2BIG, which the append catch converts into a null target. Other columns are committed while body data remains at 1,000 rows. Full-content verification catches the discrepancy. The CMS and mixed 10,000-row baseline runs are expected to fail on this host. Exact logs are preserved in results JSON.

The experimental fix appends a gzip Buffer with Node's gzip + appendFile instead of interpolating data into a shell command; append errors are rethrown. The engine's existing temp-file, journal, commit and fsync path remains in place. Concatenated gzip members are supported by the reader. This also avoids treating quotes in data as shell syntax.

This is an **unreleased experiment**, not a published iniBase performance claim. Its resulting file SHA-256 is recorded in every patched sample. The repository contains a focused regression test for large compressed appends. Full engine crash/recovery qualification and releasing a fixed iniBase package are separate work.
