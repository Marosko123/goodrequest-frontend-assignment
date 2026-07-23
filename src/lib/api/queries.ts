import {
  mutationOptions,
  type QueryClient,
  queryOptions,
} from "@tanstack/react-query";

import {
  ApiError,
  getResults,
  getShelters,
  submitContribution,
} from "./client";
import type { ContributionRequest } from "./contracts";
import { assertContributionAccepted } from "./outcome";

export const queryKeys = {
  shelters: ["shelters"] as const,
  results: ["results"] as const,
};

export function shouldRetryRead(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1 || !(error instanceof ApiError)) {
    return false;
  }

  if (error.kind === "network" || error.kind === "timeout") {
    return true;
  }

  return (
    error.kind === "http" && error.status !== undefined && error.status >= 500
  );
}

export const sheltersQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.shelters,
    queryFn: getShelters,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: shouldRetryRead,
  });

export const resultsQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.results,
    queryFn: getResults,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: shouldRetryRead,
  });

export const contributionMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: async (request: ContributionRequest) => {
      const response = await submitContribution(request);
      assertContributionAccepted(response);
      return response;
    },
    gcTime: 0,
    networkMode: "always",
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.results }),
    retry: 0,
  });
