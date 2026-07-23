import { MAX_DONATION_CENTS } from "@/domain/donation";
import {
  createEmailSchema,
  createPersonNameSchema,
  personNameLimits,
} from "@/lib/validation/personal-details";
import { type ZodMiniType, z } from "@/lib/validation/zod";

import type { paths } from "./generated";

type JsonResponse<
  Path extends keyof paths,
  Method extends keyof paths[Path],
> = paths[Path][Method] extends {
  responses: { 200: { content: { "application/json": infer Response } } };
}
  ? Response
  : never;

type GeneratedContributionRequest = NonNullable<
  paths["/api/v1/shelters/contribute"]["post"]["requestBody"]
>["content"]["application/json"];

type GeneratedSheltersResponse = JsonResponse<"/api/v1/shelters/", "get">;
type GeneratedResultsResponse = JsonResponse<"/api/v1/shelters/results", "get">;

export type ContributionRequest = GeneratedContributionRequest;
export type ContributionResponse = JsonResponse<
  "/api/v1/shelters/contribute",
  "post"
>;

const shelterSchema = z.strictObject({
  id: z.number().check(z.int()).check(z.positive()),
  name: z.string().check(z.trim()).check(z.minLength(1)),
});

export const sheltersResponseSchema = z
  .strictObject({
    shelters: z._default(z.optional(z.array(shelterSchema)), []),
  })
  .check(
    z.superRefine(({ shelters }, context) => {
      const ids = new Set<number>();
      for (const shelter of shelters) {
        if (ids.has(shelter.id)) {
          context.addIssue({
            code: "custom",
            message: `Duplicate shelter ID: ${shelter.id}`,
            path: ["shelters"],
          });
        }
        ids.add(shelter.id);
      }
    }),
  ) satisfies ZodMiniType<GeneratedSheltersResponse>;

export const resultsResponseSchema = z.strictObject({
  contributors: z.number().check(z.int()).check(z.nonnegative()),
  contribution: z.nullable(z.number().check(z.nonnegative())),
}) satisfies ZodMiniType<GeneratedResultsResponse>;

const contributionMessageSchema = z.strictObject({
  message: z.string().check(z.minLength(1)),
  type: z.enum(["ERROR", "WARNING", "INFO", "SUCCESS"]),
});

export const contributionResponseSchema = z.strictObject({
  messages: z.array(contributionMessageSchema),
}) satisfies ZodMiniType<ContributionResponse>;

export const contributionRequestSchema = z.strictObject({
  contributors: z
    .array(
      z.strictObject({
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
        phone: z.string().check(z.regex(/^\+(?:420|421)\d{9}$/u)),
      }),
    )
    .check(z.length(1)),
  shelterID: z.optional(z.number().check(z.int()).check(z.positive())),
  value: z
    .number()
    .check(z.positive())
    .check(z.multipleOf(0.01))
    .check(z.maximum(MAX_DONATION_CENTS / 100)),
});
