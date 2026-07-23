"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useLazyZodResolver } from "@/lib/validation/use-lazy-zod-resolver";

import { Button } from "@/components/ui/button";
import { ChoiceControl } from "@/components/ui/choice-control";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { InlineAlert } from "@/components/ui/inline-alert";
import { useDonationStepStatus } from "@/components/layout/donation-progress-context";
import {
  formatPhoneForDisplay,
  type DonationSelection,
  type DonorDetails,
} from "@/domain/donation";
import { getAppLocale } from "@/i18n/config";
import { formatCurrency } from "@/i18n/format";
import type { ContributionResponse } from "@/lib/api/contracts";

import {
  getSubmissionStateFromError,
  type SubmissionState,
} from "./submission";
import type { ReviewFormValues } from "./schema";
import {
  Actions,
  Block,
  ConsentField,
  ConsentLabel,
  ErrorMessage,
  Form,
  SubmissionFeedback,
  Summary,
} from "./review-form.styles";

const submissionFeedbackByState = {
  submitting: {
    title: "review.status.submittingTitle",
    message: "review.status.submittingMessage",
    tone: "info",
  },
  offline: {
    title: "review.errors.offlineTitle",
    message: "review.errors.offlineMessage",
    tone: "warning",
  },
  "connection-restored": {
    title: "review.status.restoredTitle",
    message: "review.status.restoredMessage",
    tone: "success",
  },
  "unknown-outcome": {
    title: "review.errors.unknownTitle",
    message: "review.errors.unknownMessage",
    tone: "warning",
  },
  "rate-limited": {
    title: "review.errors.rateLimitTitle",
    message: "review.errors.rateLimitMessage",
    tone: "warning",
  },
  invalid: {
    title: "review.errors.invalidTitle",
    message: "review.errors.invalidMessage",
    tone: "error",
  },
  "service-unavailable": {
    title: "review.errors.serviceTitle",
    message: "review.errors.serviceMessage",
    tone: "error",
  },
} as const;

type ConnectionStatus = "online" | "offline" | "restored";
type FeedbackState = Exclude<SubmissionState, "idle">;

const blockingFeedbackStates: ReadonlySet<FeedbackState> = new Set([
  "offline",
  "unknown-outcome",
  "rate-limited",
  "invalid",
  "service-unavailable",
]);

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
  const locale = getAppLocale(i18n.resolvedLanguage);
  const resolver = useLazyZodResolver<ReviewFormValues>(async () =>
    (await import("./schema")).createReviewSchema(t),
  );
  const submitLock = useRef(false);
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("online");
  const {
    formState: { errors, isSubmitted },
    handleSubmit,
    register,
    trigger,
  } = useForm<ReviewFormValues>({
    defaultValues: { consent: false },
    resolver,
    shouldFocusError: true,
  });

  async function submitForm() {
    if (submitLock.current) {
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setSubmissionState("idle");
      setConnectionStatus("offline");
      return;
    }

    submitLock.current = true;
    setSubmissionState("submitting");

    try {
      await submit();
      onSuccess();
    } catch (error) {
      setSubmissionState(getSubmissionStateFromError(error));
      submitLock.current = false;
    }
  }

  const submissionPending = submissionState === "submitting";
  const feedbackState: FeedbackState | null =
    submissionState !== "idle"
      ? submissionState
      : connectionStatus === "offline"
        ? "offline"
        : connectionStatus === "restored"
          ? "connection-restored"
          : null;
  const feedback = feedbackState
    ? submissionFeedbackByState[feedbackState]
    : null;
  const submissionBlockedByOffline =
    submissionState === "idle" && connectionStatus === "offline";
  const donorName = [donor.firstName, donor.lastName].filter(Boolean).join(" ");
  const donorPhone = donor.phoneE164
    ? formatPhoneForDisplay(donor.phoneE164)
    : null;
  const submitLabel =
    submissionState === "unknown-outcome"
      ? t("review.resend")
      : feedbackState && feedbackState !== "submitting"
        ? t("common.retry")
        : t("review.submit");
  useDonationStepStatus(
    3,
    submissionPending
      ? "in-progress"
      : (feedbackState && blockingFeedbackStates.has(feedbackState)) ||
          Object.keys(errors).length > 0
        ? "error"
        : "current",
  );

  useEffect(() => {
    const handleOffline = () => setConnectionStatus("offline");
    const handleOnline = () =>
      setConnectionStatus((current) =>
        current === "offline" ? "restored" : "online",
      );

    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    if (isSubmitted) {
      void trigger();
    }
  }, [i18n.resolvedLanguage, isSubmitted, trigger]);

  return (
    <Form
      aria-busy={submissionPending || undefined}
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
            disabled={submissionPending}
            required
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

      <SubmissionFeedback id="submission-feedback">
        {feedback ? (
          <InlineAlert title={t(feedback.title)} tone={feedback.tone}>
            {t(feedback.message)}
          </InlineAlert>
        ) : null}
      </SubmissionFeedback>

      <Actions>
        <Button
          disabled={submissionPending}
          icon={<ArrowLeftIcon />}
          iconPosition="start"
          onClick={onBack}
          variant="secondary"
        >
          {t("common.back")}
        </Button>
        <Button
          aria-describedby={feedback ? "submission-feedback" : undefined}
          disabled={submissionBlockedByOffline}
          loading={submissionPending}
          loadingLabel={t("review.submitting")}
          type="submit"
        >
          {submitLabel}
        </Button>
      </Actions>
    </Form>
  );
}
