import type { DonationSelection, DonorDetails } from "@/domain/donation";

export type DonationFlowState = {
  selection: DonationSelection | null;
  donor: DonorDetails | null;
};

export type DonationFlowAction =
  | { type: "selectionCommitted"; payload: DonationSelection }
  | { type: "donorCommitted"; payload: DonorDetails }
  | { type: "flowReset" };

export const initialDonationFlowState: DonationFlowState = {
  selection: null,
  donor: null,
};

export function donationFlowReducer(
  state: DonationFlowState,
  action: DonationFlowAction,
): DonationFlowState {
  switch (action.type) {
    case "selectionCommitted":
      return { ...state, selection: action.payload };
    case "donorCommitted":
      return { ...state, donor: action.payload };
    case "flowReset":
      return initialDonationFlowState;
  }
}

export function getFlowRedirect(
  pathname: string,
  state: DonationFlowState,
): "/" | "/details" | null {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/details" && !state.selection) {
    return "/";
  }

  if (normalizedPath === "/review") {
    if (!state.selection) {
      return "/";
    }
    if (!state.donor) {
      return "/details";
    }
  }

  return null;
}
