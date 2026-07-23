import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/test/server";

import { ApiError } from "./client";
import type { ContributionRequest } from "./contracts";
import {
  contributionMutationOptions,
  queryKeys,
  resultsQueryOptions,
  shouldRetryRead,
} from "./queries";

const contributionUrl =
  "https://frontend-assignment-api.goodrequest.dev/api/v1/shelters/contribute";
const contributionRequest: ContributionRequest = {
  contributors: [
    {
      firstName: "Jana",
      lastName: "Nováková",
      email: "jana@example.sk",
      phone: "+421901234567",
    },
  ],
  value: 25,
};

function createContributionObserver(queryClient: QueryClient) {
  return new MutationObserver(
    queryClient,
    contributionMutationOptions(queryClient),
  );
}

function seedResults(queryClient: QueryClient) {
  queryClient.setQueryData(queryKeys.results, {
    contributors: 8,
    contributionCents: 7_500,
  });
}

describe("shouldRetryRead", () => {
  it("retries one network or server failure", () => {
    expect(
      shouldRetryRead(0, new ApiError("network", "Network unavailable")),
    ).toBe(true);
    expect(
      shouldRetryRead(0, new ApiError("http", "Service unavailable", 503)),
    ).toBe(true);
  });

  it("does not retry validation, client errors or a second failure", () => {
    expect(
      shouldRetryRead(0, new ApiError("contract", "Invalid response")),
    ).toBe(false);
    expect(shouldRetryRead(0, new ApiError("http", "Bad request", 400))).toBe(
      false,
    );
    expect(
      shouldRetryRead(1, new ApiError("network", "Network unavailable")),
    ).toBe(false);
  });
});

describe("results refresh policy", () => {
  it("polls once a minute only while the results view is active", () => {
    expect(resultsQueryOptions()).toMatchObject({
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchInterval: 60_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    });
  });
});

describe("contribution mutation", () => {
  it("invalidates results after the API explicitly accepts a contribution", async () => {
    server.use(
      http.post(contributionUrl, () =>
        HttpResponse.json({
          messages: [{ message: "Príspevok prijatý", type: "SUCCESS" }],
        }),
      ),
    );
    const queryClient = new QueryClient();
    seedResults(queryClient);

    await createContributionObserver(queryClient).mutate(contributionRequest);

    expect(queryClient.getQueryState(queryKeys.results)?.isInvalidated).toBe(
      true,
    );
  });

  it("rejects a business error and keeps cached results valid", async () => {
    server.use(
      http.post(contributionUrl, () =>
        HttpResponse.json({
          messages: [{ message: "Údaje boli odmietnuté", type: "ERROR" }],
        }),
      ),
    );
    const queryClient = new QueryClient();
    seedResults(queryClient);

    await expect(
      createContributionObserver(queryClient).mutate(contributionRequest),
    ).rejects.toThrow("Údaje boli odmietnuté");
    expect(queryClient.getQueryState(queryKeys.results)?.isInvalidated).toBe(
      false,
    );
  });

  it("rejects an informational response without an explicit success", async () => {
    server.use(
      http.post(contributionUrl, () =>
        HttpResponse.json({
          messages: [{ message: "Požiadavka sa spracúva", type: "INFO" }],
        }),
      ),
    );
    const queryClient = new QueryClient();
    seedResults(queryClient);

    await expect(
      createContributionObserver(queryClient).mutate(contributionRequest),
    ).rejects.toThrow("API nepotvrdilo úspešné prijatie príspevku");
    expect(queryClient.getQueryState(queryKeys.results)?.isInvalidated).toBe(
      false,
    );
  });

  it("keeps cached results valid when the contribution request fails", async () => {
    server.use(http.post(contributionUrl, () => HttpResponse.error()));
    const queryClient = new QueryClient();
    seedResults(queryClient);

    await expect(
      createContributionObserver(queryClient).mutate(contributionRequest),
    ).rejects.toMatchObject({ kind: "network" });
    expect(queryClient.getQueryState(queryKeys.results)?.isInvalidated).toBe(
      false,
    );
  });
});
