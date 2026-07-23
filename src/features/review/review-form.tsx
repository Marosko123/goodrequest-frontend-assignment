"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";

import { Button } from "@/components/ui/button";
import { ChoiceControl } from "@/components/ui/choice-control";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { InlineAlert } from "@/components/ui/inline-alert";
import type { DonationSelection, DonorDetails } from "@/domain/donation";
import { formatCurrency } from "@/i18n/format";
import type { ContributionResponse } from "@/lib/api/contracts";

import { getSubmissionError, type SubmissionError } from "./submission";
import {
  Actions,
  Block,
  ConsentField,
  ConsentLabel,
  ErrorMessage,
  Form,
  Summary,
} from "./review-form.styles";

const submissionTranslationKeys = {
  offline: ["review.errors.offlineTitle", "review.errors.offlineMessage"],
  unknown: ["review.errors.unknownTitle", "review.errors.unknownMessage"],
  "rate-limit": [
    "review.errors.rateLimitTitle",
    "review.errors.rateLimitMessage",
  ],
  invalid: ["review.errors.invalidTitle", "review.errors.invalidMessage"],
  service: ["review.errors.serviceTitle", "review.errors.serviceMessage"],
} as const;

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
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en" : "sk";
  const reviewSchema = useMemo(
    () =>
      z.object({
        consent: z.boolean().refine((value) => value, {
          message: t("review.consentError"),
        }),
      }),
    [t],
  );
  type ReviewFormValues = z.input<typeof reviewSchema>;
  const submitLock = useRef(false);
  const [submissionError, setSubmissionError] =
    useState<SubmissionError | null>(null);
  const {
    formState: { errors, isSubmitted, isSubmitting },
    handleSubmit,
    register,
    trigger,
  } = useForm<ReviewFormValues>({
    defaultValues: { consent: false },
    resolver: zodResolver(reviewSchema),
    shouldFocusError: true,
  });

  async function submitForm() {
    if (submitLock.current) {
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setSubmissionError({ kind: "offline" });
      return;
    }

    submitLock.current = true;
    setSubmissionError(null);

    try {
      await submit();
      onSuccess();
    } catch (error) {
      setSubmissionError(getSubmissionError(error));
      submitLock.current = false;
    }
  }

  const donorName = [donor.firstName, donor.lastName].filter(Boolean).join(" ");
  const donorPhone = donor.phoneE164
    ? (parsePhoneNumberFromString(donor.phoneE164)?.formatInternational() ??
      donor.phoneE164)
    : null;
  const submitLabel =
    submissionError?.kind === "unknown"
      ? t("review.resend")
      : submissionError
        ? t("common.retry")
        : t("review.submit");
  const submissionMessage = submissionError
    ? submissionTranslationKeys[submissionError.kind]
    : null;

  useEffect(() => {
    if (isSubmitted) {
      void trigger();
    }
  }, [i18n.resolvedLanguage, isSubmitted, trigger]);

  return (
    <Form
      aria-label={t("review.formLabel")}
      noValidate
      onSubmit={(event) => {
        void handleSubmit(submitForm)(event);
      }}
    >
      <Block aria-labelledby="contribution-summary-title" data-primary>
        <h2 id="contribution-summary-title">{t("review.summary")}</h2>
        <Summary>
          <div>
            <dt>{t("review.helpType")}</dt>
            <dd>
              {selection.target === "foundation"
                ? t("review.foundationHelp")
                : t("review.shelterHelp")}
            </dd>
          </div>
          {selection.target === "shelter" ? (
            <div>
              <dt>{t("review.shelter")}</dt>
              <dd>{selection.shelter.name}</dd>
            </div>
          ) : null}
          <div>
            <dt>{t("review.amount")}</dt>
            <dd>{formatCurrency(selection.amountCents / 100, locale)}</dd>
          </div>
        </Summary>
      </Block>

      <Block aria-label={t("review.personalData")}>
        <Summary>
          <div>
            <dt>{t("review.fullName")}</dt>
            <dd>{donorName}</dd>
          </div>
          <div>
            <dt>{t("review.email")}</dt>
            <dd>{donor.email}</dd>
          </div>
          {donorPhone ? (
            <div>
              <dt>{t("review.phone")}</dt>
              <dd>{donorPhone}</dd>
            </div>
          ) : null}
        </Summary>
      </Block>

      <ConsentField>
        <ConsentLabel>
          <ChoiceControl
            {...register("consent")}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            aria-invalid={errors.consent ? "true" : undefined}
            size="sm"
            type="checkbox"
          />
          <span>{t("review.consent")}</span>
        </ConsentLabel>
        {errors.consent?.message ? (
          <ErrorMessage id="consent-error" role="alert">
            {errors.consent.message}
          </ErrorMessage>
        ) : null}
      </ConsentField>

      <div aria-live="polite">
        {submissionMessage ? (
          <InlineAlert title={t(submissionMessage[0])} tone="error">
            {t(submissionMessage[1])}
          </InlineAlert>
        ) : null}
      </div>

      <Actions>
        <Button
          disabled={isSubmitting}
          icon={<ArrowLeftIcon />}
          iconPosition="start"
          onClick={onBack}
          variant="secondary"
        >
          {t("common.back")}
        </Button>
        <Button loading={isSubmitting} type="submit">
          {submitLabel}
        </Button>
      </Actions>
    </Form>
  );
}
