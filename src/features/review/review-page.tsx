"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { QueryProvider } from "@/app/query-provider";
import { useDonationFlow } from "@/features/donation-flow/context";
import { FlowGuard } from "@/features/donation-flow/flow-guard";
import {
  contributionMutationOptions,
  sheltersQueryOptions,
} from "@/lib/api/queries";
import { getLocaleFromPathname, getLocalizedPath } from "@/i18n/config";
import { useDonationRoutePrefetch } from "@/lib/navigation/use-donation-route-prefetch";

import { ReviewForm } from "./review-form";
import { Title } from "./review-page.styles";
import { submitValidatedContribution } from "./submit-contribution";

function ReviewPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const locale = getLocaleFromPathname(pathname);
  const queryClient = useQueryClient();
  const { dispatch, state } = useDonationFlow();
  const mutation = useMutation(contributionMutationOptions(queryClient));
  const nextStepPrefetch = useDonationRoutePrefetch();

  return (
    <FlowGuard>
      {state.selection && state.donor ? (
        <section {...nextStepPrefetch}>
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
              submitValidatedContribution({
                selection: state.selection!,
                donor: state.donor!,
                loadShelters: () =>
                  queryClient.fetchQuery({
                    ...sheltersQueryOptions(),
                    staleTime: 0,
                  }),
                submit: (request) => mutation.mutateAsync(request),
              })
            }
          />
        </section>
      ) : null}
    </FlowGuard>
  );
}

export function ReviewPage() {
  return (
    <QueryProvider>
      <ReviewPageContent />
    </QueryProvider>
  );
}
