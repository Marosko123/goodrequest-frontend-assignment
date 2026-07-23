import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import i18next from "i18next";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DonationSelection } from "@/domain/donation";
import { queryKeys } from "@/lib/api/queries";
import { server } from "@/test/server";

import { SelectionForm } from "./selection-form";

const sheltersUrl =
  "https://frontend-assignment-api.goodrequest.dev/api/v1/shelters/";

function renderForm(
  onComplete = vi.fn<(selection: DonationSelection) => void>(),
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  }),
) {
  render(
    <QueryClientProvider client={queryClient}>
      <SelectionForm onComplete={onComplete} />
    </QueryClientProvider>,
  );

  return onComplete;
}

describe("SelectionForm", () => {
  beforeEach(() => {
    server.use(
      http.get(sheltersUrl, () => HttpResponse.json({ shelters: [] })),
    );
  });

  it("starts with an empty amount", () => {
    renderForm();

    expect(screen.getByRole("textbox", { name: "Vlastná suma" })).toHaveValue(
      "",
    );
  });

  it("rejects a negative paste atomically and reports it immediately", async () => {
    renderForm();
    const user = userEvent.setup();
    const amount = screen.getByRole("textbox", { name: "Vlastná suma" });

    await user.click(amount);
    await user.paste("-151");

    expect(amount).toHaveValue("");
    expect(amount).toHaveAccessibleDescription(
      "Použite iba číslice a najviac jeden desatinný oddeľovač.",
    );

    await act(() => i18next.changeLanguage("en"));
    expect(amount).toHaveAccessibleDescription(
      "Use digits and at most one decimal separator.",
    );
    await act(() => i18next.changeLanguage("sk"));

    await user.click(screen.getByRole("button", { name: /20\s€/u }));
    expect(amount).toHaveValue("20");
    expect(amount).not.toHaveAttribute("aria-invalid");
  });

  it("normalizes a localized amount paste without losing cents", async () => {
    renderForm();
    const user = userEvent.setup();
    const amount = screen.getByRole("textbox", { name: "Vlastná suma" });

    await user.click(amount);
    await user.paste("1 234,56 €");

    expect(amount).toHaveValue("1234,56");
  });

  it("replaces the old value with a preset after rejecting an over-limit edit", async () => {
    renderForm();
    const user = userEvent.setup();
    const amount = screen.getByRole("textbox", { name: "Vlastná suma" });

    await user.click(amount);
    fireEvent.change(amount, { target: { value: "1234,56" } });
    fireEvent.change(amount, { target: { value: "1000000,01" } });
    expect(amount).toHaveValue("1234,56");

    await user.click(screen.getByRole("button", { name: /20\s€/u }));

    expect(amount).toHaveValue("20");
    expect(amount).not.toHaveAttribute("aria-invalid");
  });

  it("keeps the animated shelter region inaccessible while collapsed", async () => {
    server.use(
      http.get(sheltersUrl, () =>
        HttpResponse.json({
          shelters: [{ id: 4, name: "Útulok pre psov - TEZAS" }],
        }),
      ),
    );
    renderForm();
    const user = userEvent.setup();

    const region = screen.getByTestId("shelter-region");
    const shelterTarget = screen.getByRole("radio", {
      name: "Prispieť konkrétnemu útulku",
    });
    const targetOptions = shelterTarget.closest("div");
    expect(targetOptions).toHaveAttribute("data-target", "foundation");
    expect(region).toHaveAttribute("data-expanded", "false");
    expect(region).toHaveAttribute("aria-hidden", "true");
    expect(
      within(region).getByRole("combobox", { hidden: true }),
    ).toBeDisabled();

    await user.click(shelterTarget);
    expect(targetOptions).toHaveAttribute("data-target", "shelter");
    expect(region).toHaveAttribute("data-expanded", "true");
    expect(region).not.toHaveAttribute("aria-hidden");
    expect(
      await screen.findByRole("combobox", { name: "Útulok" }),
    ).toBeEnabled();

    await user.click(
      screen.getByRole("radio", { name: "Prispieť celej nadácii" }),
    );
    expect(targetOptions).toHaveAttribute("data-target", "foundation");
    expect(region).toHaveAttribute("data-expanded", "false");
    expect(region).toHaveAttribute("aria-hidden", "true");
    expect(
      within(region).getByRole("combobox", { hidden: true }),
    ).toBeDisabled();
  });

  it("commits a shelter contribution with a preset amount", async () => {
    server.use(
      http.get(sheltersUrl, () =>
        HttpResponse.json({
          shelters: [{ id: 4, name: "Útulok pre psov - TEZAS" }],
        }),
      ),
    );
    const onComplete = renderForm();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("radio", { name: "Prispieť konkrétnemu útulku" }),
    );
    const select = await screen.findByRole("combobox", { name: "Útulok" });
    await user.selectOptions(select, "4");
    await user.click(screen.getByRole("button", { name: /50\s€/u }));
    await user.click(screen.getByRole("button", { name: "Pokračovať" }));

    await waitFor(() =>
      expect(onComplete).toHaveBeenCalledWith({
        target: "shelter",
        amountCents: 5000,
        shelter: { id: 4, name: "Útulok pre psov - TEZAS" },
      }),
    );
  });

  it("keeps the foundation flow usable when shelters fail", async () => {
    server.use(
      http.get(sheltersUrl, () => new HttpResponse(null, { status: 503 })),
    );
    const onComplete = renderForm();
    const user = userEvent.setup();

    expect(
      screen.getByRole("button", { name: "Späť" }).querySelector("svg"),
    ).toHaveAttribute("data-icon", "arrow-left");
    expect(
      screen.getByRole("button", { name: "Pokračovať" }).querySelector("svg"),
    ).toHaveAttribute("data-icon", "arrow-right");

    await user.click(screen.getByRole("button", { name: /20\s€/u }));
    await user.click(screen.getByRole("button", { name: "Pokračovať" }));

    await waitFor(() =>
      expect(onComplete).toHaveBeenCalledWith({
        target: "foundation",
        amountCents: 2000,
      }),
    );
  });

  it("explains an empty shelter list and disables the empty control", async () => {
    server.use(
      http.get(sheltersUrl, () => HttpResponse.json({ shelters: [] })),
    );
    renderForm();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("radio", { name: "Prispieť konkrétnemu útulku" }),
    );

    expect(
      await screen.findByRole("status", { name: /Žiadne dostupné útulky/u }),
    ).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Útulok" })).toBeDisabled();
  });

  it("clears a shelter that disappears after a refetch", async () => {
    let availableShelters = [{ id: 4, name: "Útulok pre psov - TEZAS" }];
    server.use(
      http.get(sheltersUrl, () =>
        HttpResponse.json({ shelters: availableShelters }),
      ),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    renderForm(vi.fn(), queryClient);
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("radio", { name: "Prispieť konkrétnemu útulku" }),
    );
    const select = await screen.findByRole("combobox", { name: "Útulok" });
    await user.selectOptions(select, "4");
    expect(select).toHaveValue("4");

    availableShelters = [];
    await act(() =>
      queryClient.invalidateQueries({ queryKey: queryKeys.shelters }),
    );

    await waitFor(() => expect(select).toHaveValue(""));
    expect(select).toBeDisabled();
  });

  it("focuses the invalid amount and explains the error", async () => {
    server.use(
      http.get(sheltersUrl, () => HttpResponse.json({ shelters: [] })),
    );
    renderForm();
    const user = userEvent.setup();

    await user.clear(screen.getByRole("textbox", { name: "Vlastná suma" }));
    await user.click(screen.getByRole("button", { name: "Pokračovať" }));

    const amount = screen.getByRole("textbox", { name: "Vlastná suma" });
    expect(amount).toHaveFocus();
    expect(amount).toHaveAccessibleDescription("Zadajte sumu príspevku.");
    expect(
      screen.getByRole("alert", { name: "Formulár obsahuje chyby" }),
    ).toBeInTheDocument();

    await act(() => i18next.changeLanguage("en"));
    expect(amount).toHaveAccessibleDescription("Enter a contribution amount.");
    expect(screen.getByRole("button", { name: "Continue" })).toBeVisible();
  });
});
