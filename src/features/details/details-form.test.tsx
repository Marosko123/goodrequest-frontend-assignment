import { render, screen, waitFor, within } from "@testing-library/react";
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
    expect(
      screen.getByRole("textbox", { name: "Predvoľba telefónneho čísla" }),
    ).toHaveValue("421");
  });

  it("marks only the required personal fields", () => {
    renderForm();

    const firstName = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Meno",
    });
    const lastName = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Priezvisko",
    });
    const email = screen.getByRole<HTMLInputElement>("textbox", {
      name: "E-mailová adresa",
    });
    const phone = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Telefónne číslo",
    });

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
    const country = screen.getByRole("combobox", {
      name: "Krajina telefónneho čísla",
    });
    await user.click(country);
    await user.click(
      screen.getByRole("option", {
        name: "Česko +420",
      }),
    );
    expect(country).toHaveAttribute("data-value", "CZ");
    expect(within(country).getByTestId("phone-country-flag")).toHaveAttribute(
      "data-country",
      "CZ",
    );
    expect(
      screen.getByRole("textbox", { name: "Predvoľba telefónneho čísla" }),
    ).toHaveValue("420");
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

  it("uses a local 3:2 vector asset instead of platform emoji", () => {
    renderForm();

    const country = screen.getByRole("combobox", {
      name: "Krajina telefónneho čísla",
    });
    const flag = within(country).getByTestId("phone-country-flag");

    expect(country.textContent).not.toMatch(/[🇸🇰🇨🇿]/u);
    expect(flag.tagName).toBe("IMG");
    expect(flag).toHaveAttribute("alt", "");
    expect(flag).toHaveAttribute("width", "24");
    expect(flag).toHaveAttribute("height", "16");
    expect(flag).toHaveAttribute("draggable", "false");
    expect(decodeURIComponent(flag.getAttribute("src") ?? "")).toContain(
      "Flag of Slovakia",
    );
  });

  it("switches between the Slovak and Czech flag assets", async () => {
    renderForm();
    const user = userEvent.setup();

    const country = screen.getByRole("combobox", {
      name: "Krajina telefónneho čísla",
    });
    expect(
      decodeURIComponent(
        within(country).getByTestId("phone-country-flag").getAttribute("src") ??
          "",
      ),
    ).toContain("Flag of Slovakia");

    await user.click(country);
    await user.click(
      screen.getByRole("option", {
        name: "Česko +420",
      }),
    );

    expect(
      decodeURIComponent(
        within(country).getByTestId("phone-country-flag").getAttribute("src") ??
          "",
      ),
    ).toContain("M450 300 0 0v600z");
  });

  it("synchronizes country when an international prefix is pasted", async () => {
    renderForm();
    const user = userEvent.setup();
    const country = screen.getByRole("combobox", {
      name: "Krajina telefónneho čísla",
    });

    expect(country).toHaveAttribute("data-value", "SK");
    const phone = screen.getByRole("textbox", { name: "Telefónne číslo" });
    await user.click(phone);
    await user.paste("00420 777 123 456");

    expect(country).toHaveAttribute("data-value", "CZ");
    expect(phone).toHaveValue("777 123 456");
    expect(
      screen.getByRole("textbox", { name: "Predvoľba telefónneho čísla" }),
    ).toHaveValue("420");
  });

  it("rewrites the dial code and crosses both keyboard boundaries", async () => {
    renderForm();
    const user = userEvent.setup();
    const country = screen.getByRole("combobox", {
      name: "Krajina telefónneho čísla",
    });
    const dialCode = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Predvoľba telefónneho čísla",
    });
    const phone = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Telefónne číslo",
    });

    dialCode.focus();
    dialCode.setSelectionRange(2, 3);
    await user.keyboard("0");

    expect(dialCode).toHaveValue("420");
    expect(country).toHaveAttribute("data-value", "CZ");
    expect(phone).toHaveFocus();

    await user.keyboard("777123456");
    expect(phone).toHaveValue("777 123 456");

    phone.setSelectionRange(0, 0);
    await user.keyboard("{ArrowLeft}");
    expect(dialCode).toHaveFocus();
    expect(dialCode.selectionStart).toBe(3);

    await user.keyboard("{ArrowRight}");
    expect(phone).toHaveFocus();
    expect(phone.selectionStart).toBe(0);

    await user.keyboard("{Backspace}");
    expect(dialCode).toHaveFocus();
    expect(dialCode).toHaveValue("42");
  });

  it("preserves the caret while correcting a formatted national number", async () => {
    renderForm();
    const user = userEvent.setup();
    const phone = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Telefónne číslo",
    });

    await user.type(phone, "901234567");
    phone.setSelectionRange(5, 6);
    await user.keyboard("8");

    expect(phone).toHaveValue("901 284 567");
    expect(phone.selectionStart).toBe(6);
    expect(phone.selectionEnd).toBe(6);
  });

  it("deletes the adjacent digit when Backspace meets a formatting space", async () => {
    renderForm();
    const user = userEvent.setup();
    const phone = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Telefónne číslo",
    });

    await user.type(phone, "901234567");
    phone.setSelectionRange(4, 4);
    await user.keyboard("{Backspace}");

    expect(phone).toHaveValue("902 345 67");
    expect(phone.selectionStart).toBe(2);
  });

  it("splits a complete number pasted into the dial-code input", async () => {
    renderForm();
    const user = userEvent.setup();
    const country = screen.getByRole("combobox", {
      name: "Krajina telefónneho čísla",
    });
    const dialCode = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Predvoľba telefónneho čísla",
    });
    const phone = screen.getByRole("textbox", { name: "Telefónne číslo" });

    await user.click(dialCode);
    await user.paste("+420 777 123 456");

    expect(dialCode).toHaveValue("420");
    expect(phone).toHaveValue("777 123 456");
    expect(country).toHaveAttribute("data-value", "CZ");
    expect(phone).toHaveFocus();
  });

  it("keeps an invalid dial code editable until it is corrected", async () => {
    renderForm();
    const user = userEvent.setup();
    const country = screen.getByRole("combobox", {
      name: "Krajina telefónneho čísla",
    });
    const dialCode = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Predvoľba telefónneho čísla",
    });
    const phone = screen.getByRole("textbox", { name: "Telefónne číslo" });

    await user.clear(dialCode);
    await user.type(dialCode, "422");

    expect(country).toHaveAttribute("data-value", "SK");
    expect(dialCode).toHaveFocus();
    expect(dialCode).toHaveAttribute("aria-invalid", "true");
    expect(dialCode).toHaveAccessibleDescription(
      "Použite slovenské alebo české číslo s predvoľbou +421 alebo +420.",
    );

    dialCode.setSelectionRange(2, 3);
    await user.keyboard("0");

    expect(country).toHaveAttribute("data-value", "CZ");
    expect(dialCode).not.toHaveAttribute("aria-invalid");
    expect(phone).toHaveFocus();
  });

  it("restores an incomplete dial code from the in-progress draft", () => {
    render(
      <DetailsForm
        initialDraft={{
          firstName: "",
          lastName: "",
          email: "",
          phoneDialCode: "42",
          phone: "",
          phoneCountry: "SK",
        }}
        onBack={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("textbox", { name: "Predvoľba telefónneho čísla" }),
    ).toHaveValue("42");
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

  it("blocks implausible personal details and accepts them after correction", async () => {
    const onComplete = renderForm();
    const user = userEvent.setup();
    const lastName = screen.getByRole("textbox", { name: "Priezvisko" });
    const email = screen.getByRole("textbox", {
      name: "E-mailová adresa",
    });

    await user.type(lastName, "Nováková7");
    await user.type(email, "donor@goodrequest");
    await user.type(
      screen.getByRole("textbox", { name: "Telefónne číslo" }),
      "901 234 567",
    );
    await user.click(screen.getByRole("button", { name: "Pokračovať" }));

    expect(onComplete).not.toHaveBeenCalled();
    expect(lastName).toHaveFocus();
    expect(lastName).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByRole("alert", { name: "Formulár obsahuje chyby" }),
    ).toBeInTheDocument();

    await user.clear(lastName);
    await user.type(lastName, "Nováková");
    await user.clear(email);
    await user.type(email, "donor@goodrequest.sk");
    await waitFor(() => {
      expect(lastName).not.toHaveAttribute("aria-invalid");
      expect(email).not.toHaveAttribute("aria-invalid");
    });
    await user.click(screen.getByRole("button", { name: "Pokračovať" }));

    await waitFor(() =>
      expect(onComplete).toHaveBeenCalledWith({
        firstName: "",
        lastName: "Nováková",
        email: "donor@goodrequest.sk",
        phoneE164: "+421901234567",
        phoneCountry: "SK",
      }),
    );
  });
});
