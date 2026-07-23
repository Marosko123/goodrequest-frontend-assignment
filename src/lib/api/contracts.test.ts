import { describe, expect, it } from "vitest";

import { contributionRequestSchema } from "./contracts";

const contributor = {
  firstName: "Jana",
  lastName: "Nováková",
  email: "Jana@example.sk",
  phone: "+421901234567",
};

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
  ])("rejects a contributor without a supported normalized phone", (value) => {
    expect(
      contributionRequestSchema.safeParse({ contributors: [value], value: 25 })
        .success,
    ).toBe(false);
  });

  it("rejects multiple contributors and values above the donation limit", () => {
    expect(
      contributionRequestSchema.safeParse({
        contributors: [contributor, contributor],
        value: 25,
      }).success,
    ).toBe(false);
    expect(
      contributionRequestSchema.safeParse({
        contributors: [contributor],
        value: 1_000_000.01,
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
