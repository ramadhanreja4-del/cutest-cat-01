#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT HUP INT TERM
MAKEFUN_OUTPUT_DIR="$TMP/run-a" node --experimental-strip-types "$ROOT/main.ts"
MAKEFUN_OUTPUT_DIR="$TMP/run-b" node --experimental-strip-types "$ROOT/main.ts"
cmp "$TMP/run-a/entry.png" "$TMP/run-b/entry.png"
cmp "$ROOT/entry.png" "$TMP/run-a/entry.png"
printf 'PASS: two independent runs produced identical bytes.\n'
sha256sum "$TMP/run-a/entry.png"
printf 'Output bytes: '
wc -c < "$TMP/run-a/entry.png"
