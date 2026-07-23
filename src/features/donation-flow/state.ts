import type { DonationSelection, DonorDetails } from "@/domain/donation";
import { getLocaleFromPathname, getLocalizedPath } from "@/i18n/config";

export type SelectionDraft = {
  target: "foundation" | "shelter";
  shelterId: string | null;
  amount: string;
};

export type DonorDraft = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCountry: "SK" | "CZ";
};

export type DonationFlowState = {
  selection: DonationSelection | null;
  donor: DonorDetails | null;
  selectionDraft: SelectionDraft | null;
  donorDraft: DonorDraft | null;
  submissionAccepted: boolean;
};

export type DonationFlowAction =
  | { type: "selectionDraftChanged"; payload: SelectionDraft }
  | { type: "donorDraftChanged"; payload: DonorDraft }
  | { type: "selectionCommitted"; payload: DonationSelection }
  | { type: "donorCommitted"; payload: DonorDetails }
  | { type: "submissionAccepted" }
  | { type: "flowReset" };

export const initialDonationFlowState: DonationFlowState = {
  selection: null,
  donor: null,
  selectionDraft: null,
  donorDraft: null,
  submissionAccepted: false,
};

export function donationFlowReducer(
  state: DonationFlowState,
  action: DonationFlowAction,
): DonationFlowState {
  switch (action.type) {
    case "selectionDraftChanged":
      return {
        ...state,
        selection: null,
        donor: null,
        selectionDraft: action.payload,
        submissionAccepted: false,
      };
    case "donorDraftChanged":
      return {
        ...state,
        donor: null,
        donorDraft: action.payload,
        submissionAccepted: false,
      };
    case "selectionCommitted":
      return {
        ...state,
        selection: action.payload,
        donor: null,
        submissionAccepted: false,
      };
    case "donorCommitted":
      return { ...state, donor: action.payload, submissionAccepted: false };
    case "submissionAccepted":
      return {
        ...initialDonationFlowState,
        submissionAccepted: true,
      };
    case "flowReset":
      return initialDonationFlowState;
  }
}

export function getFlowRedirect(
  pathname: string,
  state: DonationFlowState,
): string | null {
  const locale = getLocaleFromPathname(pathname);
  const normalizedPath =
    pathname.replace(/^\/en(?=\/|$)/u, "").replace(/\/+$/, "") || "/";

  if (normalizedPath === "/details" && !state.selection) {
    return getLocalizedPath(locale, "/");
  }

  if (normalizedPath === "/review") {
    if (state.submissionAccepted) {
      return getLocalizedPath(locale, "/success/");
    }
    if (!state.selection) {
      return getLocalizedPath(locale, "/");
    }
    if (!state.donor) {
      return getLocalizedPath(locale, "/details/");
    }
  }

  if (normalizedPath === "/success" && !state.submissionAccepted) {
    return getLocalizedPath(locale, "/");
  }

  return null;
}
