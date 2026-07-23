import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PrimaryActionLink } from "./primary-action-link";

describe("PrimaryActionLink", () => {
  it("keeps button styling on a semantic link", () => {
    render(<PrimaryActionLink href="/en/">Back home</PrimaryActionLink>);

    const link = screen.getByRole("link", { name: "Back home" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/en");
    expect(link).toHaveAttribute("data-ui", "primary-action-link");
  });
});
