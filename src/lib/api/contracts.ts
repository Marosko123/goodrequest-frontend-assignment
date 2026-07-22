import { z } from "zod";

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

type AssertAssignable<Contract, Value extends Contract> = Value;

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
  });

export const resultsResponseSchema = z
  .object({
    contributors: z.number().int().nonnegative(),
    contribution: z.number().finite().nonnegative().nullable(),
  })
  .strict();

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
  .strict();

export const contributionRequestSchema = z
  .object({
    contributors: z
      .array(
        z
          .object({
            firstName: z.string(),
            lastName: z.string().min(1),
            email: z.email(),
            phone: z.string().optional(),
          })
          .strict(),
      )
      .min(1),
    shelterID: z.number().positive().optional(),
    value: z.number().finite().positive(),
  })
  .strict();

export type SheltersResponse = AssertAssignable<
  JsonResponse<"/api/v1/shelters/", "get">,
  z.output<typeof sheltersResponseSchema>
>;
export type ResultsResponse = AssertAssignable<
  JsonResponse<"/api/v1/shelters/results", "get">,
  z.output<typeof resultsResponseSchema>
>;
export type ContributionRequest = GeneratedContributionRequest;
export type ContributionResponse = AssertAssignable<
  JsonResponse<"/api/v1/shelters/contribute", "post">,
  z.output<typeof contributionResponseSchema>
>;
