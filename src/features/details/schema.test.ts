import { describe, expect, it } from "vitest";

import { createTranslator } from "@/i18n/instance";

import { createDetailsSchema } from "./schema";

const detailsSchema = createDetailsSchema(createTranslator("sk"));

describe("detailsSchema", () => {
  it("accepts an optional first name and normalizes the required phone", () => {
    expect(
      detailsSchema.parse({
        firstName: "",
        lastName: " Nováková ",
        email: " JANA@EXAMPLE.SK ",
        phone: "0901 234 567",
        phoneCountry: "SK",
      }),
    ).toEqual({
      firstName: "",
      lastName: "Nováková",
      email: "JANA@example.sk",
      phoneE164: "+421901234567",
      phoneCountry: "SK",
    });
  });

  it("accepts legitimate Unicode, spaced, apostrophe and hyphenated names", () => {
    expect(
      detailsSchema.parse({
        firstName: "  Mária-Lujza  ",
        lastName: " O’Connor de la Cruz ",
        email: "Donor.Name@EXAMPLE.SK",
        phone: "901 234 567",
        phoneCountry: "SK",
      }),
    ).toMatchObject({
      firstName: "Mária-Lujza",
      lastName: "O’Connor de la Cruz",
      email: "Donor.Name@example.sk",
    });
  });

  it("counts normalized Unicode characters and enforces the 254-char e-mail limit", () => {
    const base = {
      firstName: "Jana",
      lastName: "Nováková",
      phone: "901 234 567",
      phoneCountry: "SK" as const,
    };
    const email254 = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(61)}`;
    const email255 = `${email254}d`;

    expect(detailsSchema.safeParse({ ...base, email: email254 }).success).toBe(
      true,
    );
    expect(detailsSchema.safeParse({ ...base, email: email255 }).success).toBe(
      false,
    );
    expect(
      detailsSchema.safeParse({
        ...base,
        firstName: "E\u0301",
        email: "a@b.sk",
      }).success,
    ).toBe(false);
  });

  it("enforces exact name length boundaries", () => {
    const base = {
      lastName: "Novák",
      email: "jana@example.sk",
      phone: "0901 234 567",
      phoneCountry: "SK" as const,
    };

    expect(detailsSchema.safeParse({ ...base, firstName: "J" }).success).toBe(
      false,
    );
    expect(
      detailsSchema.safeParse({ ...base, firstName: "J".repeat(20) }).success,
    ).toBe(true);
    expect(
      detailsSchema.safeParse({ ...base, firstName: "J".repeat(21) }).success,
    ).toBe(false);
    expect(
      detailsSchema.safeParse({ ...base, firstName: "", lastName: "N" })
        .success,
    ).toBe(false);
    expect(
      detailsSchema.safeParse({
        ...base,
        firstName: "",
        lastName: "N".repeat(30),
      }).success,
    ).toBe(true);
    expect(
      detailsSchema.safeParse({
        ...base,
        firstName: "",
        lastName: "N".repeat(31),
      }).success,
    ).toBe(false);
  });

  it("requires a valid e-mail and supported phone", () => {
    const base = {
      firstName: "Jana",
      lastName: "Nováková",
      phoneCountry: "SK" as const,
    };

    expect(
      detailsSchema.safeParse({ ...base, email: "jana", phone: "" }).success,
    ).toBe(false);
    expect(
      detailsSchema.safeParse({
        ...base,
        email: "jana@example.sk",
        phone: "",
      }).success,
    ).toBe(false);
    expect(
      detailsSchema.safeParse({
        ...base,
        email: "jana@example.sk",
        phone: "+49 151 234567",
      }).success,
    ).toBe(false);
  });

  it("returns validation messages in the requested locale", () => {
    const result = createDetailsSchema(createTranslator("en")).safeParse({
      firstName: "",
      lastName: "",
      email: "not-an-email",
      phone: "",
      phoneCountry: "SK",
    });

    expect(result.error?.issues.map((issue) => issue.message)).toContain(
      "Last name must contain at least 2 characters.",
    );
    expect(result.error?.issues.map((issue) => issue.path)).toContainEqual([
      "phone",
    ]);
  });
});
