import type { ContributionResponse } from "./contracts";

export class ContributionRejectedError extends Error {
  readonly kind: "rejected" | "unconfirmed";

  constructor(kind: "rejected" | "unconfirmed", message: string) {
    super(message);
    this.name = "ContributionRejectedError";
    this.kind = kind;
  }
}

export function assertContributionAccepted(
  response: ContributionResponse,
): string {
  const error = response.messages.find((message) => message.type === "ERROR");
  if (error) {
    throw new ContributionRejectedError("rejected", error.message);
  }

  const success = response.messages.find(
    (message) => message.type === "SUCCESS",
  );
  if (!success) {
    throw new ContributionRejectedError(
      "unconfirmed",
      "API nepotvrdilo úspešné prijatie príspevku.",
    );
  }

  return success.message;
}
