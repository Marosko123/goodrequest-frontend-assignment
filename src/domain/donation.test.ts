import { describe, expect, it } from "vitest";

import type { DonationSelection, DonorDetails } from "./donation";
import { mapContributionRequest } from "@/lib/api/mappers";

const donor: DonorDetails = {
  firstName: "",
  lastName: "Nováková",
  email: "jana@example.sk",
  phoneE164: "+421901234567",
  phoneCountry: "SK",
};

describe("mapContributionRequest", () => {
  it("maps the required phone for a foundation contribution", () => {
    const selection: DonationSelection = {
      target: "foundation",
      amountCents: 1050,
    };

    expect(mapContributionRequest(selection, donor)).toEqual({
      contributors: [
        {
          firstName: "",
          lastName: "Nováková",
          email: "jana@example.sk",
          phone: "+421901234567",
        },
      ],
      value: 10.5,
    });
  });

  it("maps a shelter and normalized phone exactly", () => {
    const selection: DonationSelection = {
      target: "shelter",
      amountCents: 5000,
      shelter: { id: 4, name: "Útulok pre psov - TEZAS" },
    };

    expect(
      mapContributionRequest(selection, {
        ...donor,
        firstName: "Jana",
        phoneCountry: "SK",
        phoneE164: "+421901234567",
      }),
    ).toEqual({
      contributors: [
        {
          firstName: "Jana",
          lastName: "Nováková",
          email: "jana@example.sk",
          phone: "+421901234567",
        },
      ],
      shelterID: 4,
      value: 50,
    });
  });

  it.each([0, -1, 10.5, 100_000_001])(
    "rejects an out-of-contract amount of %s cents",
    (amountCents) => {
      const invalidSelection: DonationSelection = {
        target: "foundation",
        amountCents,
      };

      expect(() => mapContributionRequest(invalidSelection, donor)).toThrow(
        "Contribution amount is outside the supported cent range.",
      );
    },
  );
});
