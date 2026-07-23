"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import type { DonorDetails } from "@/domain/donation";
import { useDonationFlow } from "@/features/donation-flow/context";
import { FlowGuard } from "@/features/donation-flow/flow-guard";
import type { DonorDraft } from "@/features/donation-flow/state";
import { getLocaleFromPathname, getLocalizedPath } from "@/i18n/config";
import { useDonationRoutePrefetch } from "@/lib/navigation/use-donation-route-prefetch";

import { DetailsForm } from "./details-form";
import { SectionTitle, Title } from "./details-page.styles";

export function DetailsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const locale = getLocaleFromPathname(pathname);
  const { state, dispatch } = useDonationFlow();
  const nextStepPrefetch = useDonationRoutePrefetch();

  function completeDetails(donor: DonorDetails) {
    dispatch({ type: "donorCommitted", payload: donor });
    router.push(getLocalizedPath(locale, "/review/"));
  }

  const updateDraft = useCallback(
    (draft: DonorDraft) =>
      dispatch({ type: "donorDraftChanged", payload: draft }),
    [dispatch],
  );

  return (
    <FlowGuard>
      <section>
        <Title>{t("details.title")}</Title>
        <SectionTitle>{t("details.sectionTitle")}</SectionTitle>
        <DetailsForm
          key={state.hydrated ? "hydrated" : "shell"}
          {...(state.donorDraft ? { initialDraft: state.donorDraft } : {})}
          {...(state.donor ? { initialValue: state.donor } : {})}
          onBack={() => router.push(getLocalizedPath(locale, "/"))}
          onComplete={completeDetails}
          onDraftChange={updateDraft}
          nextStepPrefetch={nextStepPrefetch}
        />
      </section>
    </FlowGuard>
  );
}
