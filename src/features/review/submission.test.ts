import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client";

import { assertContributionAccepted, getSubmissionError } from "./submission";

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
      getSubmissionError(new ApiError("network", "offline"), false),
    ).toMatchObject({ kind: "offline" });
    expect(
      getSubmissionError(new ApiError("timeout", "timeout"), true),
    ).toMatchObject({ kind: "unknown" });
  });

  it("gives useful feedback for rate limits and invalid data", () => {
    expect(
      getSubmissionError(new ApiError("http", "rate", 429), true),
    ).toMatchObject({ kind: "rate-limit" });
    expect(
      getSubmissionError(new ApiError("http", "invalid", 422), true),
    ).toMatchObject({ kind: "invalid" });
  });
});
