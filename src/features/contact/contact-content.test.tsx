import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContactContent } from "./contact-content";

describe("ContactContent", () => {
  it("exposes actionable contact details from the assignment", () => {
    render(<ContactContent />);

    expect(
      screen.getByRole("link", { name: "hello@goodrequest.com" }),
    ).toHaveAttribute("href", "mailto:hello@goodrequest.com");
    expect(
      screen.getByRole("link", { name: "+421 911 750 750" }),
    ).toHaveAttribute("href", "tel:+421911750750");
    expect(
      screen.getByRole("link", {
        name: "Obchodná 3D, 010 08 Žilina, Slovakia",
      }),
    ).toHaveAttribute("href", expect.stringContaining("google.com/maps"));
    expect(
      screen.getByRole("img", { name: /zlatý retriever/i }),
    ).toBeInTheDocument();
  });
});
