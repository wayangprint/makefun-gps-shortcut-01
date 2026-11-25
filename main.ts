// SPDX-License-Identifier: MIT
// GPS Shortcut — make.fun entry.
// A GPS that swears the lake detour was a shortcut writes its excuse
// to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt).
// Pure Node 22 standard library; the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// The excuse, assembled from three beats so the single line stays
// readable in source: the promised bridge, the vetoing lake, and the
// smug delivery by water. Joined without separators or newlines.
const BEATS: readonly string[] = [
  "The map promised a bridge, ",
  "the lake vetoed it, and the wedding needed a dramatic entrance — ",
  "so I delivered you, fashionably late, by water.",
];
const LINE: string = BEATS.join("");

const TARGET_DIR: string = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The gate the judges apply: one line, 1–200 characters, real text.
function assertGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`excuse must be 1-200 characters, got ${chars}`);
  }
  if (text.trim().length === 0 || text.includes("\n")) {
    throw new Error("excuse must be a single non-blank line");
  }
}

// Put the line on disk exactly as built — no trailing newline, so the
// file holds the line and nothing else.
function deliverLine(text: string): string {
  const destination = join(TARGET_DIR, "entry.txt");
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, text, "utf8");
  return destination;
}

assertGate(LINE);
const deliveredAt = deliverLine(LINE);

// Re-read what landed and demand a byte-for-byte match with the line
// we built, so a truncated or re-encoded write fails loudly.
function confirmDeliveredBytes(filedPath: string, expected: string): void {
  const filed = readFileSync(filedPath, "utf8");
  if (filed !== expected) {
    throw new Error("delivered excuse differs from the built line");
  }
  if (Buffer.byteLength(filed, "utf8") !== Buffer.byteLength(expected, "utf8")) {
    throw new Error("delivered excuse has the wrong byte length");
  }
}

confirmDeliveredBytes(deliveredAt, LINE);

// Last sanity pass, phrased as the GPS would tell it: the excuse must
// open with the map's promise and close with the water delivery, or the
// line on disk is not the one the judges were promised.
function confirmExcuseShape(text: string): void {
  if (!text.startsWith("The map promised")) {
    throw new Error("excuse must open with the map's promise");
  }
  if (!text.endsWith("by water.")) {
    throw new Error("excuse must close with the delivery by water");
  }
}

confirmExcuseShape(LINE);
process.stdout.write(readFileSync(deliveredAt, "utf8") + "\n");
