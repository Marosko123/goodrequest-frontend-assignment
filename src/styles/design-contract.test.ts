import { render } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { LogoSvg, Wordmark } from "@/components/layout/logo.styles";
import { Shell as DonationShell } from "@/components/layout/donation-shell.styles";
import { ButtonRoot } from "@/components/ui/button.styles";
import { ChoiceInput } from "@/components/ui/choice-control.styles";
import { Alert } from "@/components/ui/inline-alert.styles";
import { Input } from "@/components/ui/text-field.styles";
import { StatsGrid } from "@/features/about/results-stats.styles";

import { rawTheme, theme } from "./theme";

function renderElement(element: ReactNode): HTMLElement {
  const { container } = render(element);
  return container.firstElementChild as HTMLElement;
}

describe("Figma design contract", () => {
  it("keeps the exact semantic palette and 1440px geometry", () => {
    expect(rawTheme.colors).toMatchObject({
      surface: "#f3f4f6",
      surfaceHover: "#e5e7eb",
      surfacePressed: "#d1d5db",
      textSecondary: "#374151",
      textTertiary: "#4b5563",
      textMuted: "#9ca3af",
      border: "#d1d5db",
      borderSubtle: "#e5e7eb",
      primary: "#4f46e5",
      primaryHover: "#4338ca",
      primaryPressed: "#3730a3",
      primarySoft: "#e0e7ff",
      primaryDisabled: "#a5b4fc",
      danger: "#e11d48",
      dangerHover: "#be123c",
      dangerPressed: "#9f1239",
      dangerSoft: "#ffe4e6",
      success: "#047857",
      successSoft: "#d1fae5",
      warning: "#b45309",
      warningSoft: "#fef3c7",
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

  it("keeps finite button variants, focus and reduced motion in static rules", () => {
    const button = renderElement(createElement(ButtonRoot));

    expect(button).toHaveStyleRule("min-height", theme.sizes.controlSm, {
      modifier: '&[data-size="sm"]',
    });
    expect(button).toHaveStyleRule("background", theme.colors.primary, {
      modifier: '&[data-variant="primary"]',
    });
    expect(button).toHaveStyleRule("box-shadow", theme.shadows.focus, {
      modifier: '&[data-variant="primary"]:focus-visible',
    });
    expect(button).toHaveStyleRule("transition", "none", {
      media: "(prefers-reduced-motion: reduce)",
    });
  });

  it("keeps field error, choice motion and alert tone rules", () => {
    const input = renderElement(createElement(Input));
    const choice = renderElement(createElement(ChoiceInput));
    const alert = renderElement(createElement(Alert));

    expect(input).toHaveStyleRule("border-color", theme.colors.dangerHover, {
      modifier: '&[aria-invalid="true"]',
    });
    expect(input).toHaveStyleRule("background", theme.colors.dangerSoft, {
      modifier: '&[aria-invalid="true"]',
    });
    expect(choice).toHaveStyleRule("transition", "none", {
      media: "(prefers-reduced-motion: reduce)",
      modifier: "&",
    });
    expect(alert).toHaveStyleRule("background", theme.colors.dangerSoft, {
      modifier: '&[data-tone="error"]',
    });
  });

  it("keeps logo motion delayed, static under reduced motion and 2rem high", () => {
    const logo = renderElement(createElement(LogoSvg));
    const wordmark = renderElement(createElement(Wordmark));

    expect(logo).toHaveStyleRule("height", "2rem");
    expect(wordmark).toHaveStyleRule(
      "animation",
      expect.stringContaining("9s var(--ease-enter) 3s infinite both"),
    );
    expect(wordmark).toHaveStyleRule("animation", "none", {
      media: "(prefers-reduced-motion: reduce)",
    });
  });

  it("keeps desktop shell and results geometry exact", () => {
    const shell = renderElement(createElement(DonationShell));
    const stats = renderElement(createElement(StatsGrid));

    expect(shell).toHaveStyleRule(
      "grid-template-columns",
      `${theme.layout.contentMax} ${theme.layout.donationMediaWidth}`,
    );
    expect(shell).toHaveStyleRule("gap", theme.layout.donationLayoutGap);
    expect(shell).toHaveStyleRule(
      "padding-inline",
      `${theme.layout.pageGutterDesktop} ${theme.layout.donationMediaInset}`,
    );
    expect(stats).toHaveStyleRule("max-width", "76rem");
    expect(stats).toHaveStyleRule("min-height", "6.5rem");
  });
});
