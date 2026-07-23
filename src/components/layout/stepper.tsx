"use client";

import { useTranslation } from "react-i18next";

import {
  Step,
  StepContent,
  StepDisabled,
  StepLabel,
  StepLine,
  StepLink,
  StepList,
  StepNumber,
  StepStatusText,
  StepperAnnouncement,
  StepperNav,
} from "./stepper.styles";
import type { DonationStep } from "./donation-step";

export type StepperStatus =
  "current" | "finished" | "in-progress" | "wait" | "error";

export type StepperItem = {
  number: DonationStep;
  label: string;
  status: StepperStatus;
  href?: string;
};

const currentStatuses: ReadonlySet<StepperStatus> = new Set([
  "current",
  "in-progress",
  "error",
]);

function FinishedIcon() {
  return (
    <svg
      aria-hidden="true"
      data-testid="step-check"
      height="16"
      viewBox="0 0 16 16"
      width="16"
    >
      <path
        d="M15.144 2.25H13.895C13.72 2.25 13.554 2.33 13.447 2.468L6.085 11.795L2.554 7.321C2.501 7.254 2.433 7.199 2.355 7.161C2.278 7.123 2.193 7.104 2.106 7.104H0.858C0.738 7.104 0.672 7.241 0.745 7.334L5.637 13.53C5.865 13.82 6.304 13.82 6.535 13.53L15.256 2.479C15.329 2.388 15.263 2.25 15.144 2.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      aria-hidden="true"
      data-testid="step-error"
      height="16"
      viewBox="0 0 16 16"
      width="16"
    >
      <path
        d="M8.925 7.999L13.612 2.412C13.691 2.319 13.625 2.178 13.503 2.178H12.078C11.994 2.178 11.914 2.215 11.859 2.28L7.993 6.888L4.127 2.28C4.073 2.215 3.993 2.178 3.907 2.178H2.482C2.36 2.178 2.294 2.319 2.373 2.412L7.06 7.999L2.373 13.587C2.355 13.607 2.344 13.633 2.34 13.66C2.337 13.687 2.341 13.714 2.352 13.739C2.364 13.763 2.382 13.784 2.405 13.799C2.428 13.813 2.455 13.821 2.482 13.821H3.907C3.991 13.821 4.071 13.783 4.127 13.719L7.993 9.11L11.859 13.719C11.912 13.783 11.993 13.821 12.078 13.821H13.503C13.625 13.821 13.691 13.68 13.612 13.587L8.925 7.999Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg
      aria-hidden="true"
      data-testid="step-progress"
      height="40"
      viewBox="0 0 40 40"
      width="40"
    >
      <circle cx="20" cy="20" fill="#4F46E5" r="16" />
      <circle
        cx="20"
        cy="20"
        data-vector="track"
        fill="none"
        r="19"
        stroke="#F9FAFB"
        strokeWidth="2"
      />
      <path
        d="M8.832 35.371C11.258 37.134 14.066 38.297 17.028 38.766C19.989 39.235 23.02 38.997 25.871 38.07C28.723 37.144 31.315 35.555 33.435 33.435C35.555 31.315 37.144 28.723 38.07 25.871C38.997 23.02 39.235 19.989 38.766 17.028C38.297 14.066 37.134 11.258 35.371 8.832C33.609 6.406 31.297 4.432 28.626 3.071C25.954 1.71 22.998 1 20 1"
        data-vector="progress"
        fill="none"
        stroke="#4F46E5"
        strokeWidth="2"
      />
    </svg>
  );
}

function StepMarker({ item }: { item: StepperItem }) {
  return (
    <StepNumber aria-hidden="true" data-step-marker>
      {item.status === "finished" ? <FinishedIcon /> : null}
      {item.status === "error" ? <ErrorIcon /> : null}
      {item.status === "in-progress" ? <ProgressIcon /> : null}
      {item.status === "current" ||
      item.status === "in-progress" ||
      item.status === "wait"
        ? item.number
        : null}
    </StepNumber>
  );
}

export function Stepper({ items }: { items: readonly StepperItem[] }) {
  const { t } = useTranslation();
  const isBusy = items.some((item) => item.status === "in-progress");
  const announcedItem =
    items.find((item) => currentStatuses.has(item.status)) ?? items.at(-1);
  const statusLabels: Record<StepperStatus, string> = {
    current: t("steps.status.current"),
    finished: t("steps.status.finished"),
    "in-progress": t("steps.status.inProgress"),
    wait: t("steps.status.wait"),
    error: t("steps.status.error"),
  };

  return (
    <StepperNav
      aria-busy={isBusy ? "true" : undefined}
      aria-label={t("steps.progress")}
    >
      <StepList aria-label={t("steps.progress")}>
        {items.map((item, index) => {
          const isCurrent = currentStatuses.has(item.status);
          const content = (
            <>
              <StepMarker item={item} />
              <StepLabel data-step-label>{item.label}</StepLabel>
            </>
          );

          return (
            <Step
              aria-busy={item.status === "in-progress" ? "true" : undefined}
              aria-current={isCurrent ? "step" : undefined}
              aria-disabled={item.status === "wait" ? "true" : undefined}
              data-status={item.status}
              key={item.number}
            >
              {item.href ? (
                <StepLink href={item.href}>{content}</StepLink>
              ) : item.status === "wait" ? (
                <StepDisabled disabled type="button">
                  {content}
                </StepDisabled>
              ) : (
                <StepContent>{content}</StepContent>
              )}
              <StepStatusText>{statusLabels[item.status]}</StepStatusText>
              {index < items.length - 1 ? (
                <StepLine aria-hidden="true" />
              ) : null}
            </Step>
          );
        })}
      </StepList>
      <StepperAnnouncement aria-live="polite" role="status">
        {announcedItem
          ? `${announcedItem.label}: ${statusLabels[announcedItem.status]}`
          : null}
      </StepperAnnouncement>
    </StepperNav>
  );
}
