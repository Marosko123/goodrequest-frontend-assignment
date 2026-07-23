import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client";
import { assertContributionAccepted } from "@/lib/api/outcome";

import { ContributionPreparationError } from "./submit-contribution";
import { getSubmissionStateFromError } from "./submission";

describe("submission outcome", () => {
  it("accepts only a response with no error and an explicit success", () => {
    expect(
      assertContributionAccepted({
        messages: [{ message: "Príspevok prijatý", type: "SUCCESS" }],
      }),
    ).toBe("Príspevok prijatý");

    expect(() =>
      assertContributionAccepted({
        messages: [{ message: "Údaje boli odmietnuté", type: "ERROR" }],
      }),
    ).toThrow("Údaje boli odmietnuté");
  });

  it("does not infer success from an informational response", () => {
    expect(() =>
      assertContributionAccepted({
        messages: [{ message: "Požiadavka sa spracúva", type: "INFO" }],
      }),
    ).toThrow("nepotvrdilo");
  });

  it("distinguishes offline and unknown request outcomes", () => {
    expect(
      getSubmissionStateFromError(new ApiError("network", "interrupted")),
    ).toBe("unknown-outcome");
    expect(
      getSubmissionStateFromError(new ApiError("timeout", "timeout")),
    ).toBe("unknown-outcome");
    expect(
      getSubmissionStateFromError(new ApiError("http", "server", 503)),
    ).toBe("unknown-outcome");
    expect(
      getSubmissionStateFromError(new ApiError("contract", "bad response")),
    ).toBe("unknown-outcome");
  });

  it("gives useful feedback for rate limits and invalid data", () => {
    expect(getSubmissionStateFromError(new ApiError("http", "rate", 429))).toBe(
      "rate-limited",
    );
    expect(
      getSubmissionStateFromError(new ApiError("http", "invalid", 422)),
    ).toBe("invalid");
    expect(getSubmissionStateFromError(new Error("unexpected"))).toBe(
      "service-unavailable",
    );
  });

  it("distinguishes invalid local data from an unavailable preflight", () => {
    expect(
      getSubmissionStateFromError(new ContributionPreparationError("invalid")),
    ).toBe("invalid");
    expect(
      getSubmissionStateFromError(
        new ContributionPreparationError("unavailable"),
      ),
    ).toBe("service-unavailable");
  });
});
