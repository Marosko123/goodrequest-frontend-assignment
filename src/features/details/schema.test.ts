import { describe, expect, it } from "vitest";

import { createTranslator } from "@/i18n/instance";

import { createDetailsSchema } from "./schema";

const detailsSchema = createDetailsSchema(createTranslator("sk"));

describe("detailsSchema", () => {
  it("uses the editable dial code as the normalized phone country", () => {
    expect(
      detailsSchema.parse({
        firstName: "",
        lastName: "Nováková",
        email: "jana@example.sk",
        phoneDialCode: "420",
        phone: "777 123 456",
        phoneCountry: "SK",
      }),
    ).toMatchObject({
      phoneE164: "+420777123456",
      phoneCountry: "CZ",
    });
  });

  it("reports an incomplete or unsupported editable dial code", () => {
    const base = {
      firstName: "",
      lastName: "Nováková",
      email: "jana@example.sk",
      phone: "901 234 567",
      phoneCountry: "SK" as const,
    };

    for (const phoneDialCode of ["", "42", "422"]) {
      const result = detailsSchema.safeParse({ ...base, phoneDialCode });

      expect(result.success).toBe(false);
      expect(result.error?.issues.map((issue) => issue.path)).toContainEqual([
        "phoneDialCode",
      ]);
    }
  });

  it("reports both an invalid dial code and an empty national number", () => {
    const result = detailsSchema.safeParse({
      firstName: "",
      lastName: "Nováková",
      email: "jana@example.sk",
      phoneDialCode: "422",
      phone: "",
      phoneCountry: "SK",
    });

    expect(result.error?.issues.map((issue) => issue.path)).toEqual(
      expect.arrayContaining([["phoneDialCode"], ["phone"]]),
    );
  });

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

  it("rejects single-character names and counts non-Latin ones by character", () => {
    const base = {
      email: "donor@goodrequest.sk",
      phone: "901 234 567",
      phoneCountry: "SK" as const,
    };

    // The assignment mandates 2-20 / 2-30 characters, so one character is short
    // even when it is a complete name in its own writing system.
    expect(
      detailsSchema.safeParse({ ...base, firstName: "J", lastName: "Nováková" })
        .success,
    ).toBe(false);
    expect(
      detailsSchema.safeParse({ ...base, firstName: "Jana", lastName: "李" })
        .success,
    ).toBe(false);
    expect(
      detailsSchema.safeParse({ ...base, firstName: "明", lastName: "李明" })
        .success,
    ).toBe(false);
    expect(
      detailsSchema.safeParse({ ...base, firstName: "小明", lastName: "李明" })
        .success,
    ).toBe(true);
  });

  it("rejects values that are not plausible personal names", () => {
    const base = {
      firstName: "Jana",
      lastName: "Nováková",
      email: "donor@goodrequest.sk",
      phone: "901 234 567",
      phoneCountry: "SK" as const,
    };

    for (const invalidName of ["Jana123", "Jana🐶", "--", "O’", "de  la"]) {
      expect(
        detailsSchema.safeParse({ ...base, firstName: invalidName }).success,
      ).toBe(false);
      expect(
        detailsSchema.safeParse({ ...base, lastName: invalidName }).success,
      ).toBe(false);
    }
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
    // "E" + combining acute is two code points but one character after NFC, so
    // the bounds must be measured on the normalized value, not the raw input.
    expect(
      detailsSchema.safeParse({
        ...base,
        firstName: "E\u0301".repeat(20),
        email: "a@b.sk",
      }).success,
    ).toBe(true);
    expect(
      detailsSchema.safeParse({
        ...base,
        firstName: "E\u0301".repeat(21),
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
    expect(detailsSchema.safeParse({ ...base, firstName: "Ja" }).success).toBe(
      true,
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
      detailsSchema.safeParse({ ...base, firstName: "", lastName: "No" })
        .success,
    ).toBe(true);
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

  it("enforces mailbox and domain limits but accepts reserved test domains", () => {
    const base = {
      firstName: "Jana",
      lastName: "Nováková",
      phone: "901 234 567",
      phoneCountry: "SK" as const,
    };

    expect(
      detailsSchema.safeParse({
        ...base,
        email: `${"a".repeat(64)}@goodrequest.sk`,
      }).success,
    ).toBe(true);
    expect(
      detailsSchema.safeParse({
        ...base,
        email: `${"a".repeat(65)}@goodrequest.sk`,
      }).success,
    ).toBe(false);
    expect(
      detailsSchema.safeParse({
        ...base,
        email: `donor@${"a".repeat(64)}.sk`,
      }).success,
    ).toBe(false);

    // The assignment asks only for a valid format, so RFC 2606 reserved domains
    // stay acceptable. `test@example.com` is the first address a reviewer types.
    for (const email of [
      "donor@example.com",
      "donor@sub.example.org",
      "donor@service.test",
      "donor@foo.invalid",
      "donor@docs.example",
    ]) {
      expect(detailsSchema.safeParse({ ...base, email }).success).toBe(true);
    }
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
      "Enter a valid last name using letters, spaces, apostrophes or hyphens.",
    );
    expect(result.error?.issues.map((issue) => issue.path)).toContainEqual([
      "phone",
    ]);
  });
});
