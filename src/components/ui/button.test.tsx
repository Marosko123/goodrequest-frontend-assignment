import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("forwards an enabled click", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Pokračovať</Button>);
    const button = screen.getByRole("button", { name: "Pokračovať" });

    expect(button).toHaveAttribute("data-size", "xl");
    expect(button).toHaveAttribute("data-variant", "primary");
    await user.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("announces loading and blocks another click", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button loading loadingLabel="Odosielame…" onClick={onClick}>
        Odoslať formulár
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Odosielame…" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("data-loading", "true");
    expect(button).toHaveStyleRule("cursor", "progress", {
      modifier: '&[data-loading="true"]:disabled',
    });
    expect(button).toHaveStyleRule("opacity", "1", {
      modifier: '&[data-loading="true"]:disabled',
    });
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("uses the supplied eight-segment spinner geometry at each button size", () => {
    const { container, rerender } = render(
      <Button loading size="xl">
        Odoslať formulár
      </Button>,
    );
    const spinner = container.querySelector<SVGSVGElement>(
      'svg[data-icon="loading-spinner"]',
    );

    expect(spinner).toHaveAttribute("viewBox", "377 486 20 20");
    expect(spinner).toHaveAttribute("data-size", "md");
    expect(spinner?.querySelectorAll("rect")).toHaveLength(8);
    expect(
      Array.from(spinner?.querySelectorAll("rect") ?? []).map((segment) =>
        segment.getAttribute("opacity"),
      ),
    ).toEqual([null, "0.16", "0.4", "0.28", "0.52", "0.64", "0.88", "0.76"]);

    rerender(
      <Button loading size="sm">
        Skúsiť znova
      </Button>,
    );
    expect(
      container.querySelector('svg[data-icon="loading-spinner"]'),
    ).toHaveAttribute("data-size", "sm");
  });
});
