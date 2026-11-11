// Cutest Cat 01 — deterministic JPEG entry.
// Make.fun requires the output file to be named entry.png, but identifies
// PNG/JPEG by magic bytes. This repository carries a valid JPEG at that path.

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(projectDir, 'entry.png');
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const outputPath = join(outputDir, 'entry.png');
const maxBytes = 1_048_576;

function fail(reason: string): never {
  throw new Error(`[cutest-cat-01] ${reason}`);
}

function isSofMarker(marker: number): boolean {
  return (marker >= 0xc0 && marker <= 0xc3)
    || (marker >= 0xc5 && marker <= 0xc7)
    || (marker >= 0xc9 && marker <= 0xcb)
    || (marker >= 0xcd && marker <= 0xcf);
}

function validateJpeg(bytes: Buffer): { width: number; height: number } {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    fail('entry.png is not a JPEG (missing SOI signature)');
  }
  if (bytes.length > maxBytes) fail(`image exceeds ${maxBytes} bytes`);

  let offset = 2;
  let width = 0;
  let height = 0;
  let sawFrame = false;
  let sawScan = false;
  let sawEnd = false;

  while (offset < bytes.length) {
    // After SOS, walk entropy-coded bytes. FF 00 is byte-stuffed data;
    // restart markers are part of the scan, not segment headers.
    if (sawScan && bytes[offset] !== 0xff) {
      let cursor = offset;
      let foundMarker = false;
      while (cursor < bytes.length) {
        if (bytes[cursor] !== 0xff) {
          cursor += 1;
          continue;
        }
        let markerAt = cursor + 1;
        while (markerAt < bytes.length && bytes[markerAt] === 0xff) markerAt += 1;
        if (markerAt >= bytes.length) fail('truncated marker in JPEG scan data');
        const code = bytes[markerAt];
        if (code === 0x00 || (code >= 0xd0 && code <= 0xd7)) {
          cursor = markerAt + 1;
          continue;
        }
        offset = cursor;
        foundMarker = true;
        break;
      }
      if (!foundMarker) fail('JPEG is missing its EOI marker');
    }

    if (bytes[offset] !== 0xff) fail('expected a JPEG marker');
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) fail('truncated JPEG marker');
    const marker = bytes[offset];
    offset += 1;

    if (marker === 0xd9) {
      if (!sawFrame || !sawScan) fail('JPEG is missing its frame or scan');
      if (offset !== bytes.length) fail('unexpected bytes after JPEG EOI');
      sawEnd = true;
      break;
    }
    if (marker === 0x00 || marker === 0xd8 || marker === 0x01
      || (marker >= 0xd0 && marker <= 0xd7)) {
      fail(`unexpected standalone JPEG marker FF${marker.toString(16)}`);
    }

    if (offset + 2 > bytes.length) fail('truncated JPEG segment length');
    const segmentLength = bytes.readUInt16BE(offset);
    if (segmentLength < 2) fail('invalid JPEG segment length');
    const segmentStart = offset + 2;
    const segmentEnd = offset + segmentLength;
    if (segmentEnd > bytes.length) fail('JPEG segment extends past end of file');

    if (isSofMarker(marker)) {
      if (sawFrame || segmentLength < 8) fail('invalid or duplicate JPEG frame header');
      height = bytes.readUInt16BE(segmentStart + 1);
      width = bytes.readUInt16BE(segmentStart + 3);
      sawFrame = true;
    } else if (marker === 0xda) {
      if (!sawFrame || segmentLength < 6) fail('invalid JPEG scan header');
      sawScan = true;
    }

    offset = segmentEnd;
  }

  if (!sawEnd) fail('JPEG is missing a final EOI marker');
  if (width < 1 || height < 1 || width > 1024 || height > 1024) {
    fail(`image dimensions are outside the limit: ${width}x${height}`);
  }
  return { width, height };
}

const source = readFileSync(sourcePath);
const { width, height } = validateJpeg(source);
mkdirSync(outputDir, { recursive: true });
copyFileSync(sourcePath, outputPath);
const output = readFileSync(outputPath);
if (!output.equals(source) || statSync(outputPath).size !== source.length) {
  fail('output differs from the submitted artwork');
}
console.log(`Wrote ${width}x${height} JPEG as entry.png (${source.length} bytes)`);
