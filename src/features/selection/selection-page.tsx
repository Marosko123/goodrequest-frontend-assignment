"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import type { DonationSelection } from "@/domain/donation";
import { useDonationFlow } from "@/features/donation-flow/context";
import type { SelectionDraft } from "@/features/donation-flow/state";
import { getLocaleFromPathname, getLocalizedPath } from "@/i18n/config";
import { useDonationRoutePrefetch } from "@/lib/navigation/use-donation-route-prefetch";

import { SelectionForm } from "./selection-form";
import { Title } from "./selection-page.styles";

export function SelectionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const locale = getLocaleFromPathname(pathname);
  const { state, dispatch } = useDonationFlow();
  const nextStepPrefetch = useDonationRoutePrefetch();

  function completeSelection(selection: DonationSelection) {
    dispatch({ type: "selectionCommitted", payload: selection });
    router.push(getLocalizedPath(locale, "/details/"));
  }

  const updateDraft = useCallback(
    (draft: SelectionDraft) =>
      dispatch({ type: "selectionDraftChanged", payload: draft }),
    [dispatch],
  );

  return (
    <section data-flow-hydrated={state.hydrated ? "true" : "false"}>
      <Title>{t("selection.title")}</Title>
      <SelectionForm
        key={state.hydrated ? "hydrated" : "shell"}
        {...(state.selectionDraft
          ? { initialDraft: state.selectionDraft }
          : {})}
        {...(state.selection ? { initialValue: state.selection } : {})}
        onDraftChange={updateDraft}
        onComplete={completeSelection}
        nextStepPrefetch={nextStepPrefetch}
      />
    </section>
  );
}
