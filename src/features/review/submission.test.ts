import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client";
import { assertContributionAccepted } from "@/lib/api/outcome";

import { getSubmissionError } from "./submission";

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
      getSubmissionError(new ApiError("network", "interrupted")),
    ).toMatchObject({ kind: "unknown" });
    expect(
      getSubmissionError(new ApiError("timeout", "timeout")),
    ).toMatchObject({ kind: "unknown" });
    expect(
      getSubmissionError(new ApiError("http", "server", 503)),
    ).toMatchObject({ kind: "unknown" });
    expect(
      getSubmissionError(new ApiError("contract", "bad response")),
    ).toMatchObject({ kind: "unknown" });
  });

  it("gives useful feedback for rate limits and invalid data", () => {
    expect(getSubmissionError(new ApiError("http", "rate", 429))).toMatchObject(
      { kind: "rate-limit" },
    );
    expect(
      getSubmissionError(new ApiError("http", "invalid", 422)),
    ).toMatchObject({ kind: "invalid" });
  });
});
