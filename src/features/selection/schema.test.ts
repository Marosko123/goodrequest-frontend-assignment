import { describe, expect, it } from "vitest";

import type { Shelter } from "@/domain/donation";
import { createTranslator } from "@/i18n/instance";

import { createSelectionSchema } from "./schema";

const shelters: Shelter[] = [
  { id: 4, name: "Útulok pre psov - TEZAS" },
  { id: 7, name: "Útulok Nádej" },
];

describe("createSelectionSchema", () => {
  const t = createTranslator("sk");

  it("removes a stale shelter from a foundation contribution", () => {
    const result = createSelectionSchema(shelters, t).parse({
      target: "foundation",
      shelterId: "4",
      amount: "20",
    });

    expect(result).toEqual({ target: "foundation", amountCents: 2000 });
  });

  it("requires and resolves an existing shelter for a targeted contribution", () => {
    const schema = createSelectionSchema(shelters, t);

    expect(
      schema.safeParse({ target: "shelter", shelterId: "", amount: "20" })
        .success,
    ).toBe(false);
    expect(
      schema.parse({ target: "shelter", shelterId: "4", amount: "20" }),
    ).toEqual({
      target: "shelter",
      amountCents: 2000,
      shelter: shelters[0],
    });
  });

  it("rejects an invalid custom amount", () => {
    const result = createSelectionSchema(shelters, t).safeParse({
      target: "foundation",
      shelterId: "",
      amount: "1e3",
    });

    expect(result.success).toBe(false);
  });

  it.each([
    ["", "Enter a contribution amount."],
    ["0", "The contribution amount must be greater than zero."],
    ["10.555", "Use no more than two decimal places."],
    ["1000000.01", "The maximum contribution is €1,000,000."],
    ["-151", "Use digits and at most one decimal separator."],
  ])(
    "explains the %s amount error in the requested locale",
    (amount, message) => {
      const result = createSelectionSchema(
        shelters,
        createTranslator("en"),
      ).safeParse({ target: "foundation", shelterId: null, amount });

      expect(result.error?.issues[0]?.message).toBe(message);
    },
  );
});
