import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const stylesDirectory = dirname(fileURLToPath(import.meta.url));
const sourceDirectory = join(stylesDirectory, "..");

const figmaTypographyTokens = {
  "--type-heading-lg-bold": "700 3rem/3.5rem var(--font-sans)",
  "--type-heading-xl-regular": "400 3.75rem/4.5rem var(--font-sans)",
  "--type-heading-xl-semibold": "600 3.75rem/4.5rem var(--font-sans)",
  "--type-heading-xl-semibold-compact": "600 2.5rem/3rem var(--font-sans)",
  "--type-text-xl-semibold": "600 1.25rem/2rem var(--font-sans)",
  "--type-text-lg-medium": "500 1.125rem/1.5rem var(--font-sans)",
  "--type-text-md-regular": "400 1rem/1.5rem var(--font-sans)",
  "--type-text-md-medium": "500 1rem/1.5rem var(--font-sans)",
  "--type-text-md-semibold": "600 1rem/1.5rem var(--font-sans)",
  "--type-text-sm-regular": "400 0.875rem/1.25rem var(--font-sans)",
  "--type-text-sm-medium": "500 0.875rem/1.25rem var(--font-sans)",
  "--line-height-text-md": "1.5rem",
} as const;

function findModuleStyles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return findModuleStyles(path);
    }
    return entry.name.endsWith(".module.scss") ? [path] : [];
  });
}

describe("Figma typography contract", () => {
  it("defines the complete reusable type scale from the supplied exports", () => {
    const tokens = readFileSync(join(stylesDirectory, "_tokens.scss"), "utf8");

    for (const [name, value] of Object.entries(figmaTypographyTokens)) {
      expect(tokens, `${name} is missing or has drifted`).toContain(
        `${name}: ${value};`,
      );
    }

    expect(tokens).toContain("--tracking-heading: -0.3px;");
  });

  it("keeps component typography on reusable roles", () => {
    const violations = findModuleStyles(sourceDirectory).flatMap((path) => {
      const source = readFileSync(path, "utf8");
      const matches = source.split("\n").filter((line) => {
        if (/\b(?:font-size|font-weight)\s*:/.test(line)) {
          return true;
        }
        return (
          /\b(?:line-height|letter-spacing)\s*:/.test(line) &&
          !line.includes("var(")
        );
      });
      return matches.map((declaration) => ({ path, declaration }));
    });

    expect(violations).toEqual([]);
  });
});
