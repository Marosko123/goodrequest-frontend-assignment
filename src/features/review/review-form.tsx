"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { ChoiceControl } from "@/components/ui/choice-control";
import { ArrowLeftIcon } from "@/components/ui/icons";
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
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatPhone(phone: string | null): string | null {
  if (!phone) {
    return null;
  }

  return parsePhoneNumberFromString(phone)?.formatInternational() ?? phone;
}

export function ReviewForm({
  donor,
  onBack,
  onSuccess,
  selection,
  submit,
}: {
  donor: DonorDetails;
  onBack: () => void;
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
  const formattedPhone = formatPhone(donor.phoneE164);
  const submitLabel = submissionError ? "Skúsiť znova" : "Odoslať formulár";

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
        className={styles.block}
      >
        <h2 id="contribution-summary-title">Zhrnutie</h2>
        <dl className={styles.summary}>
          <div>
            <dt>Forma pomoci</dt>
            <dd>
              {selection.target === "foundation"
                ? "Finančný príspevok celej nadácii"
                : "Finančný príspevok konkrétnemu útulku"}
            </dd>
          </div>
          {selection.target === "shelter" ? (
            <div>
              <dt>Útulok</dt>
              <dd>{selection.shelter.name}</dd>
            </div>
          ) : null}
          <div>
            <dt>Suma príspevku</dt>
            <dd>{currencyFormatter.format(selection.amountCents / 100)}</dd>
          </div>
        </dl>
      </section>

      <section aria-label="Vaše údaje" className={styles.block}>
        <dl className={styles.summary}>
          <div>
            <dt>Meno a priezvisko</dt>
            <dd>{donorName}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{donor.email}</dd>
          </div>
          {formattedPhone ? (
            <div>
              <dt>Telefónne číslo</dt>
              <dd>{formattedPhone}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <div className={styles.consentField}>
        <label className={styles.consentLabel}>
          <ChoiceControl
            {...register("consent")}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            aria-invalid={errors.consent ? "true" : undefined}
            size="sm"
            type="checkbox"
          />
          <span>Súhlasím so spracovaním mojich osobných údajov</span>
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
        <Button
          disabled={isSubmitting}
          icon={<ArrowLeftIcon />}
          iconPosition="start"
          onClick={onBack}
          variant="secondary"
        >
          Späť
        </Button>
        <Button loading={isSubmitting} type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
