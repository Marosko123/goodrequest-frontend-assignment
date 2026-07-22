import { describe, expect, it } from "vitest";

import { parseAmountToCents } from "./amount";

describe("parseAmountToCents", () => {
  it.each([
    ["5", 500],
    ["10,50", 1050],
    ["10.50", 1050],
    [" 50 € ", 5000],
    ["0005,2", 520],
  ])("parses %s into whole cents", (value, expected) => {
    expect(parseAmountToCents(value)).toBe(expected);
  });

  it.each(["", "0", "-5", "1e3", "Infinity", "10,555", "€"])(
    "rejects %s",
    (value) => {
      expect(parseAmountToCents(value)).toBeNull();
    },
  );
});
