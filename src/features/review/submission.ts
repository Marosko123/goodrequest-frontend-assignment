import { ApiError } from "@/lib/api/client";
import { ContributionRejectedError } from "@/lib/api/outcome";

export type SubmissionError = {
  kind: "offline" | "unknown" | "rate-limit" | "invalid" | "service";
};

export function getSubmissionError(error: unknown): SubmissionError {
  if (
    error instanceof ApiError &&
    (error.kind === "network" ||
      error.kind === "timeout" ||
      error.kind === "contract" ||
      (error.kind === "http" &&
        error.status !== undefined &&
        error.status >= 500))
  ) {
    return {
      kind: "unknown",
    };
  }

  if (error instanceof ApiError && error.kind === "http") {
    if (error.status === 429) {
      return {
        kind: "rate-limit",
      };
    }

    if (error.status === 400 || error.status === 409 || error.status === 422) {
      return {
        kind: "invalid",
      };
    }
  }

  if (error instanceof ContributionRejectedError) {
    return {
      kind: error.kind === "unconfirmed" ? "unknown" : "invalid",
    };
  }

  return {
    kind: "service",
  };
}
