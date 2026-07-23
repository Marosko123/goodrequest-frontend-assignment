import { describe, expect, it } from "vitest";

import {
  MAX_DONATION_CENTS,
  normalizeAmountEdit,
  normalizeAmountOnBlur,
  parseDonationAmount,
  parseAmountToCents,
} from "./amount";

describe("parseAmountToCents", () => {
  it.each([
    ["5", 500],
    ["10,50", 1050],
    ["10.50", 1050],
    ["1 234,56 €", 123456],
    ["0005,2", 520],
    ["0,01", 1],
    ["999999", MAX_DONATION_CENTS],
    ["999 999 €", MAX_DONATION_CENTS],
  ])("parses %s into whole cents", (value, expected) => {
    expect(parseAmountToCents(value)).toBe(expected);
  });

  it.each([
    "",
    "0",
    "-5",
    "−5",
    "+5",
    "1e3",
    "Infinity",
    "10,555",
    "1,2.3",
    "12 34",
    "1 23 456",
    "1 234 56",
    "999999,01",
    "1000000",
    "€",
  ])("rejects %s", (value) => {
    expect(parseAmountToCents(value)).toBeNull();
  });
});

describe("parseDonationAmount", () => {
  it.each([
    ["", "empty"],
    ["0", "nonPositive"],
    ["0,00", "nonPositive"],
    ["10,555", "precision"],
    ["999999,01", "tooLarge"],
    ["1000000", "tooLarge"],
    ["999999999999999999999", "tooLarge"],
    ["-151", "format"],
    ["1e3", "format"],
    ["1,2.3", "format"],
    ["12 34", "format"],
  ] as const)("classifies %s as %s", (value, code) => {
    expect(parseDonationAmount(value)).toEqual({ ok: false, code });
  });
});

describe("normalizeAmountEdit", () => {
  it.each([
    ["1 234,56 €", "sk", "1234,56"],
    ["1 234.56 €", "en", "1234.56"],
    ["1 234.56 €", "cz", "1234,56"],
    ["10.5", "sk", "10,5"],
    ["10,5", "en", "10.5"],
    ["", "sk", ""],
  ] as const)("normalizes %s for %s", (value, locale, expected) => {
    expect(normalizeAmountEdit(value, locale)).toEqual({
      accepted: true,
      value: expected,
    });
  });

  it.each([
    ["-151", "format"],
    ["−151", "format"],
    ["+151", "format"],
    ["1e3", "format"],
    ["12a", "format"],
    ["1,2.3", "format"],
    ["12 34", "format"],
    ["10,555", "precision"],
    ["999999,01", "tooLarge"],
    ["1000000", "tooLarge"],
  ] as const)("rejects %s without rewriting its meaning", (value, code) => {
    expect(normalizeAmountEdit(value, "sk")).toEqual({
      accepted: false,
      code,
    });
  });
});

describe("normalizeAmountOnBlur", () => {
  it.each([
    ["0005,20", "sk", "5,20"],
    ["0005.20", "en", "5.20"],
    ["0005.20", "cz", "5,20"],
    ["5,", "sk", "5"],
    ["000", "sk", "0"],
    ["", "en", ""],
  ] as const)("normalizes %s for %s", (value, locale, expected) => {
    expect(normalizeAmountOnBlur(value, locale)).toBe(expected);
  });
});
