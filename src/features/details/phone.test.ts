import { describe, expect, it } from "vitest";

import { detectPhoneCountry, normalizePhone } from "./phone";

describe("normalizePhone", () => {
  it.each([
    ["0901 234 567", "SK", "+421901234567"],
    ["+421 901 234 567", "SK", "+421901234567"],
    ["777 123 456", "CZ", "+420777123456"],
    ["+420 777 123 456", "SK", "+420777123456"],
  ] as const)("normalizes %s", (value, country, expected) => {
    expect(normalizePhone(value, country)).toEqual({
      phoneE164: expected,
      phoneCountry: expected.startsWith("+420") ? "CZ" : "SK",
    });
  });

  it("returns empty phone data for an optional blank value", () => {
    expect(normalizePhone("  ", "SK")).toEqual({
      phoneE164: null,
      phoneCountry: null,
    });
  });

  it.each(["123", "+421 000", "+49 151 234567"])("rejects %s", (value) => {
    expect(normalizePhone(value, "SK")).toBeNull();
  });
});

describe("detectPhoneCountry", () => {
  it("recognizes supported international prefixes", () => {
    expect(detectPhoneCountry("+420 777 123 456")).toBe("CZ");
    expect(detectPhoneCountry("00421 901 234 567")).toBe("SK");
    expect(detectPhoneCountry("0901 234 567")).toBeNull();
  });
});
