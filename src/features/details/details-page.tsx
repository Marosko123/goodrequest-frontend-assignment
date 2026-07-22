"use client";

import { useRouter } from "next/navigation";

import type { DonorDetails } from "@/domain/donation";
import { useDonationFlow } from "@/features/donation-flow/context";
import { FlowGuard } from "@/features/donation-flow/flow-guard";

import { DetailsForm } from "./details-form";
import styles from "./details-page.module.scss";

export function DetailsPage() {
  const router = useRouter();
  const { state, dispatch } = useDonationFlow();

  function completeDetails(donor: DonorDetails) {
    dispatch({ type: "donorCommitted", payload: donor });
    router.push("/review");
  }

  return (
    <FlowGuard>
      <section>
        <h1 className={styles.title}>Potrebujeme od vás zopár informácií</h1>
        <DetailsForm
          {...(state.donor ? { initialValue: state.donor } : {})}
          onBack={() => router.push("/")}
          onComplete={completeDetails}
        />
      </section>
    </FlowGuard>
  );
}
