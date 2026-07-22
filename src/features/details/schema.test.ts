import { describe, expect, it } from "vitest";

import { detailsSchema } from "./schema";

describe("detailsSchema", () => {
  it("accepts an optional first name and phone", () => {
    expect(
      detailsSchema.parse({
        firstName: "",
        lastName: " Nováková ",
        email: " JANA@EXAMPLE.SK ",
        phone: "",
        phoneCountry: "SK",
      }),
    ).toEqual({
      firstName: "",
      lastName: "Nováková",
      email: "jana@example.sk",
      phoneE164: null,
      phoneCountry: null,
    });
  });

  it("enforces exact name length boundaries", () => {
    const base = {
      lastName: "Novák",
      email: "jana@example.sk",
      phone: "",
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
        phone: "+49 151 234567",
      }).success,
    ).toBe(false);
  });
});
