import { z } from "zod";

import { MAX_DONATION_CENTS } from "@/domain/donation";

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

const shelterSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string().trim().min(1),
  })
  .strict();

export const sheltersResponseSchema = z
  .object({
    shelters: z.array(shelterSchema).optional().default([]),
  })
  .strict()
  .superRefine(({ shelters }, context) => {
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
  }) satisfies z.ZodType<GeneratedSheltersResponse>;

export const resultsResponseSchema = z
  .object({
    contributors: z.number().int().nonnegative(),
    contribution: z.number().finite().nonnegative().nullable(),
  })
  .strict() satisfies z.ZodType<GeneratedResultsResponse>;

const contributionMessageSchema = z
  .object({
    message: z.string().min(1),
    type: z.enum(["ERROR", "WARNING", "INFO", "SUCCESS"]),
  })
  .strict();

export const contributionResponseSchema = z
  .object({
    messages: z.array(contributionMessageSchema),
  })
  .strict() satisfies z.ZodType<ContributionResponse>;

export const contributionRequestSchema = z
  .object({
    contributors: z
      .array(
        z
          .object({
            firstName: z.string(),
            lastName: z.string().min(1),
            email: z.email(),
            phone: z.string().regex(/^\+(?:420|421)\d{9}$/u),
          })
          .strict(),
      )
      .length(1),
    shelterID: z.number().int().positive().optional(),
    value: z
      .number()
      .finite()
      .positive()
      .multipleOf(0.01)
      .max(MAX_DONATION_CENTS / 100),
  })
  .strict();
