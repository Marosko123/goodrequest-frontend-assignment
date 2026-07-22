import type { ContributionResponse } from "@/lib/api/contracts";
import { ApiError } from "@/lib/api/client";

export type SubmissionError = {
  kind: "offline" | "unknown" | "rate-limit" | "invalid" | "service";
  title: string;
  message: string;
};

export class ContributionRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContributionRejectedError";
  }
}

export function assertContributionAccepted(
  response: ContributionResponse,
): string {
  const error = response.messages.find((message) => message.type === "ERROR");
  if (error) {
    throw new ContributionRejectedError(error.message);
  }

  const success = response.messages.find(
    (message) => message.type === "SUCCESS",
  );
  if (!success) {
    throw new ContributionRejectedError(
      "API nepotvrdilo úspešné prijatie príspevku.",
    );
  }

  return success.message;
}

export function getSubmissionError(
  error: unknown,
  isOnline: boolean,
): SubmissionError {
  if (!isOnline && error instanceof ApiError && error.kind === "network") {
    return {
      kind: "offline",
      title: "Ste offline",
      message:
        "Pripojte sa k internetu a potom príspevok odošlite znova. Požiadavku neopakujeme automaticky.",
    };
  }

  if (
    error instanceof ApiError &&
    (error.kind === "network" || error.kind === "timeout")
  ) {
    return {
      kind: "unknown",
      title: "Výsledok odoslania nepoznáme",
      message:
        "Spojenie sa prerušilo po odoslaní požiadavky. Príspevok mohol byť prijatý, preto ho neopakujeme automaticky.",
    };
  }

  if (error instanceof ApiError && error.kind === "http") {
    if (error.status === 429) {
      return {
        kind: "rate-limit",
        title: "Príliš veľa pokusov",
        message: "Počkajte chvíľu a príspevok odošlite znova.",
      };
    }

    if (error.status === 400 || error.status === 409 || error.status === 422) {
      return {
        kind: "invalid",
        title: "Príspevok sa nepodarilo prijať",
        message:
          "Skontrolujte zadané údaje. Ak sú správne, skúste odoslanie zopakovať.",
      };
    }
  }

  if (error instanceof ContributionRejectedError) {
    return {
      kind: "invalid",
      title: "Príspevok sa nepodarilo prijať",
      message: error.message,
    };
  }

  return {
    kind: "service",
    title: "Služba je dočasne nedostupná",
    message: "Príspevok sme nepotvrdili. Skúste to, prosím, neskôr.",
  };
}
