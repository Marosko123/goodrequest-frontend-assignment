import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const sourceRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Raw colours that are allowed to stay literal, each with the reason it is not
 * a token. Anything else must come from the theme, so a value cannot quietly
 * drift away from the design system the way two field errors once did.
 */
const allowedRawColours = new Map([
  ["#1877f2", "Facebook brand colour, owned by Meta, not by this palette"],
  ["#000100", "Instagram glyph colour, owned by Meta, not by this palette"],
  ["rgb(253 164 175 / 10%)", "decorative rose 300 tint, see inline-alert"],
]);

function collectStyleSources(directory: string): [string, string][] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectStyleSources(path);
    }

    const isStyleSource =
      entry.name.endsWith(".styles.ts") ||
      path.endsWith(join("styles", "fragments.ts")) ||
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
const colourLiteral = /#[0-9a-f]{3,8}\b|\brgba?\([^)]*\)|\bhsla?\([^)]*\)/gi;

describe("design token discipline", () => {
  it("finds the style sources it is meant to police", () => {
    expect(styleSources.length).toBeGreaterThan(20);
  });

  it.each(styleSources)(
    "%s spells every colour as a token",
    (_path, source) => {
      const offenders = (source.match(colourLiteral) ?? []).filter(
        (literal) => !allowedRawColours.has(literal.toLowerCase()),
      );

      expect(offenders).toEqual([]);
    },
  );

  it("keeps the theme as the only place raw colours are declared", () => {
    const theme = readFileSync(join(sourceRoot, "styles", "theme.ts"), "utf8");

    expect(theme.match(/#[0-9a-f]{6}\b/gi)?.length ?? 0).toBeGreaterThan(20);
  });

  it("proves the matcher would catch a stray literal", () => {
    expect("color: #ff0000;".match(colourLiteral)).toEqual(["#ff0000"]);
    expect("background: rgb(1 2 3 / 4%);".match(colourLiteral)).toEqual([
      "rgb(1 2 3 / 4%)",
    ]);
  });
});
