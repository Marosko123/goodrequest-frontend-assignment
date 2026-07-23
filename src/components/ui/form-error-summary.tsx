"use client";

import { useTranslation } from "react-i18next";

import { ErrorList, Summary, SummaryTitle } from "./form-error-summary.styles";

export type FormErrorItem = {
  fieldId: string;
  label: string;
  message: string;
};

export function FormErrorSummary({
  errors,
}: {
  errors: readonly FormErrorItem[];
}) {
  const { t } = useTranslation();

  if (errors.length === 0) {
    return null;
  }

  return (
    <Summary
      aria-labelledby="form-error-summary-title"
      role="alert"
      tabIndex={-1}
    >
      <SummaryTitle id="form-error-summary-title">
        {t("common.formErrors")}
      </SummaryTitle>
      <ErrorList>
        {errors.map((error) => (
          <li key={error.fieldId}>
            <a
              href={`#${error.fieldId}`}
              onClick={() => document.getElementById(error.fieldId)?.focus()}
            >
              {error.label}: {error.message}
            </a>
          </li>
        ))}
      </ErrorList>
    </Summary>
  );
}
