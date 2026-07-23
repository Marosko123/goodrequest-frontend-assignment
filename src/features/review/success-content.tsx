"use client";

import { useTranslation } from "react-i18next";

import { useDonationFlow } from "@/features/donation-flow/context";
import { getLocalizedPath } from "@/i18n/config";

import {
  AgainLink,
  Celebration,
  Content,
  PawLeft,
  PawRight,
  SuccessIcon,
} from "./success-content.styles";

export function SuccessContent() {
  const { dispatch } = useDonationFlow();
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en" : "sk";

  return (
    <Content>
      <Celebration aria-hidden="true">
        <PawLeft />
        <SuccessIcon />
        <PawRight />
      </Celebration>
      <h1>{t("success.title")}</h1>
      <p>{t("success.message")}</p>
      <AgainLink
        href={getLocalizedPath(locale, "/")}
        onClick={() => dispatch({ type: "flowReset" })}
        prefetch={false}
      >
        {t("success.again")}
      </AgainLink>
    </Content>
  );
}
