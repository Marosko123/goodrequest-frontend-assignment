import { describe, expect, it, vi } from "vitest";

import {
  clearDonationFlowStorage,
  loadDonationFlowStorage,
  saveDonationFlowStorage,
  storageKey,
} from "./storage";
import { MAX_DONATION_CENTS } from "@/domain/donation";

const persistedFlow = {
  selection: {
    target: "shelter" as const,
    amountCents: 2000,
    shelter: { id: 4, name: "Útulok pre psov - TEZAS" },
  },
  donor: {
    firstName: "Jana",
    lastName: "Nováková",
    email: "jana@example.sk",
    phoneCountry: "SK" as const,
    phoneE164: "+421901234567",
  },
  selectionDraft: { target: "shelter" as const, shelterId: "4", amount: "20" },
  donorDraft: {
    firstName: "Jana",
    lastName: "Nováková",
    email: "jana@example.sk",
    phoneDialCode: "421",
    phone: "901 234 567",
    phoneCountry: "SK" as const,
  },
};

describe("donation-flow session storage", () => {
  it("derives the editable dial code when restoring a legacy donor draft", () => {
    const { phoneDialCode, ...legacyDonorDraft } = persistedFlow.donorDraft;
    expect(phoneDialCode).toBe("421");
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        data: { ...persistedFlow, donorDraft: legacyDonorDraft },
      }),
    );

    expect(loadDonationFlowStorage().donorDraft).toMatchObject({
      phoneCountry: "SK",
      phoneDialCode: "421",
    });
  });

  it("loads only the current version of a valid persisted flow", () => {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ version: 1, data: persistedFlow }),
    );

    expect(loadDonationFlowStorage()).toEqual(persistedFlow);
  });

  it.each(["{", JSON.stringify({ version: 0, data: persistedFlow })])(
    "returns an empty flow for corrupt or old storage",
    (value) => {
      sessionStorage.setItem(storageKey, value);

      expect(loadDonationFlowStorage()).toEqual({
        selection: null,
        donor: null,
        selectionDraft: null,
        donorDraft: null,
      });
    },
  );

  it.each([
    [
      "a foundation selection that retains a shelter",
      {
        target: "foundation",
        amountCents: 2000,
        shelter: { id: 4, name: "Útulok pre psov - TEZAS" },
      },
    ],
    [
      "a shelter selection without its shelter",
      {
        target: "shelter",
        amountCents: 2000,
      },
    ],
    [
      "a shelter selection with a fractional shelter id",
      {
        target: "shelter",
        amountCents: 2000,
        shelter: { id: 4.5, name: "Útulok pre psov - TEZAS" },
      },
    ],
    [
      "a shelter selection with an empty shelter name",
      {
        target: "shelter",
        amountCents: 2000,
        shelter: { id: 4, name: "" },
      },
    ],
    ["a zero amount", { target: "foundation", amountCents: 0 }],
    ["a fractional amount", { target: "foundation", amountCents: 2000.5 }],
    [
      "an amount above the current limit",
      {
        target: "foundation",
        amountCents: MAX_DONATION_CENTS + 1,
      },
    ],
  ])(
    "rejects %s instead of restoring a malformed selection",
    (_label, selection) => {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          version: 1,
          data: { ...persistedFlow, selection },
        }),
      );

      expect(loadDonationFlowStorage()).toEqual({
        selection: null,
        donor: null,
        selectionDraft: null,
        donorDraft: null,
      });
    },
  );

  it("rejects unbounded persisted donor and draft strings", () => {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        data: {
          ...persistedFlow,
          donor: { ...persistedFlow.donor, email: "a".repeat(255) },
          donorDraft: { ...persistedFlow.donorDraft, phone: "1".repeat(33) },
        },
      }),
    );

    expect(loadDonationFlowStorage()).toEqual({
      selection: null,
      donor: null,
      selectionDraft: null,
      donorDraft: null,
    });
  });

  it("preserves an intentionally empty optional first name", () => {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        data: {
          ...persistedFlow,
          donor: { ...persistedFlow.donor, firstName: "" },
        },
      }),
    );

    expect(loadDonationFlowStorage()).toMatchObject({
      donor: { ...persistedFlow.donor, firstName: "" },
    });
  });

  it.each([
    ["an invalid first name", { firstName: "Jana7" }],
    ["an invalid last name", { lastName: "Nováková7" }],
    ["a malformed email", { email: "jana" }],
    [
      "a mismatched Slovak phone country",
      {
        phoneCountry: "SK",
        phoneE164: "+420777123456",
      },
    ],
    [
      "a mismatched Czech phone country",
      {
        phoneCountry: "CZ",
        phoneE164: "+421901234567",
      },
    ],
  ])("rejects committed donor data with %s", (_label, donor) => {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        data: {
          ...persistedFlow,
          donor: { ...persistedFlow.donor, ...donor },
        },
      }),
    );

    expect(loadDonationFlowStorage()).toEqual({
      selection: null,
      donor: null,
      selectionDraft: null,
      donorDraft: null,
    });
  });

  it("uses session storage only and excludes consent from serialized data", () => {
    saveDonationFlowStorage({ ...persistedFlow, consent: true } as never);

    expect(JSON.parse(sessionStorage.getItem(storageKey) ?? "{}")).toEqual({
      version: 1,
      data: persistedFlow,
    });
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it("safely handles unavailable storage", () => {
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    const removeItem = vi
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });

    expect(loadDonationFlowStorage()).toMatchObject({ selection: null });
    expect(() => saveDonationFlowStorage(persistedFlow)).not.toThrow();
    expect(() => clearDonationFlowStorage()).not.toThrow();

    getItem.mockRestore();
    setItem.mockRestore();
    removeItem.mockRestore();
  });
});
