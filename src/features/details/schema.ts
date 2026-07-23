import type { TFunction } from "i18next";

import type { DonorDetails, PhoneCountry } from "@/domain/donation";
import {
  createEmailSchema,
  createPersonNameSchema,
  personNameLimits,
} from "@/lib/validation/personal-details";
import { z } from "@/lib/validation/zod";

import {
  getCountryFromPhoneDialCode,
  getPhoneErrorMessage,
  parsePhone,
} from "./phone";

function parseDetailsPhone(
  phone: string,
  phoneDialCode: string | undefined,
  phoneCountry: PhoneCountry,
) {
  if (!phone.trim()) {
    return parsePhone("", phoneCountry);
  }
  if (phoneDialCode === undefined) {
    return parsePhone(phone, phoneCountry);
  }
  if (!getCountryFromPhoneDialCode(phoneDialCode)) {
    return { ok: false, code: "unsupportedCountry" } as const;
  }
  return parsePhone(`+${phoneDialCode}${phone}`, phoneCountry);
}

export function createDetailsSchema(t: TFunction) {
  const inputSchema = z
    .object({
      firstName: createPersonNameSchema({
        ...personNameLimits.firstName,
        error: t("details.firstNameError"),
        optional: true,
      }),
      lastName: createPersonNameSchema({
        ...personNameLimits.lastName,
        error: t("details.lastNameError"),
      }),
      email: createEmailSchema({
        invalid: t("details.emailError"),
        tooLong: t("details.emailTooLongError"),
      }),
      phoneDialCode: z.optional(z.string()),
      phone: z.string(),
      phoneCountry: z.enum(["SK", "CZ"]),
    })
    .check(
      z.superRefine((values, context) => {
        const hasUnsupportedDialCode =
          values.phoneDialCode !== undefined &&
          !getCountryFromPhoneDialCode(values.phoneDialCode);
        if (hasUnsupportedDialCode) {
          context.addIssue({
            code: "custom",
            message: getPhoneErrorMessage("unsupportedCountry", t),
            path: ["phoneDialCode"],
          });
        }

        const phone = parseDetailsPhone(
          values.phone,
          values.phoneDialCode,
          values.phoneCountry,
        );
        if (
          !phone.ok &&
          !(hasUnsupportedDialCode && phone.code === "unsupportedCountry")
        ) {
          context.addIssue({
            code: "custom",
            message: getPhoneErrorMessage(phone.code, t),
            path: ["phone"],
          });
        }
      }),
    );

  return z.pipe(
    inputSchema,
    z.transform<z.output<typeof inputSchema>, DonorDetails>((values) => {
      const phone = parseDetailsPhone(
        values.phone,
        values.phoneDialCode,
        values.phoneCountry,
      );
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
    }),
  );
}

type DetailsSchemaInput = z.input<ReturnType<typeof createDetailsSchema>>;

export type DetailsFormValues = Omit<DetailsSchemaInput, "phoneDialCode"> & {
  phoneDialCode: string;
};
