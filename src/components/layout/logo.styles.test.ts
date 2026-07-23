import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("GoodBoy logo motion", () => {
  it("waits three seconds before the repeating, motion-safe chase cycle", () => {
    const styles = readFileSync(join(__dirname, "logo.styles.ts"), "utf8");

    expect(styles).toContain(
      "animation: ${dogPlay} 9s ${theme.motion.easePlayful} 3s infinite both;",
    );
    expect(styles).toContain(
      "animation: ${ballPlay} 9s ${theme.motion.easeEnter} 3s infinite both;",
    );
    expect(styles).toContain(
      "animation: ${wordmarkMakeRoom} 9s ${theme.motion.easeEnter} 3s infinite both;",
    );
    expect(styles).toContain("const dogPlay = keyframes");
    expect(styles).toContain("const ballPlay = keyframes");
    expect(styles).toContain("const wordmarkMakeRoom = keyframes");
    expect(styles).toContain("transform: translate(74px, 0) rotate(720deg);");
    expect(styles).toContain("transform: translateX(18px);");
    expect(styles).toContain("scaleX(-1)");
    expect(styles).toContain("0%, 6%, 33%, 100% { transform: none; }");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain("animation: none;");
  });
});
