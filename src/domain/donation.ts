export const MAX_DONATION_CENTS = 99_999_900;

export type Shelter = {
  id: number;
  name: string;
};

export type FoundationSelection = {
  target: "foundation";
  amountCents: number;
};

export type ShelterSelection = {
  target: "shelter";
  amountCents: number;
  shelter: Shelter;
};

export type DonationSelection = FoundationSelection | ShelterSelection;

export type PhoneCountry = "SK" | "CZ";

export type DonorDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phoneE164: string;
  phoneCountry: PhoneCountry;
};

export type DonationStats = {
  contributors: number;
  contributionCents: number;
};

/**
 * Presentation-only grouping of an already normalized E.164 number.
 *
 * Both supported countries have a nine-digit national number that
 * libphonenumber renders in 3-3-3 groups, so the review screen reproduces
 * `formatInternational()` for +421/+420 without pulling the metadata of every
 * country into that route. Anything that does not match the supported shape is
 * returned untouched rather than mangled.
 */
export function formatPhoneForDisplay(phoneE164: string): string {
  return phoneE164.replace(
    /^(\+(?:420|421))(\d{3})(\d{3})(\d{3})$/u,
    "$1 $2 $3 $4",
  );
}
