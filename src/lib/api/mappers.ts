import {
  MAX_DONATION_CENTS,
  type DonationSelection,
  type DonorDetails,
} from "@/domain/donation";

import type { ContributionRequest } from "./contracts";

export function mapContributionRequest(
  selection: DonationSelection,
  donor: DonorDetails,
): ContributionRequest {
  if (
    !Number.isSafeInteger(selection.amountCents) ||
    selection.amountCents <= 0 ||
    selection.amountCents > MAX_DONATION_CENTS
  ) {
    throw new Error("Contribution amount is outside the supported cent range.");
  }

  const contributor = {
    firstName: donor.firstName,
    lastName: donor.lastName,
    email: donor.email,
    phone: donor.phoneE164,
  };

  return {
    contributors: [contributor],
    value: selection.amountCents / 100,
    ...(selection.target === "shelter"
      ? { shelterID: selection.shelter.id }
      : {}),
  };
}
