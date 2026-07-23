"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { formatCurrency, formatNumber } from "@/i18n/format";
import { resultsQueryOptions } from "@/lib/api/queries";

import {
  Content,
  LoadingGrid,
  Skeleton,
  StatsGrid,
} from "./results-stats.styles";

export function ResultsStats() {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en" : "sk";
  const results = useQuery(resultsQueryOptions());

  if (results.isPending) {
    return (
      <LoadingGrid aria-label={t("stats.loading")} role="status">
        <Skeleton />
        <Skeleton />
      </LoadingGrid>
    );
  }

  if (!results.data) {
    return (
      <InlineAlert
        action={
          <Button onClick={() => void results.refetch()} variant="secondary">
            {t("common.retry")}
          </Button>
        }
        title={t("stats.loadTitle")}
        tone="error"
      >
        {t("stats.loadMessage")}
      </InlineAlert>
    );
  }

  return (
    <Content>
      <StatsGrid>
        <div>
          <dd>
            {formatCurrency(results.data.contributionCents / 100, locale)}
          </dd>
          <dt>{t("stats.contribution")}</dt>
        </div>
        <div>
          <dd>{formatNumber(results.data.contributors, locale)}</dd>
          <dt>{t("stats.contributors")}</dt>
        </div>
      </StatsGrid>
      {results.isRefetchError ? (
        <InlineAlert
          action={
            <Button onClick={() => void results.refetch()} variant="secondary">
              {t("common.retry")}
            </Button>
          }
          title={t("stats.refreshTitle")}
          tone="warning"
        >
          {t("stats.refreshMessage")}
        </InlineAlert>
      ) : null}
    </Content>
  );
}
