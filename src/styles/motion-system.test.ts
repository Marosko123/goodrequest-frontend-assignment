import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { rawTheme, theme } from "./theme";

const sourceRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function collectActiveStyleSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectActiveStyleSources(path);
    }

    if (
      entry.name.endsWith(".styles.ts") ||
      path.endsWith(join("styles", "fragments.ts")) ||
      path.endsWith(join("styles", "global-styles.ts"))
    ) {
      return [readFileSync(path, "utf8")];
    }

    return [];
  });
}

describe("GoodBoy motion system", () => {
  it("exposes the approved timings and easings under exactly one name each", () => {
    expect(rawTheme.motion).toEqual({
      instant: "120ms",
      fast: "160ms",
      base: "220ms",
      celebration: "420ms",
      easeStandard: "cubic-bezier(0.2, 0, 0, 1)",
      easeEnter: "cubic-bezier(0.16, 1, 0.3, 1)",
      easePlayful: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    });
    expect(theme.motion.fast).toBe("var(--motion-fast)");
    expect(theme.motion.base).toBe("var(--motion-base)");
    expect(Object.keys(theme.motion)).toEqual(Object.keys(rawTheme.motion));
  });

  it("never reintroduces a second spelling for a single duration", () => {
    const activeStyles = collectActiveStyleSources(sourceRoot).join("\n");

    expect(activeStyles).not.toMatch(/--transition-(fast|base)/);
  });

  it("keeps reduced motion immediate and never transitions every property", () => {
    const globalStyles = readFileSync(
      join(sourceRoot, "styles", "global-styles.ts"),
      "utf8",
    );
    const activeStyles = collectActiveStyleSources(sourceRoot).join("\n");

    expect(globalStyles).toContain("transition-duration: 0ms !important;");
    expect(globalStyles).toContain("transition-delay: 0ms !important;");
    expect(globalStyles).toContain("animation-duration: 0ms !important;");
    expect(globalStyles).toContain("animation-delay: 0ms !important;");
    expect(activeStyles).not.toMatch(/transition\s*:\s*all\b/);
  });
});
