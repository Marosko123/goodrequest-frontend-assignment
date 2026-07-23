import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FlowGuard } from "./flow-guard";

const replace = vi.fn();
let state = {
  hydrated: false,
  submissionAccepted: false,
  selection: null,
  donor: null,
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/details/",
  useRouter: () => ({ replace }),
}));

vi.mock("./context", () => ({
  useDonationFlow: () => ({ state, dispatch: vi.fn() }),
}));

describe("FlowGuard", () => {
  beforeEach(() => {
    replace.mockReset();
    state = {
      hydrated: false,
      submissionAccepted: false,
      selection: null,
      donor: null,
    };
  });

  it("waits for storage hydration before redirecting an incomplete deep link", () => {
    render(
      <FlowGuard>
        <p>details</p>
      </FlowGuard>,
    );

    expect(screen.getByText("details")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects after hydration", () => {
    state = { ...state, hydrated: true };
    render(
      <FlowGuard>
        <p>details</p>
      </FlowGuard>,
    );

    expect(replace).toHaveBeenCalledWith("/", { scroll: false });
  });
});
