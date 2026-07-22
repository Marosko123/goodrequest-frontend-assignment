import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextField } from "./text-field";

describe("TextField", () => {
  it("connects its label, requirement and error message", () => {
    render(
      <TextField
        id="last-name"
        label="Priezvisko"
        required
        error="Zadajte priezvisko."
      />,
    );

    const input = screen.getByRole("textbox", { name: "Priezvisko" });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Zadajte priezvisko.");
  });

  it("uses a hint as the accessible description without an error", () => {
    render(
      <TextField
        id="email"
        label="E-mail"
        hint="Použijeme ho iba k príspevku."
      />,
    );

    expect(
      screen.getByRole("textbox", { name: "E-mail" }),
    ).toHaveAccessibleDescription("Použijeme ho iba k príspevku.");
  });
});
