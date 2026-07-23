import { describe, expect, it } from "vitest";

import { isValidSupportedPhone } from "./supported-phone";

describe("isValidSupportedPhone", () => {
  it.each([
    ["+421901234567", "SK"],
    ["+421216123", "SK"],
    ["+420777123456", "CZ"],
    ["+420212345678", "CZ"],
  ] as const)("accepts a valid %s number", (phone, country) => {
    expect(isValidSupportedPhone(phone, country)).toBe(true);
  });

  it.each([
    ["+421000000000", "SK"],
    ["+420000000000", "CZ"],
    ["+420777123456", "SK"],
    ["+421901234567", "CZ"],
    ["0901234567", "SK"],
    [`+421${"1".repeat(1_000)}`, "SK"],
  ] as const)("rejects %s for %s", (phone, country) => {
    expect(isValidSupportedPhone(phone, country)).toBe(false);
  });
});
