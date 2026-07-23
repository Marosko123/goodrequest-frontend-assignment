import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { theme } from "@/styles/theme";

import { SocialLink } from "./social-link";

const cases = [
  ["facebook", "brand"],
  ["facebook", "gray"],
  ["facebook", "surface"],
  ["instagram", "brand"],
  ["instagram", "gray"],
  ["instagram", "surface"],
] as const;

function renderSocialLink(
  platform: (typeof cases)[number][0] = "facebook",
  variant: (typeof cases)[number][1] = "gray",
) {
  render(
    <SocialLink
      href={`https://example.com/${platform}`}
      platform={platform}
      variant={variant}
    />,
  );

  return screen.getByRole("link", {
    name: platform === "facebook" ? "Facebook" : "Instagram",
  });
}

describe("SocialLink", () => {
  it.each(cases)(
    "renders the exact %s %s variant as an accessible external link",
    (platform, variant) => {
      const link = renderSocialLink(platform, variant);
      const icon = link.querySelector("svg");

      expect(link).toHaveAttribute("data-platform", platform);
      expect(link).toHaveAttribute("data-variant", variant);
      expect(link).toHaveAttribute("href", `https://example.com/${platform}`);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(icon).toHaveAttribute("focusable", "false");
      expect(icon).toHaveAttribute("data-social-icon", platform);
      expect(icon).toHaveAttribute("data-social-variant", variant);
      expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
    },
  );

  it("keeps the exported Facebook and Instagram vector layers", () => {
    const facebook = renderSocialLink("facebook", "brand");
    const facebookPaths = facebook.querySelectorAll("path");

    expect(facebookPaths).toHaveLength(2);
    expect(facebookPaths[0]).toHaveAttribute("fill", "#1877F2");
    expect(facebookPaths[1]).toHaveAttribute("fill", "#FFFFFF");

    const instagram = renderSocialLink("instagram", "brand");
    const instagramPaths = instagram.querySelectorAll("path");

    expect(instagramPaths).toHaveLength(3);
    expect(instagramPaths[0]?.getAttribute("d")).toContain(
      "247.653 435.097 247.859 434.225 247.916 432.95",
    );
  });

  it("uses the exact contextual colors", () => {
    const link = renderSocialLink();

    // textSubtle, not textMuted: a quiet icon link still has to clear the 3:1
    // that WCAG 1.4.11 asks of a meaningful UI component.
    expect(link).toHaveStyleRule("color", theme.colors.textSubtle, {
      modifier: '&[data-variant="gray"]',
    });
    expect(link).toHaveStyleRule("color", theme.colors.canvas, {
      modifier: '&[data-variant="surface"]',
    });
    expect(link).toHaveStyleRule("color", theme.colors.surface, {
      media: "(hover: hover) and (pointer: fine)",
      modifier: '&[data-variant="surface"]:hover',
    });
    expect(link).toHaveStyleRule("color", theme.colors.surface, {
      modifier: '&[data-variant="surface"]:focus-visible',
    });
    expect(link).toHaveStyleRule("color", "#1877f2", {
      modifier: '&[data-variant="brand"][data-platform="facebook"]',
    });
    expect(link).toHaveStyleRule("color", "#000100", {
      modifier: '&[data-variant="brand"][data-platform="instagram"]',
    });
  });

  it.each([
    ["facebook", "#1877F2", 2],
    ["instagram", "#000100", 3],
  ] as const)(
    "crossfades the gray %s icon to its exact brand artwork",
    (platform, brandColor, brandPathCount) => {
      const link = renderSocialLink(platform, "gray");
      const monochromeLayer = link.querySelector(
        '[data-social-layer="monochrome"]',
      );
      const brandLayer = link.querySelector('[data-social-layer="brand"]');

      expect(monochromeLayer).toBeInTheDocument();
      expect(brandLayer).toBeInTheDocument();
      expect(brandLayer?.querySelectorAll("path")).toHaveLength(brandPathCount);
      expect(brandLayer?.querySelector("path")).toHaveAttribute(
        "fill",
        brandColor,
      );
      expect(link).toHaveStyleRule("opacity", "1", {
        modifier: '&[data-variant="gray"] [data-social-layer="monochrome"]',
      });
      expect(link).toHaveStyleRule("opacity", "0", {
        modifier: '&[data-variant="gray"] [data-social-layer="brand"]',
      });
      expect(link).toHaveStyleRule("opacity", "0", {
        media: "(hover: hover) and (pointer: fine)",
        modifier:
          '&[data-variant="gray"]:hover [data-social-layer="monochrome"]',
      });
      expect(link).toHaveStyleRule("opacity", "1", {
        media: "(hover: hover) and (pointer: fine)",
        modifier: '&[data-variant="gray"]:hover [data-social-layer="brand"]',
      });
      expect(link).toHaveStyleRule("opacity", "1", {
        modifier:
          '&[data-variant="gray"]:focus-visible [data-social-layer="brand"]',
      });
    },
  );

  it("uses the shared pressable motion without animating every property", () => {
    const link = renderSocialLink();

    expect(link).toHaveStyleRule(
      "transition",
      expect.stringContaining("color var(--motion-fast) var(--ease-standard)"),
    );
    expect(link).not.toHaveStyleRule(
      "transition",
      expect.stringMatching(/\ball\b/),
    );
    expect(link).toHaveStyleRule("transform", "translateY(-1px)", {
      media: "(hover: hover) and (pointer: fine)",
      modifier: "&:hover:not(:disabled)",
    });
    expect(link).toHaveStyleRule("transform", "scale(0.98)", {
      modifier: "&:active:not(:disabled)",
    });
    expect(link).toHaveStyleRule("transition", "none", {
      media: "(prefers-reduced-motion: reduce)",
    });
    expect(link).toHaveStyleRule("transition", "none", {
      media: "(prefers-reduced-motion: reduce)",
      modifier: '&[data-variant="gray"] [data-social-layer="monochrome"]',
    });
    expect(link).toHaveStyleRule("transition", "none", {
      media: "(prefers-reduced-motion: reduce)",
      modifier: '&[data-variant="gray"] [data-social-layer="brand"]',
    });
    expect(link).toHaveStyleRule("transform", "none", {
      media:
        "(prefers-reduced-motion: reduce) and (hover: hover) and (pointer: fine)",
      modifier: "&:hover:not(:disabled)",
    });
    expect(link).toHaveStyleRule("transform", "none", {
      media: "(prefers-reduced-motion: reduce)",
      modifier: "&:active:not(:disabled)",
    });
  });

  it("renders a 24px icon with a 44px coarse-pointer target", () => {
    const link = renderSocialLink();

    expect(link).toHaveStyleRule("width", theme.sizes.iconLg);
    expect(link).toHaveStyleRule("height", theme.sizes.iconLg);
    expect(link).toHaveStyleRule("width", theme.sizes.tapTarget, {
      media: "(pointer: coarse)",
    });
    expect(link).toHaveStyleRule("height", theme.sizes.tapTarget, {
      media: "(pointer: coarse)",
    });
    expect(link).toHaveStyleRule("width", theme.sizes.iconLg, {
      modifier: "svg",
    });
    expect(link).toHaveStyleRule("height", theme.sizes.iconLg, {
      modifier: "svg",
    });
  });
});
