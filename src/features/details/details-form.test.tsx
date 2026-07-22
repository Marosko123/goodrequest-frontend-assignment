import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { DonorDetails } from "@/domain/donation";

import { DetailsForm } from "./details-form";

function renderForm(onComplete = vi.fn<(donor: DonorDetails) => void>()) {
  render(<DetailsForm onBack={vi.fn()} onComplete={onComplete} />);
  return onComplete;
}

describe("DetailsForm", () => {
  it("commits normalized Czech donor details", async () => {
    const onComplete = renderForm();
    const user = userEvent.setup();

    await user.type(
      screen.getByRole("textbox", { name: "Priezvisko" }),
      "Nováková",
    );
    await user.type(
      screen.getByRole("textbox", { name: "E-mailová adresa" }),
      "jana@example.sk",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Krajina telefónneho čísla" }),
      "CZ",
    );
    expect(screen.getByTestId("phone-country-flag")).toHaveAttribute(
      "data-country",
      "CZ",
    );
    expect(screen.getByTestId("phone-prefix")).toHaveTextContent("+420");
    await user.type(
      screen.getByRole("textbox", { name: "Telefónne číslo" }),
      "777 123 456",
    );
    await user.click(screen.getByRole("button", { name: "Pokračovať" }));

    await waitFor(() =>
      expect(onComplete).toHaveBeenCalledWith({
        firstName: "",
        lastName: "Nováková",
        email: "jana@example.sk",
        phoneE164: "+420777123456",
        phoneCountry: "CZ",
      }),
    );
  });

  it("uses vector flags instead of platform emoji", () => {
    renderForm();

    const country = screen.getByRole("combobox", {
      name: "Krajina telefónneho čísla",
    });
    expect(country.textContent).not.toMatch(/[🇸🇰🇨🇿]/u);
    expect(screen.getByTestId("phone-country-flag").tagName).toBe("svg");
  });

  it("synchronizes country when an international prefix is pasted", async () => {
    renderForm();
    const user = userEvent.setup();
    const country = screen.getByRole("combobox", {
      name: "Krajina telefónneho čísla",
    });

    expect(country).toHaveValue("SK");
    await user.type(
      screen.getByRole("textbox", { name: "Telefónne číslo" }),
      "+420 777 123 456",
    );

    expect(country).toHaveValue("CZ");
  });

  it("focuses the first invalid required field", async () => {
    renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Pokračovať" }));

    expect(screen.getByRole("textbox", { name: "Priezvisko" })).toHaveFocus();
    expect(
      screen.getByRole("alert", { name: "Formulár obsahuje chyby" }),
    ).toBeInTheDocument();
  });
});
