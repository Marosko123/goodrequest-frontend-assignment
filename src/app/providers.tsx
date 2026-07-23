"use client";

import type { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SkipLink } from "@/components/layout/skip-link";
import { AppI18nProvider } from "@/i18n/provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppI18nProvider>
      {/* First in DOM order so it is the first stop of a keyboard tab sequence. */}
      <SkipLink />
      <LanguageSwitcher />
      {children}
    </AppI18nProvider>
  );
}
