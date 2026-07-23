import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useRef } from "react";
import { describe, expect, it } from "vitest";

import {
  DonationFlowProvider,
  useDonationFlow,
} from "@/features/donation-flow/context";

import { SuccessContent } from "./success-content";

function SuccessHarness() {
  const { dispatch, state } = useDonationFlow();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;
    dispatch({
      type: "selectionCommitted",
      payload: { target: "foundation", amountCents: 2000 },
    });
    dispatch({ type: "submissionAccepted" });
  }, [dispatch]);

  return (
    <>
      <output>{state.selection ? "retained" : "reset"}</output>
      {state.submissionAccepted ? <SuccessContent /> : null}
    </>
  );
}

describe("SuccessContent", () => {
  it("shows success after clearing the completed flow", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DonationFlowProvider>
        <SuccessHarness />
      </DonationFlowProvider>,
    );

    expect(
      await screen.findByRole("heading", {
        name: "Ďakujeme za váš príspevok",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Príspevok bol úspešne prijatý.")).toBeVisible();
    expect(
      container.querySelector('[data-icon="success-check"]'),
    ).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll('[data-icon="paw"]')).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "Prispieť znova" }),
    ).toHaveAttribute("href", "/");
    expect(screen.getByText("reset")).toBeVisible();

    await user.click(screen.getByRole("link", { name: "Prispieť znova" }));
    await waitFor(() => expect(screen.getByText("reset")).toBeVisible());
  });
});
