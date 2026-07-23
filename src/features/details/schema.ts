import type { TFunction } from "i18next";
import { z } from "zod";

import type { DonorDetails } from "@/domain/donation";

import { parsePhone, type PhoneErrorCode } from "./phone";

function normalizeName(value: string): string {
  return value.trim().normalize("NFC");
}

function characterCount(value: string): number {
  return [...value].length;
}

function normalizeEmailDomain(value: string): string {
  const separatorIndex = value.lastIndexOf("@");
  if (separatorIndex < 0) {
    return value;
  }

  return `${value.slice(0, separatorIndex)}@${value
    .slice(separatorIndex + 1)
    .toLowerCase()}`;
}

export function getPhoneErrorMessage(
  code: PhoneErrorCode,
  t: TFunction,
): string {
  switch (code) {
    case "empty":
      return t("details.phoneRequiredError");
    case "characters":
      return t("details.phoneCharactersError");
    case "unsupportedCountry":
      return t("details.phoneCountryError");
    case "tooLong":
      return t("details.phoneTooLongError");
    case "invalid":
      return t("details.phoneError");
  }
}

export function createDetailsSchema(t: TFunction) {
  const normalizedName = z.string().transform(normalizeName);
  const optionalFirstName = normalizedName.refine(
    (value) =>
      characterCount(value) === 0 ||
      (characterCount(value) >= 2 && characterCount(value) <= 20),
    { message: t("details.firstNameError") },
  );

  return z
    .object({
      firstName: optionalFirstName,
      lastName: normalizedName
        .refine((value) => characterCount(value) >= 2, {
          message: t("details.lastNameMinError"),
        })
        .refine((value) => characterCount(value) <= 30, {
          message: t("details.lastNameMaxError"),
        }),
      email: z
        .string()
        .trim()
        .max(254, t("details.emailTooLongError"))
        .pipe(z.email(t("details.emailError")))
        .transform(normalizeEmailDomain),
      phone: z.string(),
      phoneCountry: z.enum(["SK", "CZ"]),
    })
    .superRefine((values, context) => {
      const phone = parsePhone(values.phone, values.phoneCountry);
      if (!phone.ok) {
        context.addIssue({
          code: "custom",
          message: getPhoneErrorMessage(phone.code, t),
          path: ["phone"],
        });
      }
    })
    .transform((values): DonorDetails => {
      const phone = parsePhone(values.phone, values.phoneCountry);
      if (!phone.ok) {
        return z.NEVER;
      }

      return {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneE164: phone.phoneE164,
        phoneCountry: phone.phoneCountry,
      };
    });
}

export type DetailsFormValues = z.input<ReturnType<typeof createDetailsSchema>>;
