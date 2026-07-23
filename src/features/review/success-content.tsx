"use client";

import { useTranslation } from "react-i18next";

import { PrimaryActionLink } from "@/components/ui/primary-action-link";
import { useDonationFlow } from "@/features/donation-flow/context";
import { getAppLocale, getLocalizedPath } from "@/i18n/config";

import {
  Celebration,
  Content,
  PawLeft,
  PawRight,
  SuccessIcon,
} from "./success-content.styles";

export function SuccessContent() {
  const { dispatch } = useDonationFlow();
  const { i18n, t } = useTranslation();
  const locale = getAppLocale(i18n.resolvedLanguage);

  return (
    <Content data-ui="success-content">
      <h1>{t("success.title")}</h1>
      <p>{t("success.message")}</p>
      <Celebration aria-hidden="true" data-ui="success-celebration">
        <PawLeft />
        <SuccessIcon />
        <PawRight />
      </Celebration>
      <PrimaryActionLink
        href={getLocalizedPath(locale, "/")}
        onClick={() => dispatch({ type: "flowReset" })}
        prefetch={false}
      >
        {t("success.again")}
      </PrimaryActionLink>
    </Content>
  );
}
