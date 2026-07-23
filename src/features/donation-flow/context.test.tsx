import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DonationFlowProvider, useDonationFlow } from "./context";

const storageKey = "goodboy-donation-flow:v1";

function FlowProbe() {
  const { state, dispatch } = useDonationFlow();

  return (
    <div>
      <output aria-label="amount">
        {state.selectionDraft?.amount ?? "empty"}
      </output>
      <output aria-label="accepted">
        {state.submissionAccepted ? "accepted" : "pending"}
      </output>
      <button
        onClick={() =>
          dispatch({
            type: "selectionDraftChanged",
            payload: {
              target: "foundation",
              shelterId: null,
              amount: "99",
            },
          })
        }
        type="button"
      >
        update
      </button>
      <button
        onClick={() => dispatch({ type: "submissionAccepted" })}
        type="button"
      >
        accept
      </button>
    </div>
  );
}

describe("DonationFlowProvider", () => {
  it("keeps drafts only in the mounted provider and never touches web storage", () => {
    sessionStorage.setItem(storageKey, "session-sentinel");
    localStorage.setItem(storageKey, "local-sentinel");

    const { unmount } = render(
      <DonationFlowProvider>
        <FlowProbe />
      </DonationFlowProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "update" }));
    expect(screen.getByLabelText("amount")).toHaveTextContent("99");
    expect(sessionStorage.getItem(storageKey)).toBe("session-sentinel");
    expect(localStorage.getItem(storageKey)).toBe("local-sentinel");

    unmount();
    render(
      <DonationFlowProvider>
        <FlowProbe />
      </DonationFlowProvider>,
    );
    expect(screen.getByLabelText("amount")).toHaveTextContent("empty");
  });

  it("clears personal flow data after success without persisting it", () => {
    render(
      <DonationFlowProvider>
        <FlowProbe />
      </DonationFlowProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "update" }));
    fireEvent.click(screen.getByRole("button", { name: "accept" }));
    expect(screen.getByLabelText("amount")).toHaveTextContent("empty");
    expect(screen.getByLabelText("accepted")).toHaveTextContent("accepted");
  });
});
