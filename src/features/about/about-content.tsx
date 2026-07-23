"use client";

import { useTranslation } from "react-i18next";

import { ResultsStats } from "./results-stats";
import { Page, StatsSection } from "./about-content.styles";

export function AboutContent() {
  const { t } = useTranslation();

  return (
    <Page>
      <h1>{t("about.title")}</h1>
      <p>{t("about.intro")}</p>

      <StatsSection aria-label={t("about.results")}>
        <ResultsStats />
      </StatsSection>

      <p>{t("about.outro")}</p>
    </Page>
  );
}
