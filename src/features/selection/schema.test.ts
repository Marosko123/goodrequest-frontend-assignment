import { describe, expect, it } from "vitest";

import type { Shelter } from "@/domain/donation";

import { createSelectionSchema } from "./schema";

const shelters: Shelter[] = [
  { id: 4, name: "Útulok pre psov - TEZAS" },
  { id: 7, name: "Útulok Nádej" },
];

describe("createSelectionSchema", () => {
  it("removes a stale shelter from a foundation contribution", () => {
    const result = createSelectionSchema(shelters).parse({
      target: "foundation",
      shelterId: "4",
      amount: "20",
    });

    expect(result).toEqual({ target: "foundation", amountCents: 2000 });
  });

  it("requires and resolves an existing shelter for a targeted contribution", () => {
    const schema = createSelectionSchema(shelters);

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
    const result = createSelectionSchema(shelters).safeParse({
      target: "foundation",
      shelterId: "",
      amount: "1e3",
    });

    expect(result.success).toBe(false);
  });
});
