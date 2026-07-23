import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DonationFlowState } from "@/features/donation-flow/state";

import { DetailsPage } from "./details-page";

let flowState: Pick<DonationFlowState, "hydrated" | "donor" | "donorDraft"> = {
  hydrated: false,
  donor: null,
  donorDraft: null,
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/details/",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/features/donation-flow/context", () => ({
  useDonationFlow: () => ({ dispatch: vi.fn(), state: flowState }),
}));

vi.mock("@/features/donation-flow/flow-guard", () => ({
  FlowGuard: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/lib/navigation/use-donation-route-prefetch", () => ({
  useDonationRoutePrefetch: () => ({}),
}));

vi.mock("./details-form", () => ({
  DetailsForm: ({
    initialDraft,
    initialValue,
  }: {
    initialDraft?: { email: string };
    initialValue?: { email: string };
  }) => {
    const [initialEmail] = useState(
      initialDraft?.email ?? initialValue?.email ?? "",
    );

    return <output aria-label="initial email">{initialEmail}</output>;
  },
}));

describe("DetailsPage", () => {
  beforeEach(() => {
    flowState = { hydrated: false, donor: null, donorDraft: null };
  });

  it("remounts with a restored donor draft after flow hydration", () => {
    const view = render(<DetailsPage />);
    expect(screen.getByLabelText("initial email")).toHaveTextContent("");

    flowState = {
      hydrated: true,
      donor: null,
      donorDraft: {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@goodrequest.sk",
        phoneDialCode: "421",
        phone: "901 234 567",
        phoneCountry: "SK",
      },
    };
    view.rerender(<DetailsPage />);

    expect(screen.getByLabelText("initial email")).toHaveTextContent(
      "jane@goodrequest.sk",
    );
  });
});
