"use client";

import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

import { DonationFlowProvider } from "@/features/donation-flow/context";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <MantineProvider defaultColorScheme="light">
      <QueryClientProvider client={queryClient}>
        <DonationFlowProvider>{children}</DonationFlowProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
