import { describe, expect, it } from "vitest";

import { ApiError } from "./client";
import { shouldRetryRead } from "./queries";

describe("shouldRetryRead", () => {
  it("retries one network or server failure", () => {
    expect(
      shouldRetryRead(0, new ApiError("network", "Network unavailable")),
    ).toBe(true);
    expect(
      shouldRetryRead(0, new ApiError("http", "Service unavailable", 503)),
    ).toBe(true);
  });

  it("does not retry validation, client errors or a second failure", () => {
    expect(
      shouldRetryRead(0, new ApiError("contract", "Invalid response")),
    ).toBe(false);
    expect(shouldRetryRead(0, new ApiError("http", "Bad request", 400))).toBe(
      false,
    );
    expect(
      shouldRetryRead(1, new ApiError("network", "Network unavailable")),
    ).toBe(false);
  });
});
