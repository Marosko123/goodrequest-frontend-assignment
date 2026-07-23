import type {
  DonationSelection,
  DonorDetails,
  Shelter,
} from "@/domain/donation";
import type {
  ContributionRequest,
  ContributionResponse,
} from "@/lib/api/contracts";
import { mapContributionRequest } from "@/lib/api/mappers";

type PreparationErrorKind = "invalid" | "unavailable";

export class ContributionPreparationError extends Error {
  constructor(readonly kind: PreparationErrorKind) {
    super(`Contribution preparation failed: ${kind}.`);
    this.name = "ContributionPreparationError";
  }
}

export async function submitValidatedContribution({
  selection,
  donor,
  loadShelters,
  submit,
}: {
  selection: DonationSelection;
  donor: DonorDetails;
  loadShelters: () => Promise<Shelter[]>;
  submit: (request: ContributionRequest) => Promise<ContributionResponse>;
}): Promise<ContributionResponse> {
  const { isValidSupportedPhone } =
    await import("@/lib/validation/supported-phone");
  if (!isValidSupportedPhone(donor.phoneE164, donor.phoneCountry)) {
    throw new ContributionPreparationError("invalid");
  }

  if (selection.target === "shelter") {
    let shelters: Shelter[];

    try {
      shelters = await loadShelters();
    } catch {
      throw new ContributionPreparationError("unavailable");
    }

    const shelterIsCurrent = shelters.some(
      ({ id, name }) =>
        id === selection.shelter.id && name === selection.shelter.name,
    );
    if (!shelterIsCurrent) {
      throw new ContributionPreparationError("invalid");
    }
  }

  return submit(mapContributionRequest(selection, donor));
}
