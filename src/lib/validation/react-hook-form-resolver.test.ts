import type { ResolverOptions } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { z } from "./zod";
import { createZodMiniResolver } from "./react-hook-form-resolver";

type FormValues = { profile: { email: string } };

function resolverOptions(
  criteriaMode: ResolverOptions<FormValues>["criteriaMode"] = "firstError",
): ResolverOptions<FormValues> {
  return {
    criteriaMode,
    fields: {},
    shouldUseNativeValidation: false,
  };
}

describe("createZodMiniResolver", () => {
  it("returns Zod Mini transformed values after asynchronous validation", async () => {
    const schema = z.pipe(
      z.strictObject({ email: z.string() }),
      z.transform(({ email }) => ({ email: email.trim().toLowerCase() })),
    );
    const resolver = createZodMiniResolver<
      { email: string },
      { email: string }
    >(schema);

    await expect(
      resolver({ email: " DONOR@GOODREQUEST.SK " }, undefined, {
        criteriaMode: "firstError",
        fields: {},
        shouldUseNativeValidation: false,
      }),
    ).resolves.toEqual({
      errors: {},
      values: { email: "donor@goodrequest.sk" },
    });
  });

  it("nests custom issues and retains every criterion when requested", async () => {
    const schema = z
      .strictObject({
        profile: z.strictObject({
          email: z
            .string()
            .check(z.minLength(1, "Email is required."))
            .check(z.regex(/@/u, "Email must include @.")),
        }),
      })
      .check(
        z.superRefine((_, context) => {
          context.addIssue({
            code: "custom",
            message: "Email is unavailable.",
            path: ["profile", "email"],
          });
        }),
      );
    const resolver = createZodMiniResolver<FormValues, FormValues>(schema);

    const result = await resolver(
      { profile: { email: "" } },
      undefined,
      resolverOptions("all"),
    );

    expect(result).toEqual({
      values: {},
      errors: {
        profile: {
          email: {
            message: "Email is required.",
            type: "too_small",
            types: {
              custom: "Email is unavailable.",
              invalid_format: "Email must include @.",
              too_small: "Email is required.",
            },
          },
        },
      },
    });
  });
});
