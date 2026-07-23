import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import i18next from "i18next";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { DonationSelection, DonorDetails } from "@/domain/donation";
import { ApiError } from "@/lib/api/client";
import { theme } from "@/styles/theme";

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
      onSuccess={onSuccess}
      selection={selection}
      submit={submit}
    />,
  );
  return { ...view, onSuccess, submit };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ReviewForm", () => {
  it("shows a domain-consistent summary for both contribution targets", () => {
    const { unmount } = renderForm();
    expect(
      screen.getByText("Finančný príspevok celej nadácii"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Žilinský útulok")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Upraviť" }),
    ).not.toBeInTheDocument();
    unmount();

    renderForm({ selection: shelterSelection });
    expect(screen.getByText("Žilinský útulok")).toBeInTheDocument();
    expect(screen.getByText("20 €")).toBeInTheDocument();
  });

  it("matches the consent label geometry and error treatment", async () => {
    renderForm();
    const user = userEvent.setup();
    const consent = screen.getByRole("checkbox", { name: /súhlasím/i });
    const consentLabel = consent.closest("label");

    expect(consentLabel).toHaveStyleRule("font", theme.typography.textSmMedium);
    expect(consentLabel).toHaveStyleRule("align-items", "flex-start");
    expect(consentLabel).toHaveStyleRule("margin-block-start", "2px", {
      modifier: "& > input",
    });

    await user.click(screen.getByRole("button", { name: "Odoslať formulár" }));

    expect(consentLabel).toHaveStyleRule("color", theme.colors.dangerHover, {
      modifier: '&:has(input[aria-invalid="true"]) > span',
    });
  });

  it("requires consent and focuses it before submission", async () => {
    const { submit } = renderForm();
    const user = userEvent.setup();
    const consent = screen.getByRole("checkbox", { name: /súhlasím/i });

    await user.click(screen.getByRole("button", { name: "Odoslať formulár" }));

    expect(consent).toBeRequired();
    expect(consent).toHaveFocus();
    expect(consent).toHaveAttribute("aria-invalid", "true");
    expect(consent).toHaveAttribute("aria-describedby", "consent-error");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Na odoslanie príspevku je potrebný Váš súhlas.",
    );
    expect(submit).not.toHaveBeenCalled();

    await user.click(consent);

    await waitFor(() => expect(consent).not.toHaveAttribute("aria-invalid"));
    expect(consent).not.toHaveAttribute("aria-describedby");
    expect(
      screen.queryByText("Na odoslanie príspevku je potrebný Váš súhlas."),
    ).not.toBeInTheDocument();
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
    expect(form).toHaveAttribute("aria-busy", "true");
    expect(
      screen.getByRole("status", { name: "Čakáme na potvrdenie" }),
    ).toHaveAttribute("data-tone", "info");
    expect(screen.getByRole("button", { name: "Odosielame…" })).toHaveAttribute(
      "aria-describedby",
      "submission-feedback",
    );
    await waitFor(() =>
      expect(
        screen.getByRole("checkbox", { name: /súhlasím/i }),
      ).toBeDisabled(),
    );
    resolveRequest?.(acceptedResponse);
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it("explains an unknown timeout and retries only after another action", async () => {
    let online = true;
    vi.spyOn(navigator, "onLine", "get").mockImplementation(() => online);
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("timeout", "timeout"))
      .mockResolvedValueOnce(acceptedResponse);
    const { onSuccess } = renderForm({ submit });
    const user = userEvent.setup();

    await user.click(screen.getByRole("checkbox", { name: /súhlasím/i }));
    await user.click(screen.getByRole("button", { name: "Odoslať formulár" }));

    expect(
      await screen.findByText(/výsledok odoslania nepoznáme/i),
    ).toBeVisible();
    expect(screen.getByText(/duplicitný príspevok/i)).toBeVisible();
    expect(submit).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByRole("checkbox", { name: /súhlasím/i })).toBeEnabled();
    expect(
      screen.getByRole("status", {
        name: "Výsledok odoslania nepoznáme",
      }),
    ).toHaveAttribute("data-tone", "warning");

    online = false;
    await act(() => window.dispatchEvent(new Event("offline")));
    online = true;
    await act(() => window.dispatchEvent(new Event("online")));
    expect(
      screen.getByText("Výsledok odoslania nepoznáme"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Pripojenie je obnovené"),
    ).not.toBeInTheDocument();

    await act(() => i18next.changeLanguage("en"));
    expect(screen.getByText("The submission outcome is unknown")).toBeVisible();
    expect(submit).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Submit again" }));
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it("restores connectivity without dispatching an automatic request", async () => {
    let online = false;
    const submit = vi.fn().mockResolvedValue(acceptedResponse);
    vi.spyOn(navigator, "onLine", "get").mockImplementation(() => online);
    const { onSuccess } = renderForm({ submit });
    const user = userEvent.setup();

    expect(await screen.findByText("Ste offline")).toBeVisible();
    expect(screen.getByRole("button", { name: "Skúsiť znova" })).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: /súhlasím/i }));
    expect(submit).not.toHaveBeenCalled();

    online = true;
    await act(() => window.dispatchEvent(new Event("online")));

    expect(await screen.findByText("Pripojenie je obnovené")).toBeVisible();
    expect(submit).not.toHaveBeenCalled();
    const retry = screen.getByRole("button", { name: "Skúsiť znova" });
    expect(retry).toBeEnabled();

    await user.click(retry);
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});
