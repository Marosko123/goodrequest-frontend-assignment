import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InlineAlert } from "./inline-alert";

describe("InlineAlert", () => {
  it("uses the supplied featured icon without making color the only cue", () => {
    const { container } = render(
      <InlineAlert title="Čakáme na potvrdenie" tone="info">
        Odosielame údaje.
      </InlineAlert>,
    );
    const alert = screen.getByRole("status", {
      name: "Čakáme na potvrdenie",
    });
    const featuredIcon = container.querySelector(
      '[data-featured-icon][data-tone="info"]',
    );
    const icon = featuredIcon?.querySelector('svg[data-icon="alert-circle"]');

    expect(alert).toHaveAttribute("aria-atomic", "true");
    expect(featuredIcon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("viewBox", "274 262 20 20");
    expect(icon?.querySelector("path")).toHaveAttribute(
      "d",
      "M284 268.667V272M284 275.333H284.008M292.333 272C292.333 276.602 288.602 280.333 284 280.333C279.398 280.333 275.667 276.602 275.667 272C275.667 267.397 279.398 263.667 284 263.667C288.602 263.667 292.333 267.397 292.333 272Z",
    );
    expect(alert).toHaveTextContent("Čakáme na potvrdenie");
    expect(alert).toHaveTextContent("Odosielame údaje.");
  });

  it("announces destructive feedback assertively", () => {
    render(
      <InlineAlert title="Odoslanie zlyhalo" tone="error">
        Skúste to znova.
      </InlineAlert>,
    );

    expect(
      screen.getByRole("alert", { name: "Odoslanie zlyhalo" }),
    ).toHaveAttribute("aria-live", "assertive");
  });
});
