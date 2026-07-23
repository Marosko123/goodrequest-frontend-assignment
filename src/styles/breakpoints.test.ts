import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const sourceRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Every viewport width the layout is allowed to react to, and what happens
 * there. Media queries stay literal at the call site — a raw `38rem` reads
 * better to a CSS author than an interpolation, and CSS cannot resolve custom
 * properties inside `@media` anyway — so this inventory is what stops the set
 * from quietly growing a twelfth, near-duplicate entry.
 *
 * Adding a width means adding it here with a reason. Reusing one of the shared
 * tiers is almost always the better answer.
 */
const layoutTiers: Record<string, string> = {
  // Shared tiers: several components must move together at these widths.
  "22rem": "action rows give up on side-by-side buttons",
  "32rem": "page gutters tighten on small phones",
  "38rem": "paired columns collapse into one",
  "40rem": "oversized display type and its decorations pull in",
  "48rem": "content stops sitting beside its media",
  "56rem": "the two-column shell becomes a stacked page",

  // Component-local tiers: one component each, named where they are used.
  "24rem": "the custom amount field gives up its fixed type scale",
  "30rem": "the stepper stacks its labels under the markers",
  "37.5rem": "the stepper drops to its compact type scale",
  "42rem": "the selection form regrids its presets and actions",
  "90rem": "the shell stops growing and centres",
};

function collectStyleSources(directory: string): [string, string][] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectStyleSources(path);
    }

    const isStyleSource =
      entry.name.endsWith(".styles.ts") ||
      path.endsWith(join("styles", "global-styles.ts"));

    return isStyleSource
      ? ([[relative(sourceRoot, path), readFileSync(path, "utf8")]] as [
          string,
          string,
        ][])
      : [];
  });
}

const styleSources = collectStyleSources(sourceRoot);
const widthQuery = /\(\s*width\s*[<>]=?\s*([0-9.]+rem)\s*\)/g;

function widthsIn(source: string): string[] {
  return [...source.matchAll(widthQuery)].flatMap((match) => match[1] ?? []);
}

describe("layout tiers", () => {
  it("reacts only to widths the inventory documents", () => {
    const undocumented = styleSources.flatMap(([path, source]) =>
      widthsIn(source)
        .filter((width) => layoutTiers[width] === undefined)
        .map((width) => `${path}: ${width}`),
    );

    expect(undocumented).toEqual([]);
  });

  it("documents no tier the layout stopped using", () => {
    const used = new Set(
      styleSources.flatMap(([, source]) => widthsIn(source)),
    );
    const unused = Object.keys(layoutTiers).filter((width) => !used.has(width));

    expect(unused).toEqual([]);
  });

  it("keeps the inventory small enough to hold in your head", () => {
    expect(Object.keys(layoutTiers).length).toBeLessThanOrEqual(12);
  });

  it("proves the matcher reads real media queries", () => {
    expect(widthsIn("@media (width <= 38rem) { a { color: red } }")).toEqual([
      "38rem",
    ]);
    expect(
      widthsIn("@media (width < 90rem) and (width > 56rem) { a { top: 0 } }"),
    ).toEqual(["90rem", "56rem"]);
  });
});
