import { ApiError } from "@/lib/api/errors";
import { ContributionRejectedError } from "@/lib/api/outcome";

import { ContributionPreparationError } from "./submit-contribution";

export type SubmissionState =
  | "idle"
  | "submitting"
  | "offline"
  | "connection-restored"
  | "unknown-outcome"
  | "rate-limited"
  | "invalid"
  | "service-unavailable";

type SubmissionFailureState = Exclude<
  SubmissionState,
  "idle" | "submitting" | "offline" | "connection-restored"
>;

export function getSubmissionStateFromError(
  error: unknown,
): SubmissionFailureState {
  if (error instanceof ContributionPreparationError) {
    return error.kind === "invalid" ? "invalid" : "service-unavailable";
  }

  if (
    error instanceof ApiError &&
    (error.kind === "network" ||
      error.kind === "timeout" ||
      error.kind === "contract" ||
      (error.kind === "http" &&
        error.status !== undefined &&
        error.status >= 500))
  ) {
    return "unknown-outcome";
  }

  if (error instanceof ApiError && error.kind === "http") {
    if (error.status === 429) {
      return "rate-limited";
    }

    if (error.status === 400 || error.status === 409 || error.status === 422) {
      return "invalid";
    }
  }

  if (error instanceof ContributionRejectedError) {
    return error.kind === "unconfirmed" ? "unknown-outcome" : "invalid";
  }

  return "service-unavailable";
}
