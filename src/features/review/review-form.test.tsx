import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { DonationSelection, DonorDetails } from "@/domain/donation";
import { ApiError } from "@/lib/api/client";

import { ReviewForm } from "./review-form";

const foundationSelection: DonationSelection = {
  target: "foundation",
  amountCents: 5_000,
};
const shelterSelection: DonationSelection = {
  target: "shelter",
  amountCents: 2_000,
  shelter: { id: 4, name: "Žilinský útulok" },
};
const donor: DonorDetails = {
  firstName: "Jana",
  lastName: "Nováková",
  email: "jana@example.sk",
  phoneE164: "+421901234567",
  phoneCountry: "SK",
};
const acceptedResponse = {
  messages: [{ message: "Príspevok bol prijatý", type: "SUCCESS" as const }],
};

function renderForm({
  selection = foundationSelection,
  submit = vi.fn().mockResolvedValue(acceptedResponse),
} = {}) {
  const onSuccess = vi.fn();
  const view = render(
    <ReviewForm
      donor={donor}
      onBack={vi.fn()}
      onEditDetails={vi.fn()}
      onEditSelection={vi.fn()}
      onSuccess={onSuccess}
      selection={selection}
      submit={submit}
    />,
  );
  return { ...view, onSuccess, submit };
}

describe("ReviewForm", () => {
  it("shows a domain-consistent summary for both contribution targets", () => {
    const { unmount } = renderForm();
    expect(screen.getByText("Celá nadácia GoodBoy")).toBeInTheDocument();
    expect(screen.queryByText("Žilinský útulok")).not.toBeInTheDocument();
    unmount();

    renderForm({ selection: shelterSelection });
    expect(screen.getByText("Žilinský útulok")).toBeInTheDocument();
    expect(screen.getByText("20,00 €")).toBeInTheDocument();
  });

  it("requires consent and focuses it before submission", async () => {
    const { submit } = renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Odoslať príspevok" }));

    expect(screen.getByRole("checkbox", { name: /súhlasím/i })).toHaveFocus();
    expect(submit).not.toHaveBeenCalled();
  });

  it("uses a synchronous lock against duplicate submissions", async () => {
    let resolveRequest: ((value: typeof acceptedResponse) => void) | undefined;
    const submit = vi.fn(
      () =>
        new Promise<typeof acceptedResponse>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const { onSuccess } = renderForm({ submit });
    const user = userEvent.setup();

    await user.click(screen.getByRole("checkbox", { name: /súhlasím/i }));
    const form = screen.getByRole("form", { name: "Potvrdenie príspevku" });
    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    resolveRequest?.(acceptedResponse);
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it("explains an unknown timeout and retries only after another action", async () => {
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("timeout", "timeout"))
      .mockResolvedValueOnce(acceptedResponse);
    const { onSuccess } = renderForm({ submit });
    const user = userEvent.setup();

    await user.click(screen.getByRole("checkbox", { name: /súhlasím/i }));
    await user.click(screen.getByRole("button", { name: "Odoslať príspevok" }));

    expect(
      await screen.findByText(/výsledok odoslania nepoznáme/i),
    ).toBeVisible();
    expect(submit).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Skúsiť znova" }));
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});
