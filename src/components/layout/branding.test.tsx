import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppFooter } from "./app-footer";
import { Logo } from "./logo";

describe("Figma branding", () => {
  it("renders the exported vector logo", () => {
    const { container } = render(<Logo />);
    const dog = container.querySelector('[data-logo-part="dog"]');
    const wordmark = container.querySelector('[data-logo-part="wordmark"]');
    const ball = container.querySelector('[data-logo-part="ball"]');

    expect(container.querySelector("svg")).toHaveAttribute(
      "viewBox",
      "2324 372 217 56",
    );
    expect(container.querySelector("svg")).toHaveAttribute(
      "data-motion",
      "playful",
    );
    expect(container.querySelectorAll("svg path")).toHaveLength(2);
    expect(dog).toBeInTheDocument();
    expect(dog?.querySelector("path")).toHaveAttribute("fill", "#4F46E5");
    expect(wordmark).toHaveAttribute("fill", "#111827");
    expect(wordmark).toHaveAttribute("class");
    expect(ball?.querySelectorAll("circle")).toHaveLength(2);
    expect(ball?.querySelectorAll("circle")[0]).toHaveAttribute(
      "fill",
      "#F59E0B",
    );
    expect(ball?.querySelectorAll("circle")[1]).toHaveAttribute(
      "fill",
      "#FEF3C7",
    );
  });

  it("includes the social links shown in the footer design", () => {
    render(<AppFooter />);

    expect(screen.getByRole("link", { name: "Facebook" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Instagram" })).toBeInTheDocument();
  });
});
