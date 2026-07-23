export const MAX_DONATION_CENTS = 100_000_000;

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
