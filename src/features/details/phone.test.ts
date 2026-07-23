import { describe, expect, it } from "vitest";

import {
  detectPhoneCountry,
  formatPhoneInput,
  getCountryFromPhoneDialCode,
  getPhoneCaretIndex,
  getPhoneDialCode,
  normalizePhone,
  parsePhone,
} from "./phone";

describe("normalizePhone", () => {
  it.each([
    ["0901 234 567", "SK", "+421901234567"],
    ["+421 901 234 567", "SK", "+421901234567"],
    ["+421.901.234.567", "CZ", "+421901234567"],
    ["777 123 456", "CZ", "+420777123456"],
    ["+420 777 123 456", "SK", "+420777123456"],
  ] as const)("normalizes %s", (value, country, expected) => {
    expect(normalizePhone(value, country)).toEqual({
      phoneE164: expected,
      phoneCountry: expected.startsWith("+420") ? "CZ" : "SK",
    });
  });

  it("rejects a blank value because phone is required", () => {
    expect(normalizePhone("  ", "SK")).toBeNull();
  });

  it.each(["123", "+421 000", "+49 151 234567"])("rejects %s", (value) => {
    expect(normalizePhone(value, "SK")).toBeNull();
  });
});

describe("parsePhone", () => {
  it.each([
    ["", "empty"],
    ["123", "invalid"],
    ["+49 151 234567", "unsupportedCountry"],
    ["901 abc 567", "characters"],
    ["1234567890123456", "tooLong"],
  ] as const)("classifies %s as %s", (value, code) => {
    expect(parsePhone(value, "SK")).toEqual({ ok: false, code });
  });
});

describe("formatPhoneInput", () => {
  it.each([
    ["+420 777 123 456", "SK", "777 123 456", "CZ"],
    ["00421 901 234 567", "CZ", "901 234 567", "SK"],
    ["0901 234 567", "SK", "901 234 567", "SK"],
    ["", "CZ", "", "CZ"],
  ] as const)(
    "formats %s and synchronizes %s",
    (value, country, expectedValue, expectedCountry) => {
      expect(formatPhoneInput(value, country)).toEqual({
        accepted: true,
        value: expectedValue,
        country: expectedCountry,
      });
    },
  );

  it.each([
    ["901abc", "characters"],
    ["+49 151 234567", "unsupportedCountry"],
    ["1234567890", "tooLong"],
  ] as const)("rejects %s as %s without mutating it", (value, code) => {
    expect(formatPhoneInput(value, "SK")).toEqual({
      accepted: false,
      code,
    });
  });
});

describe("detectPhoneCountry", () => {
  it("recognizes supported international prefixes", () => {
    expect(detectPhoneCountry("+420 777 123 456")).toBe("CZ");
    expect(detectPhoneCountry("00421 901 234 567")).toBe("SK");
    expect(detectPhoneCountry("+421 (901) 234-567")).toBe("SK");
    expect(detectPhoneCountry("0901 234 567")).toBeNull();
  });
});

describe("segmented phone editing", () => {
  it("maps only the supported editable dial codes", () => {
    expect(getPhoneDialCode("SK")).toBe("421");
    expect(getPhoneDialCode("CZ")).toBe("420");
    expect(getCountryFromPhoneDialCode("421")).toBe("SK");
    expect(getCountryFromPhoneDialCode("420")).toBe("CZ");
    expect(getCountryFromPhoneDialCode("42")).toBeNull();
    expect(getCountryFromPhoneDialCode("422")).toBeNull();
  });

  it.each([
    ["", 0, 0],
    ["901 234 567", 0, 0],
    ["901 234 567", 3, 3],
    ["901 234 567", 4, 5],
    ["901 234 567", 9, 11],
  ] as const)(
    "maps %s digit offset %i to caret %i",
    (value, digitOffset, expected) => {
      expect(getPhoneCaretIndex(value, digitOffset)).toBe(expected);
    },
  );
});
