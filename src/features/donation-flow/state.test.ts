import { describe, expect, it } from "vitest";

import type { DonationSelection, DonorDetails } from "@/domain/donation";

import {
  donationFlowReducer,
  getFlowRedirect,
  initialDonationFlowState,
} from "./state";

const selection: DonationSelection = {
  target: "shelter",
  amountCents: 2000,
  shelter: { id: 4, name: "Útulok pre psov - TEZAS" },
};

const donor: DonorDetails = {
  firstName: "Jana",
  lastName: "Nováková",
  email: "jana@example.sk",
  phoneCountry: "SK",
  phoneE164: "+421901234567",
};

describe("donationFlowReducer", () => {
  it("stores committed steps and in-progress drafts", () => {
    const withDraft = donationFlowReducer(initialDonationFlowState, {
      type: "selectionDraftChanged",
      payload: { target: "shelter", shelterId: "4", amount: "20" },
    });
    const withSelection = donationFlowReducer(initialDonationFlowState, {
      type: "selectionCommitted",
      payload: selection,
    });
    const complete = donationFlowReducer(withSelection, {
      type: "donorCommitted",
      payload: donor,
    });

    expect(withDraft.selectionDraft).toEqual({
      target: "shelter",
      shelterId: "4",
      amount: "20",
    });
    expect(complete).toMatchObject({ selection, donor });
  });

  it("invalidates confirmed steps when an earlier draft changes", () => {
    const completeState = {
      ...initialDonationFlowState,
      selection,
      donor,
      selectionDraft: {
        target: "shelter" as const,
        shelterId: "4",
        amount: "20",
      },
      donorDraft: {
        firstName: "Jana",
        lastName: "Nováková",
        email: "jana@example.sk",
        phoneDialCode: "421",
        phone: "901 234 567",
        phoneCountry: "SK" as const,
      },
    };

    const changedSelection = donationFlowReducer(completeState, {
      type: "selectionDraftChanged",
      payload: { target: "foundation", shelterId: null, amount: "30" },
    });
    expect(changedSelection).toMatchObject({
      selection: null,
      donor: null,
      donorDraft: completeState.donorDraft,
    });

    const changedDonor = donationFlowReducer(completeState, {
      type: "donorDraftChanged",
      payload: { ...completeState.donorDraft, lastName: "Novák" },
    });
    expect(changedDonor.selection).toEqual(selection);
    expect(changedDonor.donor).toBeNull();
  });

  it("requires the personal-details step to be confirmed after selection", () => {
    expect(
      donationFlowReducer(
        { ...initialDonationFlowState, selection, donor },
        { type: "selectionCommitted", payload: selection },
      ),
    ).toMatchObject({ selection, donor: null });
  });

  it("records an accepted submission and invalidates it when data changes", () => {
    const accepted = donationFlowReducer(
      { ...initialDonationFlowState, selection, donor },
      { type: "submissionAccepted" },
    );

    expect(accepted.submissionAccepted).toBe(true);
    expect(accepted).toMatchObject({
      selection: null,
      donor: null,
      selectionDraft: null,
      donorDraft: null,
    });
    expect(
      donationFlowReducer(accepted, {
        type: "donorCommitted",
        payload: donor,
      }).submissionAccepted,
    ).toBe(false);
  });

  it("resets all personal and contribution data", () => {
    expect(
      donationFlowReducer(
        {
          ...initialDonationFlowState,
          selection,
          donor,
          submissionAccepted: true,
        },
        { type: "flowReset" },
      ),
    ).toEqual(initialDonationFlowState);
  });

  it("keeps the provider hydrated after restoring, resetting, and submitting", () => {
    const restored = donationFlowReducer(initialDonationFlowState, {
      type: "flowHydrated",
      payload: { selection, donor, selectionDraft: null, donorDraft: null },
    });

    expect(restored.hydrated).toBe(true);
    expect(donationFlowReducer(restored, { type: "flowReset" }).hydrated).toBe(
      true,
    );
    expect(
      donationFlowReducer(restored, { type: "submissionAccepted" }).hydrated,
    ).toBe(true);
  });

  it("does not overwrite newer in-memory progress during hydration", () => {
    const accepted = {
      ...initialDonationFlowState,
      submissionAccepted: true,
    };

    expect(
      donationFlowReducer(accepted, {
        type: "flowHydrated",
        payload: { selection, donor, selectionDraft: null, donorDraft: null },
      }),
    ).toEqual({ ...accepted, hydrated: true });
  });
});

describe("getFlowRedirect", () => {
  it("sends an incomplete details deep link to its localized first step", () => {
    expect(getFlowRedirect("/details", initialDonationFlowState)).toBe("/");
    expect(getFlowRedirect("/en/details/", initialDonationFlowState)).toBe(
      "/en/",
    );
    expect(getFlowRedirect("/cz/details/", initialDonationFlowState)).toBe(
      "/cz/",
    );
  });

  it("sends an incomplete review deep link to the missing step", () => {
    expect(getFlowRedirect("/review", initialDonationFlowState)).toBe("/");
    expect(
      getFlowRedirect("/en/review", {
        ...initialDonationFlowState,
        selection,
      }),
    ).toBe("/en/details/");
    expect(
      getFlowRedirect("/cz/review", {
        ...initialDonationFlowState,
        selection,
      }),
    ).toBe("/cz/details/");
  });

  it("allows review only with both committed steps", () => {
    expect(
      getFlowRedirect("/review", {
        ...initialDonationFlowState,
        selection,
        donor,
      }),
    ).toBeNull();
  });

  it("prioritizes the success redirect after clearing submitted data", () => {
    expect(
      getFlowRedirect("/en/review/", {
        ...initialDonationFlowState,
        submissionAccepted: true,
      }),
    ).toBe("/en/success/");
  });

  it("guards direct and refreshed success links in every locale", () => {
    expect(getFlowRedirect("/success", initialDonationFlowState)).toBe("/");
    expect(getFlowRedirect("/en/success/", initialDonationFlowState)).toBe(
      "/en/",
    );
    expect(getFlowRedirect("/cz/success/", initialDonationFlowState)).toBe(
      "/cz/",
    );
    expect(
      getFlowRedirect("/success", {
        ...initialDonationFlowState,
        submissionAccepted: true,
      }),
    ).toBeNull();
  });

  it("keeps public routes unguarded", () => {
    expect(getFlowRedirect("/contact", initialDonationFlowState)).toBeNull();
  });
});
