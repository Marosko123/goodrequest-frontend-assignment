import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { describe, expect, it } from "vitest";

import {
  formatPhoneForDisplay,
  type DonationSelection,
  type DonorDetails,
} from "./donation";
import { mapContributionRequest } from "@/lib/api/mappers";

const donor: DonorDetails = {
  firstName: "",
  lastName: "Nováková",
  email: "jana@example.sk",
  phoneE164: "+421901234567",
  phoneCountry: "SK",
};

describe("formatPhoneForDisplay", () => {
  // The review route drops libphonenumber to stay inside its bundle budget, so
  // the shortcut is pinned against the library it replaces. If either country
  // ever changed its national grouping, this fails instead of shipping silently.
  it.each(["+421901234567", "+421911750750", "+420777123456", "+420601234567"])(
    "matches libphonenumber formatInternational for %s",
    (phoneE164) => {
      expect(formatPhoneForDisplay(phoneE164)).toBe(
        parsePhoneNumberFromString(phoneE164)?.formatInternational(),
      );
    },
  );

  it.each(["", "+49151234567", "+42190123456", "not a phone"])(
    "returns %s untouched when it is outside the supported shape",
    (value) => {
      expect(formatPhoneForDisplay(value)).toBe(value);
    },
  );
});

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

  it("maps the maximum supported contribution", () => {
    const selection: DonationSelection = {
      target: "foundation",
      amountCents: 99_999_900,
    };

    expect(mapContributionRequest(selection, donor).value).toBe(999_999);
  });

  it.each([0, -1, 10.5, 99_999_901])(
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
