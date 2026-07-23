import type { TFunction } from "i18next";

import { z } from "@/lib/validation/zod";

export type ReviewFormValues = {
  consent: boolean;
};

export function createReviewSchema(t: TFunction) {
  return z.object({
    consent: z
      .boolean()
      .check(z.refine((value) => value, { message: t("review.consentError") })),
  });
}
