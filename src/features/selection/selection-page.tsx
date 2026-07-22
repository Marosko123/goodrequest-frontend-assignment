"use client";

import { useRouter } from "next/navigation";

import type { DonationSelection } from "@/domain/donation";
import { useDonationFlow } from "@/features/donation-flow/context";

import { SelectionForm } from "./selection-form";
import styles from "./selection-page.module.scss";

export function SelectionPage() {
  const router = useRouter();
  const { state, dispatch } = useDonationFlow();

  function completeSelection(selection: DonationSelection) {
    dispatch({ type: "selectionCommitted", payload: selection });
    router.push("/details");
  }

  return (
    <section>
      <h1 className={styles.title}>Vyberte si možnosť, ako chcete pomôcť</h1>
      <SelectionForm
        {...(state.selection ? { initialValue: state.selection } : {})}
        onComplete={completeSelection}
      />
    </section>
  );
}
