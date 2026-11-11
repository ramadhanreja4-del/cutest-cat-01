# A Little Heart-Keeper — Cutest Cat 01

A deterministic `program/v1` entry for Make.fun's Cutest Cat 01 competition.

The program validates the bundled PNG (signature, full chunk structure, CRCs, dimensions and byte limit), then copies its exact bytes to `/output/entry.png`.

## Run

Requires Node.js 22.23.4, standard library only:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Reproducibility

Run `./build.sh` to build twice and compare the generated PNGs byte-for-byte.

## Artwork

`entry.png` is 1024×1024 and 439,414 bytes.

## License

MIT. See `LICENSE`.
