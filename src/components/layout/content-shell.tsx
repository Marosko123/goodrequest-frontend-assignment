"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ArrowLeftIcon } from "@/components/ui/icons";
import { getLocaleFromPathname, getLocalizedPath } from "@/i18n/config";

import { AppFooter } from "./app-footer";
import { BackLink, Header, Main, Shell } from "./content-shell.styles";
import { mainContentId } from "./skip-link";

export function ContentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const locale = getLocaleFromPathname(pathname);

  return (
    <Shell>
      <Header>
        <BackLink href={getLocalizedPath(locale, "/")}>
          <ArrowLeftIcon />
          {t("common.back")}
        </BackLink>
      </Header>
      <Main id={mainContentId} tabIndex={-1}>
        {children}
      </Main>
      <AppFooter />
    </Shell>
  );
}
