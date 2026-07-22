import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DonationShell } from "./donation-shell";

describe("DonationShell", () => {
  it("provides the shared stepper, artwork and footer navigation", () => {
    render(
      <DonationShell currentStep={1}>
        <h1>Obsah kroku</h1>
      </DonationShell>,
    );

    expect(
      screen.getByRole("heading", { name: "Obsah kroku" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Mladý pes na pláži" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kontakt" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.getByRole("link", { name: "O projekte" })).toHaveAttribute(
      "href",
      "/about",
    );
  });
});
