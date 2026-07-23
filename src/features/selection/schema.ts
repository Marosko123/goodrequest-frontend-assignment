import type { TFunction } from "i18next";
import { z } from "zod";

import type { DonationSelection, Shelter } from "@/domain/donation";

import { parseDonationAmount, type AmountErrorCode } from "./amount";

export function getAmountErrorMessage(
  code: AmountErrorCode,
  t: TFunction,
): string {
  switch (code) {
    case "empty":
      return t("selection.amountErrorEmpty");
    case "nonPositive":
      return t("selection.amountErrorNonPositive");
    case "precision":
      return t("selection.amountErrorPrecision");
    case "tooLarge":
      return t("selection.amountErrorTooLarge");
    case "format":
      return t("selection.amountErrorFormat");
  }
}

export function createSelectionSchema(
  shelters: readonly Shelter[],
  t: TFunction,
) {
  return z
    .object({
      target: z.enum(["foundation", "shelter"]),
      shelterId: z.string().nullable().optional(),
      amount: z.string(),
    })
    .transform((values, context): DonationSelection => {
      const amountResult = parseDonationAmount(values.amount);
      if (!amountResult.ok) {
        context.addIssue({
          code: "custom",
          message: getAmountErrorMessage(amountResult.code, t),
          path: ["amount"],
        });
        return z.NEVER;
      }
      const amountCents = amountResult.cents;

      if (values.target === "foundation") {
        return { target: "foundation", amountCents };
      }

      const shelterId = Number(values.shelterId);
      const shelter = shelters.find((candidate) => candidate.id === shelterId);
      if (!values.shelterId || !shelter) {
        context.addIssue({
          code: "custom",
          message: t("selection.shelterError"),
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
