import { describe, expect, it } from "vitest";

import { rawTheme, theme } from "./theme";

describe("styled-components theme contract", () => {
  it("keeps the exported semantic colors and layout geometry exact", () => {
    expect(rawTheme.colors).toMatchObject({
      primary: "#4f46e5",
      primaryHover: "#4338ca",
      primaryPressed: "#3730a3",
      danger: "#e11d48",
      success: "#047857",
      surface: "#f3f4f6",
      text: "#111827",
    });
    expect(rawTheme.layout).toEqual({
      pageMax: "90rem",
      pageGutterDesktop: "5rem",
      pagePaddingBlockDesktop: "3.75rem",
      contentMax: "41.125rem",
      donationLayoutGap: "5rem",
      donationMediaWidth: "37.625rem",
      donationMediaInset: "1.25rem",
      publicContentMax: "80rem",
      publicImageMax: "70rem",
      publicImageHeight: "23.5rem",
    });
  });

  it("exposes stable CSS-variable references without a runtime provider", () => {
    expect(theme.colors.primary).toBe("var(--color-primary)");
    expect(theme.typography.textMdRegular).toBe("var(--type-text-md-regular)");
    expect(theme.motion.easePlayful).toBe("var(--ease-playful)");
    expect(theme.sizes.controlHeight).toBe("var(--control-height)");
  });
});
