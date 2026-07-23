import { render, screen, waitFor } from "@testing-library/react";
import { act } from "@testing-library/react";
import i18next from "i18next";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { DonorDetails } from "@/domain/donation";

import { DetailsForm } from "./details-form";

function renderForm(onComplete = vi.fn<(donor: DonorDetails) => void>()) {
  render(<DetailsForm onBack={vi.fn()} onComplete={onComplete} />);
  return onComplete;
}

describe("DetailsForm", () => {
  it("restores a committed international phone as a formatted national part", () => {
    render(
      <DetailsForm
        initialValue={{
          firstName: "Jana",
          lastName: "Nováková",
          email: "Jana@example.sk",
          phoneCountry: "SK",
          phoneE164: "+421901234567",
        }}
        onBack={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("textbox", { name: "Telefónne číslo" }),
    ).toHaveValue("901 234 567");
    expect(screen.getByTestId("phone-prefix")).toHaveTextContent("+421");
  });

  it("marks only the required personal fields", () => {
    renderForm();

    const firstName = screen.getByRole("textbox", {
      name: "Meno",
    }) as HTMLInputElement;
    const lastName = screen.getByRole("textbox", {
      name: "Priezvisko",
    }) as HTMLInputElement;
    const email = screen.getByRole("textbox", {
      name: "E-mailová adresa",
    }) as HTMLInputElement;
    const phone = screen.getByRole("textbox", {
      name: "Telefónne číslo",
    }) as HTMLInputElement;

    expect(firstName.labels?.[0]).toHaveTextContent("Meno");
    expect(firstName.labels?.[0]).not.toHaveTextContent("*");
    expect(lastName.labels?.[0]).toHaveTextContent("Priezvisko *");
    expect(email.labels?.[0]).toHaveTextContent("E-mailová adresa *");
    expect(phone.labels?.[0]).toHaveTextContent("Telefónne číslo *");
  });

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
    const phone = screen.getByRole("textbox", { name: "Telefónne číslo" });
    await user.click(phone);
    await user.paste("00420 777 123 456");

    expect(country).toHaveValue("CZ");
    expect(phone).toHaveValue("777 123 456");
    expect(screen.getByTestId("phone-prefix")).toHaveTextContent("+420");
  });

  it("formats the national part while typing and rejects letters immediately", async () => {
    renderForm();
    const user = userEvent.setup();
    const phone = screen.getByRole("textbox", { name: "Telefónne číslo" });

    await user.type(phone, "901a");

    expect(phone).toHaveValue("901");
    await waitFor(() =>
      expect(phone).toHaveAccessibleDescription(
        "Telefónne číslo môže obsahovať iba číslice, medzery, zátvorky, bodky, + a pomlčky.",
      ),
    );

    await act(() => i18next.changeLanguage("en"));
    expect(phone).toHaveAccessibleDescription(
      "A phone number may contain only digits, spaces, parentheses, periods, + and hyphens.",
    );
    await act(() => i18next.changeLanguage("sk"));

    await user.type(phone, "234567");
    expect(phone).toHaveValue("901 234 567");
    expect(phone).not.toHaveAttribute("aria-invalid");
  });

  it("validates on blur and removes an old phone error while correcting it", async () => {
    renderForm();
    const user = userEvent.setup();
    const phone = screen.getByRole("textbox", { name: "Telefónne číslo" });

    await user.type(phone, "123");
    await user.tab();
    await waitFor(() => expect(phone).toHaveAttribute("aria-invalid", "true"));

    await user.clear(phone);
    await user.type(phone, "901234567");
    expect(phone).toHaveValue("901 234 567");
    await waitFor(() => expect(phone).not.toHaveAttribute("aria-invalid"));
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
