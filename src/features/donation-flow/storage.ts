import { z } from "@/lib/validation/zod";
import { MAX_DONATION_CENTS } from "@/domain/donation";
import {
  createEmailSchema,
  createPersonNameSchema,
  personNameLimits,
} from "@/lib/validation/personal-details";
import { isValidSupportedPhone } from "@/lib/validation/supported-phone";

import type { PersistedDonationFlowState } from "./state";
import { storageKey } from "./storage-key";

export { storageKey } from "./storage-key";

const emptyPersistedFlow: PersistedDonationFlowState = {
  selection: null,
  donor: null,
  selectionDraft: null,
  donorDraft: null,
};

const targetSchema = z.union([z.literal("foundation"), z.literal("shelter")]);
const phoneCountrySchema = z.union([z.literal("SK"), z.literal("CZ")]);
const amountCentsSchema = z
  .number()
  .check(z.int())
  .check(z.positive())
  .check(z.maximum(MAX_DONATION_CENTS));
const shelterSchema = z.strictObject({
  id: z.number().check(z.int()).check(z.positive()),
  name: z.string().check(z.trim()).check(z.minLength(1)),
});
const selectionSchema = z.discriminatedUnion("target", [
  z.strictObject({
    target: z.literal("foundation"),
    amountCents: amountCentsSchema,
  }),
  z.strictObject({
    target: z.literal("shelter"),
    amountCents: amountCentsSchema,
    shelter: shelterSchema,
  }),
]);
const persistedDonorSchema = z
  .strictObject({
    firstName: createPersonNameSchema({
      ...personNameLimits.firstName,
      error: "Invalid first name.",
      optional: true,
    }),
    lastName: createPersonNameSchema({
      ...personNameLimits.lastName,
      error: "Invalid last name.",
    }),
    email: createEmailSchema({
      invalid: "Invalid email address.",
      tooLong: "The email address is too long.",
    }),
    phoneE164: z.string(),
    phoneCountry: phoneCountrySchema,
  })
  .check(
    z.refine(({ phoneCountry, phoneE164 }) =>
      isValidSupportedPhone(phoneE164, phoneCountry),
    ),
  );
// Drafts hold half-typed input, so only the upper bound applies here.
const persistedDonorDraftSchema = z.object({
  firstName: z
    .string()
    .check(z.maxLength(personNameLimits.firstName.maxLength)),
  lastName: z.string().check(z.maxLength(personNameLimits.lastName.maxLength)),
  email: z.string().check(z.maxLength(254)),
  phoneDialCode: z.optional(
    z.string().check(z.maxLength(3)).check(z.regex(/^\d*$/u)),
  ),
  phone: z.string().check(z.maxLength(32)),
  phoneCountry: phoneCountrySchema,
});

const persistedFlowSchema = z.object({
  version: z.literal(1),
  data: z.object({
    selection: z.nullable(selectionSchema),
    donor: z.nullable(persistedDonorSchema),
    selectionDraft: z.nullable(
      z.object({
        target: targetSchema,
        shelterId: z.nullable(z.string()),
        amount: z.string(),
      }),
    ),
    donorDraft: z.nullable(persistedDonorDraftSchema),
  }),
});

export function loadDonationFlowStorage(): PersistedDonationFlowState {
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) {
      return emptyPersistedFlow;
    }

    const result = persistedFlowSchema.safeParse(JSON.parse(raw));
    if (!result.success) {
      return emptyPersistedFlow;
    }

    const data = result.data.data;
    const donorDraft = data.donorDraft
      ? {
          ...data.donorDraft,
          phoneDialCode:
            data.donorDraft.phoneDialCode ??
            (data.donorDraft.phoneCountry === "SK" ? "421" : "420"),
        }
      : null;

    return { ...data, donorDraft };
  } catch {
    return emptyPersistedFlow;
  }
}

export function saveDonationFlowStorage(
  state: PersistedDonationFlowState,
): void {
  try {
    const { selection, donor, selectionDraft, donorDraft } = state;
    window.sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        data: { selection, donor, selectionDraft, donorDraft },
      }),
    );
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

export function clearDonationFlowStorage(): void {
  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}
