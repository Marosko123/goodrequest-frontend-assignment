import type { ZodMiniType } from "@/lib/validation/zod";

import type { DonationStats, Shelter } from "@/domain/donation";

import {
  contributionRequestSchema,
  contributionResponseSchema,
  resultsResponseSchema,
  sheltersResponseSchema,
  type ContributionRequest,
  type ContributionResponse,
} from "./contracts";
import { ApiError } from "./errors";

export { ApiError } from "./errors";

const defaultApiBaseUrl = "https://frontend-assignment-api.goodrequest.dev";
const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl
).replace(/\/$/, "");
const requestTimeoutMs = 10_000;
const maxJsonResponseBytes = 64 * 1024;

async function readJson(response: Response): Promise<unknown> {
  const declaredBytes = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredBytes) && declaredBytes > maxJsonResponseBytes) {
    throw new ApiError(
      "contract",
      "The API response exceeds the supported size.",
    );
  }

  if (!response.body) {
    return response.json();
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let json = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      receivedBytes += value.byteLength;
      if (receivedBytes > maxJsonResponseBytes) {
        await reader.cancel().catch(() => undefined);
        throw new ApiError(
          "contract",
          "The API response exceeds the supported size.",
        );
      }

      json += decoder.decode(value, { stream: true });
    }
    json += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  return JSON.parse(json);
}

async function requestJson<Schema extends ZodMiniType>(
  path: string,
  schema: Schema,
  init?: RequestInit,
): Promise<Schema["_zod"]["output"]> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        accept: "application/json",
        ...init?.headers,
      },
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
  } catch (error) {
    if (
      error instanceof DOMException &&
      ["AbortError", "TimeoutError"].includes(error.name)
    ) {
      throw new ApiError("timeout", "The API request timed out.");
    }
    throw new ApiError("network", "The API request could not be completed.");
  }

  if (!response.ok) {
    throw new ApiError(
      "http",
      `The API returned HTTP ${response.status}.`,
      response.status,
    );
  }

  let body: unknown;
  try {
    body = await readJson(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("contract", "The API returned invalid JSON.");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(
      "contract",
      "The API response does not match its contract.",
    );
  }

  return parsed.data;
}

export async function getShelters(): Promise<Shelter[]> {
  const response = await requestJson(
    "/api/v1/shelters/",
    sheltersResponseSchema,
  );
  return response.shelters;
}

export async function getResults(): Promise<DonationStats> {
  const response = await requestJson(
    "/api/v1/shelters/results",
    resultsResponseSchema,
  );
  const contributionCents = Math.round((response.contribution ?? 0) * 100);

  if (!Number.isSafeInteger(contributionCents)) {
    throw new ApiError(
      "contract",
      "The API contribution value is outside the supported range.",
    );
  }

  return {
    contributors: response.contributors,
    contributionCents,
  };
}

export async function submitContribution(
  request: ContributionRequest,
): Promise<ContributionResponse> {
  const validatedRequest = contributionRequestSchema.parse(request);

  return requestJson(
    "/api/v1/shelters/contribute",
    contributionResponseSchema,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validatedRequest),
    },
  );
}
