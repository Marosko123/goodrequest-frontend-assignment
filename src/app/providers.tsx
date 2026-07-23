"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { DonationFlowProvider } from "@/features/donation-flow/context";
import { AppI18nProvider } from "@/i18n/provider";

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
    <AppI18nProvider>
      <LanguageSwitcher />
      <QueryClientProvider client={queryClient}>
        <DonationFlowProvider>{children}</DonationFlowProvider>
      </QueryClientProvider>
    </AppI18nProvider>
  );
}
