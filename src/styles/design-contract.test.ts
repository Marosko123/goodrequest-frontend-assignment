import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const stylesDirectory = dirname(fileURLToPath(import.meta.url));
const sourceDirectory = join(stylesDirectory, "..");

function readSource(relativePath: string) {
  return readFileSync(join(sourceDirectory, relativePath), "utf8");
}

const figmaColors = {
  "--color-surface": "#f3f4f6",
  "--color-surface-hover": "#e5e7eb",
  "--color-surface-pressed": "#d1d5db",
  "--color-text-secondary": "#374151",
  "--color-text-tertiary": "#4b5563",
  "--color-text-muted": "#9ca3af",
  "--color-border": "#d1d5db",
  "--color-border-subtle": "#e5e7eb",
  "--color-primary": "#4f46e5",
  "--color-primary-hover": "#4338ca",
  "--color-primary-pressed": "#3730a3",
  "--color-primary-soft": "#e0e7ff",
  "--color-primary-disabled": "#a5b4fc",
  "--color-danger": "#e11d48",
  "--color-danger-hover": "#be123c",
  "--color-danger-pressed": "#9f1239",
  "--color-danger-soft": "#ffe4e6",
  "--color-success": "#047857",
  "--color-success-soft": "#d1fae5",
  "--color-warning": "#b45309",
  "--color-warning-soft": "#fef3c7",
} as const;

describe("Figma design contract", () => {
  it("uses the exact exported semantic palette", () => {
    const tokens = readFileSync(
      join(stylesDirectory, "_tokens.scss"),
      "utf8",
    ).toLowerCase();

    for (const [name, value] of Object.entries(figmaColors)) {
      expect(tokens, `${name} is missing or has drifted`).toContain(
        `${name}: ${value};`,
      );
    }
  });

  it("defines the exported control geometry", () => {
    const tokens = readFileSync(join(stylesDirectory, "_tokens.scss"), "utf8");

    expect(tokens).toContain("--control-sm: 1.5rem;");
    expect(tokens).toContain("--control-md: 2rem;");
    expect(tokens).toContain("--control-lg: 3rem;");
    expect(tokens).toContain("--control-xl: 3.5rem;");
    expect(tokens).toContain("--radius-xs: 0.25rem;");
    expect(tokens).toContain("--radius-sm: 0.5rem;");
  });

  it("defines the shared 1440px desktop layout contract", () => {
    const tokens = readFileSync(join(stylesDirectory, "_tokens.scss"), "utf8");

    expect(tokens).toContain("--page-max: 90rem;");
    expect(tokens).toContain("--page-gutter-desktop: 5rem;");
    expect(tokens).toContain("--page-padding-block-desktop: 3.75rem;");
    expect(tokens).toContain("--content-max: 41.125rem;");
    expect(tokens).toContain("--donation-layout-gap: 5rem;");
    expect(tokens).toContain("--donation-media-width: 37.625rem;");
    expect(tokens).toContain("--donation-media-inset: 1.25rem;");
    expect(tokens).toContain("--public-content-max: 80rem;");
    expect(tokens).toContain("--public-image-max: 70rem;");
    expect(tokens).toContain("--public-image-height: 23.5rem;");
  });

  it("keeps desktop shell geometry exact and free of viewport clamps", () => {
    const donationShell = readSource(
      "components/layout/donation-shell.module.scss",
    );
    const contentShell = readSource(
      "components/layout/content-shell.module.scss",
    );

    expect(donationShell).toContain(
      "grid-template-columns: var(--content-max) var(--donation-media-width);",
    );
    expect(donationShell).toContain("gap: var(--donation-layout-gap);");
    expect(donationShell).toContain(
      "padding-inline: var(--page-gutter-desktop) var(--donation-media-inset);",
    );
    expect(contentShell).toContain(
      "padding: var(--page-padding-block-desktop) var(--page-gutter-desktop);",
    );
    expect(donationShell).not.toContain("clamp(");
    expect(contentShell).not.toContain("clamp(");
  });

  it("uses the exact public-page image, statistics and footer geometry", () => {
    const contact = readSource("features/contact/contact-content.module.scss");
    const about = readSource("features/about/about-content.module.scss");
    const stats = readSource("features/about/results-stats.module.scss");
    const footer = readSource("components/layout/app-footer.module.scss");

    expect(contact).toContain("max-width: var(--public-image-max);");
    expect(contact).toContain("height: var(--public-image-height);");
    expect(about).toContain("padding: var(--space-16) var(--space-8);");
    expect(about).toContain("height: 14.75rem;");
    expect(about).toContain("border-block: 1px solid var(--color-border);");
    expect(stats).toContain("max-width: 76rem;");
    expect(stats).toContain("min-height: 6.5rem;");
    expect(about).not.toContain("clamp(");
    expect(contact).not.toContain("clamp(");
    expect(footer).toContain(
      "padding-block-start: calc(var(--space-6) - 1px);",
    );
    expect(footer).not.toContain("padding-block: var(--space-6);");
    expect(readSource("components/layout/logo.module.scss")).toContain(
      "height: 2rem;",
    );
  });
});
