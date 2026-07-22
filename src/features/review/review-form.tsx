"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import type { DonationSelection, DonorDetails } from "@/domain/donation";
import type { ContributionResponse } from "@/lib/api/contracts";

import {
  assertContributionAccepted,
  getSubmissionError,
  type SubmissionError,
} from "./submission";
import styles from "./review-form.module.scss";

const reviewSchema = z.object({
  consent: z.boolean().refine((value) => value, {
    message: "Na odoslanie príspevku je potrebný váš súhlas.",
  }),
});

type ReviewFormValues = z.input<typeof reviewSchema>;

const currencyFormatter = new Intl.NumberFormat("sk-SK", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

export function ReviewForm({
  donor,
  onBack,
  onEditDetails,
  onEditSelection,
  onSuccess,
  selection,
  submit,
}: {
  donor: DonorDetails;
  onBack: () => void;
  onEditDetails: () => void;
  onEditSelection: () => void;
  onSuccess: () => void;
  selection: DonationSelection;
  submit: () => Promise<ContributionResponse>;
}) {
  const submitLock = useRef(false);
  const [submissionError, setSubmissionError] =
    useState<SubmissionError | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ReviewFormValues>({
    defaultValues: { consent: false },
    resolver: zodResolver(reviewSchema),
    shouldFocusError: true,
  });

  async function submitForm() {
    if (submitLock.current) {
      return;
    }

    submitLock.current = true;
    setSubmissionError(null);

    try {
      const response = await submit();
      assertContributionAccepted(response);
      onSuccess();
    } catch (error) {
      const isOnline =
        typeof navigator === "undefined" ? true : navigator.onLine;
      setSubmissionError(getSubmissionError(error, isOnline));
      submitLock.current = false;
    }
  }

  const donorName = [donor.firstName, donor.lastName].filter(Boolean).join(" ");
  const submitLabel = submissionError ? "Skúsiť znova" : "Odoslať príspevok";

  return (
    <form
      aria-label="Potvrdenie príspevku"
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        void handleSubmit(submitForm)(event);
      }}
    >
      <section
        aria-labelledby="contribution-summary-title"
        className={styles.card}
      >
        <div className={styles.cardHeading}>
          <h2 id="contribution-summary-title">Príspevok</h2>
          <button
            className={styles.editButton}
            onClick={onEditSelection}
            type="button"
          >
            Upraviť
          </button>
        </div>
        <dl className={styles.summary}>
          <div>
            <dt>Komu pomáhate</dt>
            <dd>
              {selection.target === "foundation"
                ? "Celá nadácia GoodBoy"
                : selection.shelter.name}
            </dd>
          </div>
          <div>
            <dt>Suma</dt>
            <dd>{currencyFormatter.format(selection.amountCents / 100)}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="donor-summary-title" className={styles.card}>
        <div className={styles.cardHeading}>
          <h2 id="donor-summary-title">Vaše údaje</h2>
          <button
            className={styles.editButton}
            onClick={onEditDetails}
            type="button"
          >
            Upraviť
          </button>
        </div>
        <dl className={styles.summary}>
          <div>
            <dt>Meno</dt>
            <dd>{donorName}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{donor.email}</dd>
          </div>
          {donor.phoneE164 ? (
            <div>
              <dt>Telefón</dt>
              <dd>{donor.phoneE164}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <div className={styles.consentField}>
        <label className={styles.consentLabel}>
          <input
            {...register("consent")}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            aria-invalid={errors.consent ? "true" : undefined}
            className={styles.checkbox}
            type="checkbox"
          />
          <span>
            Súhlasím so spracovaním osobných údajov na účely evidencie
            príspevku.
          </span>
        </label>
        {errors.consent?.message ? (
          <p className={styles.error} id="consent-error" role="alert">
            {errors.consent.message}
          </p>
        ) : null}
      </div>

      <div aria-live="polite">
        {submissionError ? (
          <InlineAlert title={submissionError.title} tone="error">
            {submissionError.message}
          </InlineAlert>
        ) : null}
      </div>

      <div className={styles.actions}>
        <Button disabled={isSubmitting} onClick={onBack} variant="secondary">
          Späť
        </Button>
        <Button loading={isSubmitting} type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
