import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DonationProgressProvider,
  useDonationProgressState,
  useDonationStepStatus,
} from "./donation-progress-context";

function StatusWriter({
  status,
}: {
  status: "current" | "error" | "in-progress";
}) {
  useDonationStepStatus(3, status);
  return null;
}

function StatusReader() {
  const { activeStep } = useDonationProgressState();
  return (
    <output>
      {activeStep ? `${activeStep.number}:${activeStep.status}` : "none"}
    </output>
  );
}

describe("DonationProgressProvider", () => {
  it("keeps transient UI progress outside the persisted donation state", () => {
    const view = render(
      <DonationProgressProvider>
        <StatusWriter status="error" />
        <StatusReader />
      </DonationProgressProvider>,
    );

    expect(screen.getByText("3:error")).toBeInTheDocument();

    view.rerender(
      <DonationProgressProvider>
        <StatusWriter status="in-progress" />
        <StatusReader />
      </DonationProgressProvider>,
    );

    expect(screen.getByText("3:in-progress")).toBeInTheDocument();
  });

  it("clears a form status when that step unmounts", () => {
    const view = render(
      <DonationProgressProvider>
        <StatusWriter status="error" />
        <StatusReader />
      </DonationProgressProvider>,
    );

    view.rerender(
      <DonationProgressProvider>
        <StatusReader />
      </DonationProgressProvider>,
    );

    expect(screen.getByText("none")).toBeInTheDocument();
  });
});
