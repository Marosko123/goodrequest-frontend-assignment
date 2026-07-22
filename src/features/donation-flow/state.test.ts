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
  it("stores only committed step snapshots", () => {
    const withSelection = donationFlowReducer(initialDonationFlowState, {
      type: "selectionCommitted",
      payload: selection,
    });
    const complete = donationFlowReducer(withSelection, {
      type: "donorCommitted",
      payload: donor,
    });

    expect(complete).toEqual({ selection, donor });
  });

  it("resets all personal and contribution data", () => {
    expect(
      donationFlowReducer({ selection, donor }, { type: "flowReset" }),
    ).toEqual(initialDonationFlowState);
  });
});

describe("getFlowRedirect", () => {
  it("sends an incomplete details deep link to the first step", () => {
    expect(getFlowRedirect("/details", initialDonationFlowState)).toBe("/");
  });

  it("sends an incomplete review deep link to the missing step", () => {
    expect(getFlowRedirect("/review", initialDonationFlowState)).toBe("/");
    expect(getFlowRedirect("/review", { selection, donor: null })).toBe(
      "/details",
    );
  });

  it("allows completed and public routes", () => {
    expect(getFlowRedirect("/review", { selection, donor })).toBeNull();
    expect(getFlowRedirect("/contact", initialDonationFlowState)).toBeNull();
    expect(getFlowRedirect("/success", initialDonationFlowState)).toBeNull();
  });
});
