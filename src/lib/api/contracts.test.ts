import { describe, expect, it } from "vitest";

import { z } from "@/lib/validation/zod";

import { contributionRequestSchema, sheltersResponseSchema } from "./contracts";

const contributor = {
  firstName: "Jana",
  lastName: "Nováková",
  email: "Jana@example.sk",
  phone: "+421901234567",
};

describe("runtime schema configuration", () => {
  it("keeps Zod CSP-safe without runtime code generation", () => {
    expect(z.config()).toMatchObject({ jitless: true });
  });
});

describe("sheltersResponseSchema", () => {
  it("accepts at most 100 shelters", () => {
    const createShelters = (count: number) =>
      Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        name: `Shelter ${index + 1}`,
      }));

    expect(
      sheltersResponseSchema.safeParse({ shelters: createShelters(100) })
        .success,
    ).toBe(true);
    expect(
      sheltersResponseSchema.safeParse({ shelters: createShelters(101) })
        .success,
    ).toBe(false);
  });

  it("accepts shelter names up to 100 characters", () => {
    expect(
      sheltersResponseSchema.safeParse({
        shelters: [{ id: 1, name: "a".repeat(100) }],
      }).success,
    ).toBe(true);
    expect(
      sheltersResponseSchema.safeParse({
        shelters: [{ id: 1, name: "a".repeat(101) }],
      }).success,
    ).toBe(false);
  });
});

describe("contributionRequestSchema", () => {
  it("accepts exactly one contributor with a supported E.164 phone", () => {
    expect(
      contributionRequestSchema.parse({
        contributors: [contributor],
        value: 25,
      }),
    ).toEqual({ contributors: [contributor], value: 25 });
  });

  it.each([
    [{ ...contributor, phone: undefined }],
    [{ ...contributor, phone: "+49151234567" }],
    [{ ...contributor, phone: "0901234567" }],
    [{ ...contributor, phone: "+421000000000" }],
  ])("rejects a contributor without a supported normalized phone", (value) => {
    expect(
      contributionRequestSchema.safeParse({ contributors: [value], value: 25 })
        .success,
    ).toBe(false);
  });

  it.each([
    { ...contributor, firstName: "Jana7" },
    { ...contributor, lastName: "🐶" },
    { ...contributor, email: "donor@goodrequest" },
    { ...contributor, email: `${"a".repeat(65)}@goodrequest.sk` },
  ])("rejects implausible contributor identity data", (value) => {
    expect(
      contributionRequestSchema.safeParse({
        contributors: [value],
        value: 25,
      }).success,
    ).toBe(false);
  });

  it("accepts an omitted first name but enforces the surname length bounds", () => {
    expect(
      contributionRequestSchema.safeParse({
        contributors: [
          {
            ...contributor,
            firstName: "",
            lastName: "李明",
            email: "donor@goodrequest.sk",
          },
        ],
        value: 25,
      }).success,
    ).toBe(true);

    expect(
      contributionRequestSchema.safeParse({
        contributors: [
          {
            ...contributor,
            firstName: "",
            lastName: "李",
            email: "donor@goodrequest.sk",
          },
        ],
        value: 25,
      }).success,
    ).toBe(false);
  });

  it("accepts the donation limit and rejects values above it", () => {
    expect(
      contributionRequestSchema.safeParse({
        contributors: [contributor],
        value: 999_999,
      }).success,
    ).toBe(true);
    expect(
      contributionRequestSchema.safeParse({
        contributors: [contributor],
        value: 999_999.01,
      }).success,
    ).toBe(false);
    expect(
      contributionRequestSchema.safeParse({
        contributors: [contributor],
        value: 1_000_000,
      }).success,
    ).toBe(false);
  });

  it("rejects multiple contributors", () => {
    expect(
      contributionRequestSchema.safeParse({
        contributors: [contributor, contributor],
        value: 25,
      }).success,
    ).toBe(false);
  });

  it("rejects fractional shelter identifiers and sub-cent wire values", () => {
    expect(
      contributionRequestSchema.safeParse({
        contributors: [contributor],
        shelterID: 1.5,
        value: 25,
      }).success,
    ).toBe(false);
    expect(
      contributionRequestSchema.safeParse({
        contributors: [contributor],
        value: 0.001,
      }).success,
    ).toBe(false);
  });
});
