import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";

import type { DonationFlowState } from "@/features/donation-flow/state";

import { SelectionPage } from "./selection-page";

const prefetch = vi.fn();
let flowState: Pick<
  DonationFlowState,
  "hydrated" | "selection" | "selectionDraft"
> = {
  hydrated: false,
  selection: null,
  selectionDraft: null,
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ prefetch, push: vi.fn() }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/features/donation-flow/context", () => ({
  useDonationFlow: () => ({
    dispatch: vi.fn(),
    state: flowState,
  }),
}));

vi.mock("./selection-form", () => ({
  SelectionForm: ({
    initialDraft,
    nextStepPrefetch,
  }: {
    initialDraft?: { amount: string };
    nextStepPrefetch?: React.ComponentPropsWithoutRef<"button">;
  }) => {
    const [initialAmount] = useState(initialDraft?.amount ?? "empty");

    return (
      <button {...nextStepPrefetch} data-initial-amount={initialAmount}>
        Continue
      </button>
    );
  },
}));

describe("SelectionPage", () => {
  beforeEach(() => {
    prefetch.mockReset();
    flowState = { hydrated: false, selection: null, selectionDraft: null };
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { saveData: true },
    });
  });

  it("prefetches the next donation step when the continue action is intended", () => {
    render(<SelectionPage />);

    fireEvent.pointerEnter(screen.getByRole("button", { name: "Continue" }));

    expect(prefetch).toHaveBeenCalledExactlyOnceWith("/details/");
  });

  it("remounts the form once restored session defaults are hydrated", () => {
    const view = render(<SelectionPage />);
    expect(view.container.querySelector("section")).toHaveAttribute(
      "data-flow-hydrated",
      "false",
    );
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-initial-amount",
      "empty",
    );

    flowState = {
      hydrated: true,
      selection: null,
      selectionDraft: { target: "foundation", shelterId: null, amount: "25" },
    };
    view.rerender(<SelectionPage />);

    expect(view.container.querySelector("section")).toHaveAttribute(
      "data-flow-hydrated",
      "true",
    );
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-initial-amount",
      "25",
    );
  });
});
