"use client";

import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { resultsQueryOptions } from "@/lib/api/queries";

import styles from "./results-stats.module.scss";

const currencyFormatter = new Intl.NumberFormat("sk-SK", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const numberFormatter = new Intl.NumberFormat("sk-SK");

export function ResultsStats() {
  const results = useQuery(resultsQueryOptions());

  if (results.isPending) {
    return (
      <div
        aria-label="Načítavam štatistiky"
        className={styles.grid}
        role="status"
      >
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (results.isError) {
    return (
      <InlineAlert
        action={
          <Button onClick={() => void results.refetch()} variant="secondary">
            Skúsiť znova
          </Button>
        }
        title="Štatistiky sa nepodarilo načítať"
        tone="error"
      >
        Aktuálne hodnoty nie sú dostupné. Namiesto nich nezobrazujeme neaktuálne
        údaje.
      </InlineAlert>
    );
  }

  return (
    <dl className={styles.grid}>
      <div>
        <dd>
          {currencyFormatter.format(results.data.contributionCents / 100)}
        </dd>
        <dt>Celková vyzbieraná hodnota</dt>
      </div>
      <div>
        <dd>{numberFormatter.format(results.data.contributors)}</dd>
        <dt>Počet darcov</dt>
      </div>
    </dl>
  );
}
