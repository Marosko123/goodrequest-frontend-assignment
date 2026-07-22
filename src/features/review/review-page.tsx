"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useDonationFlow } from "@/features/donation-flow/context";
import { FlowGuard } from "@/features/donation-flow/flow-guard";
import { mapContributionRequest } from "@/lib/api/mappers";
import { contributionMutationOptions } from "@/lib/api/queries";

import { ReviewForm } from "./review-form";
import styles from "./review-page.module.scss";

export function ReviewPage() {
  const router = useRouter();
  const { state } = useDonationFlow();
  const mutation = useMutation(contributionMutationOptions());

  return (
    <FlowGuard>
      {state.selection && state.donor ? (
        <section>
          <h1 className={styles.title}>Skontrolujte si zadané údaje</h1>
          <ReviewForm
            donor={state.donor}
            onBack={() => router.push("/details")}
            onSuccess={() => router.replace("/success")}
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
