import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import type { DonationSelection } from "@/domain/donation";
import { server } from "@/test/server";

import { SelectionForm } from "./selection-form";

const sheltersUrl =
  "https://frontend-assignment-api.goodrequest.dev/api/v1/shelters/";

function renderForm(
  onComplete = vi.fn<(selection: DonationSelection) => void>(),
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <SelectionForm onComplete={onComplete} />
    </QueryClientProvider>,
  );

  return onComplete;
}

describe("SelectionForm", () => {
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
    await user.click(screen.getByRole("button", { name: "50 €" }));
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

    await user.click(screen.getByRole("button", { name: "20 €" }));
    await user.click(screen.getByRole("button", { name: "Pokračovať" }));

    await waitFor(() =>
      expect(onComplete).toHaveBeenCalledWith({
        target: "foundation",
        amountCents: 2000,
      }),
    );
  });

  it("focuses the invalid amount and explains the error", async () => {
    server.use(
      http.get(sheltersUrl, () => HttpResponse.json({ shelters: [] })),
    );
    renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Pokračovať" }));

    const amount = screen.getByRole("textbox", { name: "Vlastná suma" });
    expect(amount).toHaveFocus();
    expect(amount).toHaveAccessibleDescription(
      "Zadajte kladnú sumu najviac na dve desatinné miesta.",
    );
    expect(
      screen.getByRole("alert", { name: "Formulár obsahuje chyby" }),
    ).toBeInTheDocument();
  });
});
