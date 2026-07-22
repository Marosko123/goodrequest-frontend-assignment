import { z } from "zod";

import type { DonorDetails } from "@/domain/donation";

import { normalizePhone } from "./phone";

const optionalFirstName = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || (value.length >= 2 && value.length <= 20),
    {
      message: "Meno musí mať 2 až 20 znakov alebo zostať prázdne.",
    },
  );

export const phoneErrorMessage =
  "Zadajte platné slovenské alebo české telefónne číslo.";

export const detailsSchema = z
  .object({
    firstName: optionalFirstName,
    lastName: z
      .string()
      .trim()
      .min(2, "Priezvisko musí mať aspoň 2 znaky.")
      .max(30, "Priezvisko môže mať najviac 30 znakov."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Zadajte platnú e-mailovú adresu.")),
    phone: z.string(),
    phoneCountry: z.enum(["SK", "CZ"]),
  })
  .transform((values, context): DonorDetails => {
    const phone = normalizePhone(values.phone, values.phoneCountry);
    if (!phone) {
      context.addIssue({
        code: "custom",
        message: phoneErrorMessage,
        path: ["phone"],
      });
      return z.NEVER;
    }

    return {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      ...phone,
    };
  });

export type DetailsFormValues = z.input<typeof detailsSchema>;
