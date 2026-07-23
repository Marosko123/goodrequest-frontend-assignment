import type { TFunction } from "i18next";

import type { DonationSelection, Shelter } from "@/domain/donation";
import { z } from "@/lib/validation/zod";

import { getAmountErrorMessage, parseDonationAmount } from "./amount";

export function createSelectionSchema(
  shelters: readonly Shelter[],
  t: TFunction,
) {
  const inputSchema = z
    .object({
      target: z.enum(["foundation", "shelter"]),
      shelterId: z.optional(z.nullable(z.string())),
      amount: z.string(),
    })
    .check(
      // Both fields are checked independently: an invalid amount must not hide a
      // missing shelter, or the person would discover the two errors across two
      // submit attempts instead of seeing both fields flagged at once.
      z.superRefine((values, context) => {
        const amountResult = parseDonationAmount(values.amount);
        if (!amountResult.ok) {
          context.addIssue({
            code: "custom",
            message: getAmountErrorMessage(amountResult.code, t),
            path: ["amount"],
          });
        }

        if (values.target === "foundation") {
          return;
        }

        const shelterId = Number(values.shelterId);
        const shelter = shelters.find(
          (candidate) => candidate.id === shelterId,
        );
        if (!values.shelterId || !shelter) {
          context.addIssue({
            code: "custom",
            message: t("selection.shelterError"),
            path: ["shelterId"],
          });
        }
      }),
    );

  return z.pipe(
    inputSchema,
    z.transform<z.output<typeof inputSchema>, DonationSelection>((values) => {
      const amountResult = parseDonationAmount(values.amount);
      if (!amountResult.ok) {
        return z.NEVER;
      }
      const amountCents = amountResult.cents;

      if (values.target === "foundation") {
        return { target: "foundation", amountCents };
      }

      const shelterId = Number(values.shelterId);
      const shelter = shelters.find((candidate) => candidate.id === shelterId);
      if (!values.shelterId || !shelter) {
        return z.NEVER;
      }

      return { target: "shelter", amountCents, shelter };
    }),
  );
}

export type SelectionFormValues = z.input<
  ReturnType<typeof createSelectionSchema>
>;
