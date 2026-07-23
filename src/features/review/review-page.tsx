"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useDonationFlow } from "@/features/donation-flow/context";
import { FlowGuard } from "@/features/donation-flow/flow-guard";
import { mapContributionRequest } from "@/lib/api/mappers";
import { contributionMutationOptions } from "@/lib/api/queries";
import { getLocaleFromPathname, getLocalizedPath } from "@/i18n/config";

import { ReviewForm } from "./review-form";
import { Title } from "./review-page.styles";

export function ReviewPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const locale = getLocaleFromPathname(pathname);
  const queryClient = useQueryClient();
  const { dispatch, state } = useDonationFlow();
  const mutation = useMutation(contributionMutationOptions(queryClient));

  return (
    <FlowGuard>
      {state.selection && state.donor ? (
        <section>
          <Title>{t("review.title")}</Title>
          <ReviewForm
            donor={state.donor}
            onBack={() => router.push(getLocalizedPath(locale, "/details/"))}
            onSuccess={() => {
              dispatch({ type: "submissionAccepted" });
              router.replace(getLocalizedPath(locale, "/success/"));
            }}
            selection={state.selection}
            submit={() =>
              mutation.mutateAsync(
                mapContributionRequest(state.selection!, state.donor!),
              )
            }
          />
        </section>
      ) : null}
    </FlowGuard>
  );
}
