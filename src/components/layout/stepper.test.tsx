import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Stepper } from "./stepper";

describe("Stepper", () => {
  it("marks only the current donation step", () => {
    render(<Stepper currentStep={2} />);

    expect(
      screen.getByRole("list", { name: "Priebeh príspevku" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Osobné údaje").closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByText("Výber útulku").closest("li")).not.toHaveAttribute(
      "aria-current",
    );

    const completedStep = screen.getByText("Výber útulku").closest("li");
    expect(completedStep).not.toBeNull();
    expect(within(completedStep!).queryByText("1")).not.toBeInTheDocument();
    expect(completedStep!.querySelector("svg")).toHaveAttribute(
      "data-icon",
      "check",
    );
  });
});
