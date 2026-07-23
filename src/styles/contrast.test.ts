import { describe, expect, it } from "vitest";

import { rawTheme } from "./theme";

type Rgb = [number, number, number];

function parseHex(value: string): Rgb {
  const digits = value.replace("#", "");
  const full =
    digits.length === 3
      ? digits
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : digits;

  return [0, 2, 4].map((offset) =>
    Number.parseInt(full.slice(offset, offset + 2), 16),
  ) as Rgb;
}

/** WCAG 2.x relative luminance. */
function luminance([red, green, blue]: Rgb): number {
  const channel = (value: number) => {
    const ratio = value / 255;
    return ratio <= 0.04045 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
  );
}

function contrast(foreground: string, background: string): number {
  const first = luminance(parseHex(foreground));
  const second = luminance(parseHex(background));
  const [lighter, darker] = first > second ? [first, second] : [second, first];

  return (lighter + 0.05) / (darker + 0.05);
}

const { colors } = rawTheme;

// WCAG 1.4.3 asks 4.5:1 for body text; 1.4.11 and 2.4.11 ask 3:1 for control
// boundaries and focus indicators. Disabled controls are exempt from both,
// which is why no disabled pairing appears here.
const textPairs = [
  ["body copy", colors.text, colors.canvas],
  ["secondary copy", colors.textSecondary, colors.canvas],
  ["tertiary copy", colors.textTertiary, colors.canvas],
  ["tertiary copy on surface", colors.textTertiary, colors.surface],
  // Placeholders sit on the filled input, which is the harder background of
  // the two the field uses; the focused state swaps it to canvas.
  ["placeholder on a filled input", colors.textTertiary, colors.surface],
  ["link and accent copy", colors.primary, colors.canvas],
  ["label on a primary fill", colors.onAccent, colors.primary],
  ["label on a destructive fill", colors.onAccent, colors.danger],
  ["inline field error", colors.dangerHover, colors.canvas],
  ["error summary on its tint", colors.dangerHover, colors.dangerSoft],
  ["success copy on its tint", colors.success, colors.successSoft],
  ["warning copy on its tint", colors.warning, colors.warningSoft],
] as const;

const uiPairs = [
  ["default focus indicator", colors.primaryPressed, colors.canvas],
  ["default focus indicator on surface", colors.primaryPressed, colors.surface],
  ["unchecked control boundary", colors.textSubtle, colors.canvas],
  ["de-emphasised icon link", colors.textSubtle, colors.canvas],
] as const;

describe("palette contrast", () => {
  it.each(textPairs)("%s clears 4.5:1 for body text", (_role, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(uiPairs)("%s clears 3:1 for a UI component", (_role, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(3);
  });

  it("keeps the translucent focus ring off the load-bearing indicator", () => {
    // --color-focus-ring is a 24% wash that only reaches ~1.5:1, so it may
    // only ever be a halo beside a solid border, never the indicator itself.
    expect(colors.focusRing).toContain("/");
    expect(rawTheme.shadows.focus).toContain("var(--color-focus-ring)");
  });

  it("proves the checker fails a pairing that is genuinely too light", () => {
    expect(contrast(colors.textMuted, colors.canvas)).toBeLessThan(3);
  });
});
