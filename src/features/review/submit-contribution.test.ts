import { describe, expect, it, vi } from "vitest";

import type {
  DonationSelection,
  DonorDetails,
  Shelter,
} from "@/domain/donation";

import {
  ContributionPreparationError,
  submitValidatedContribution,
} from "./submit-contribution";

const donor: DonorDetails = {
  firstName: "Jana",
  lastName: "Nováková",
  email: "jana@example.sk",
  phoneCountry: "SK",
  phoneE164: "+421901234567",
};
const shelterSelection: DonationSelection = {
  target: "shelter",
  amountCents: 2_000,
  shelter: { id: 4, name: "Útulok pre psov - TEZAS" },
};
const acceptedResponse = {
  messages: [{ message: "Príspevok prijatý", type: "SUCCESS" as const }],
};

describe("submitValidatedContribution", () => {
  it("submits a foundation contribution without loading shelters", async () => {
    const loadShelters = vi.fn<() => Promise<Shelter[]>>();
    const submit = vi.fn().mockResolvedValue(acceptedResponse);

    await expect(
      submitValidatedContribution({
        selection: { target: "foundation", amountCents: 2_000 },
        donor,
        loadShelters,
        submit,
      }),
    ).resolves.toEqual(acceptedResponse);

    expect(loadShelters).not.toHaveBeenCalled();
    expect(submit).toHaveBeenCalledOnce();
  });

  it.each([
    ["removed", []],
    ["renamed", [{ id: 4, name: "Podvrhnutý útulok" }]],
    ["different id", [{ id: 5, name: "Útulok pre psov - TEZAS" }]],
  ] satisfies ReadonlyArray<[string, Shelter[]]>)(
    "rejects a %s persisted shelter without submitting",
    async (_label, shelters) => {
      const submit = vi.fn();

      await expect(
        submitValidatedContribution({
          selection: shelterSelection,
          donor,
          loadShelters: vi.fn().mockResolvedValue(shelters),
          submit,
        }),
      ).rejects.toEqual(new ContributionPreparationError("invalid"));

      expect(submit).not.toHaveBeenCalled();
    },
  );

  it("reports a failed shelter preflight as unavailable without submitting", async () => {
    const submit = vi.fn();

    await expect(
      submitValidatedContribution({
        selection: shelterSelection,
        donor,
        loadShelters: vi.fn().mockRejectedValue(new Error("offline")),
        submit,
      }),
    ).rejects.toEqual(new ContributionPreparationError("unavailable"));

    expect(submit).not.toHaveBeenCalled();
  });

  it("rejects an invalid persisted phone without loading or submitting", async () => {
    const loadShelters = vi.fn<() => Promise<Shelter[]>>();
    const submit = vi.fn();

    await expect(
      submitValidatedContribution({
        selection: shelterSelection,
        donor: { ...donor, phoneE164: "+421000000000" },
        loadShelters,
        submit,
      }),
    ).rejects.toEqual(new ContributionPreparationError("invalid"));

    expect(loadShelters).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });
});
