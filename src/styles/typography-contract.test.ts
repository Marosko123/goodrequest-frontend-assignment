import { describe, expect, it } from "vitest";

import { rawTheme, theme } from "./theme";

describe("Figma typography contract", () => {
  it("keeps the complete reusable type scale from the supplied exports", () => {
    expect(rawTheme.typography).toMatchObject({
      headingLgBold: "700 3rem/3.5rem var(--font-sans)",
      headingXlRegular: "400 3.75rem/4.5rem var(--font-sans)",
      headingXlSemibold: "600 3.75rem/4.5rem var(--font-sans)",
      headingXlSemiboldCompact: "600 2.5rem/3rem var(--font-sans)",
      textXlSemibold: "600 1.25rem/2rem var(--font-sans)",
      textLgMedium: "500 1.125rem/1.5rem var(--font-sans)",
      textMdRegular: "400 1rem/1.5rem var(--font-sans)",
      textMdMedium: "500 1rem/1.5rem var(--font-sans)",
      textMdSemibold: "600 1rem/1.5rem var(--font-sans)",
      textSmRegular: "400 0.875rem/1.25rem var(--font-sans)",
      textSmMedium: "500 0.875rem/1.25rem var(--font-sans)",
      lineHeightTextMd: "1.5rem",
      trackingHeading: "-0.3px",
    });
  });

  it("exposes all typography roles through stable CSS-variable references", () => {
    expect(theme.typography.headingLgBold).toBe("var(--type-heading-lg-bold)");
    expect(theme.typography.textMdRegular).toBe("var(--type-text-md-regular)");
    expect(theme.typography.trackingHeading).toBe("var(--tracking-heading)");
  });
});
