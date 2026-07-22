import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppFooter } from "./app-footer";
import { Logo } from "./logo";

describe("Figma branding", () => {
  it("renders the exported vector logo", () => {
    const { container } = render(<Logo />);

    expect(container.querySelector("svg")).toHaveAttribute(
      "viewBox",
      "2324 372 217 56",
    );
    expect(container.querySelectorAll("svg path")).toHaveLength(2);
  });

  it("includes the social links shown in the footer design", () => {
    render(<AppFooter />);

    expect(screen.getByRole("link", { name: "Facebook" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Instagram" })).toBeInTheDocument();
  });
});
