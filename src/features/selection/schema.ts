import { z } from "zod";

import type { DonationSelection, Shelter } from "@/domain/donation";

import { parseAmountToCents } from "./amount";

export const amountErrorMessage =
  "Zadajte kladnú sumu najviac na dve desatinné miesta.";

export function createSelectionSchema(shelters: readonly Shelter[]) {
  return z
    .object({
      target: z.enum(["foundation", "shelter"]),
      shelterId: z.string().nullable().optional(),
      amount: z.string(),
    })
    .transform((values, context): DonationSelection => {
      const amountCents = parseAmountToCents(values.amount);
      if (amountCents === null) {
        context.addIssue({
          code: "custom",
          message: amountErrorMessage,
          path: ["amount"],
        });
        return z.NEVER;
      }

      if (values.target === "foundation") {
        return { target: "foundation", amountCents };
      }

      const shelterId = Number(values.shelterId);
      const shelter = shelters.find((candidate) => candidate.id === shelterId);
      if (!values.shelterId || !shelter) {
        context.addIssue({
          code: "custom",
          message: "Vyberte útulok zo zoznamu.",
          path: ["shelterId"],
        });
        return z.NEVER;
      }

      return { target: "shelter", amountCents, shelter };
    });
}

export type SelectionFormValues = z.input<
  ReturnType<typeof createSelectionSchema>
>;
