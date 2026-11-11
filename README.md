# A Little Heart-Keeper — Cutest Cat 01

A deterministic `program/v1` entry for Make.fun's Cutest Cat 01 competition.

## Artwork

`entry.png` contains a valid 300×300 JPEG image. The competition identifies PNG/JPEG by their leading bytes and requires the output filename to remain `entry.png`. The cat is a soft pastel kitten with large bright eyes, a pink bow, heart pendant, rosy cheeks, paw pads, and a curled tail.

## Run

Requires Node.js 22.23.4 (standard library only):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The program validates the JPEG signature, segment lengths, frame dimensions, scan and final EOI marker, checks the 1 MiB/1024×1024 limits, and copies the exact source bytes to `/output/entry.png` (or `MAKEFUN_OUTPUT_DIR/entry.png` locally).

## Reproducibility

Run `./build.sh` on Unix-like systems or `./build.ps1` on Windows. Each runs the program twice and compares both outputs byte-for-byte with the source artwork.

## License

MIT. See `LICENSE`.
