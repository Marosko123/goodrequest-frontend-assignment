"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import {
  FormErrorSummary,
  type FormErrorItem,
} from "@/components/ui/form-error-summary";
import { InlineAlert } from "@/components/ui/inline-alert";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import type { DonationSelection, Shelter } from "@/domain/donation";
import type { SelectionDraft } from "@/features/donation-flow/state";
import { formatCurrency } from "@/i18n/format";
import { sheltersQueryOptions } from "@/lib/api/queries";

import {
  formatAmountInput,
  normalizeAmountEdit,
  normalizeAmountOnBlur,
  parseAmountToCents,
  type AmountErrorCode,
} from "./amount";
import {
  createSelectionSchema,
  getAmountErrorMessage,
  type SelectionFormValues,
} from "./schema";
import {
  Actions,
  AmountFieldset,
  Currency,
  CustomAmount,
  Form,
  Preset,
  Presets,
  ShelterRegion,
  ShelterSection,
  TargetFieldset,
  TargetLegend,
  TargetOption,
  TargetOptions,
} from "./selection-form.styles";

const amountPresets = [5, 10, 20, 30, 50, 100] as const;
const emptyShelters: readonly Shelter[] = [];

function getDefaultValues(
  initialDraft?: SelectionDraft,
  initialValue?: DonationSelection,
): SelectionFormValues {
  if (initialDraft) {
    return initialDraft;
  }

  if (!initialValue) {
    return { target: "foundation", shelterId: null, amount: "" };
  }

  return {
    target: initialValue.target,
    shelterId:
      initialValue.target === "shelter"
        ? initialValue.shelter.id.toString()
        : null,
    amount: formatAmountInput(initialValue.amountCents),
  };
}

export function SelectionForm({
  initialDraft,
  initialValue,
  onDraftChange,
  onComplete,
}: {
  initialDraft?: SelectionDraft;
  initialValue?: DonationSelection;
  onDraftChange?: (draft: SelectionDraft) => void;
  onComplete: (selection: DonationSelection) => void;
}) {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en" : "sk";
  const sheltersQuery = useQuery(sheltersQueryOptions());
  const shelters = sheltersQuery.data ?? emptyShelters;
  const schema = useMemo(
    () => createSelectionSchema(shelters, t),
    [shelters, t],
  );
  const {
    control,
    formState: { errors, isSubmitted },
    clearErrors,
    handleSubmit,
    setError,
    setValue,
    subscribe,
    trigger,
  } = useForm<SelectionFormValues, unknown, DonationSelection>({
    defaultValues: getDefaultValues(initialDraft, initialValue),
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const target = useWatch({ control, name: "target" });
  const shelterId = useWatch({ control, name: "shelterId" });
  const amount = useWatch({ control, name: "amount" });
  const selectedAmountCents = parseAmountToCents(amount);
  const previousLanguage = useRef(i18n.resolvedLanguage);
  const hasNoShelters = sheltersQuery.isSuccess && shelters.length === 0;
  const amountStyle = {
    "--amount-characters": Math.max(1, Math.min(amount.length, 10)),
  } as CSSProperties;
  const errorItems: FormErrorItem[] = [];

  const updateAmount = (rawValue: string) => {
    const result = normalizeAmountEdit(rawValue, locale);

    if (!result.accepted) {
      setError("amount", {
        type: `manual-${result.code}`,
        message: getAmountErrorMessage(result.code, t),
      });
      return;
    }

    setValue("amount", result.value, {
      shouldDirty: true,
      shouldValidate: Boolean(errors.amount),
    });
  };

  useEffect(() => {
    if (!onDraftChange) {
      return;
    }

    return subscribe({
      formState: { values: true },
      callback: ({ values }) =>
        onDraftChange({ ...values, shelterId: values.shelterId ?? null }),
    });
  }, [onDraftChange, subscribe]);

  useEffect(() => {
    if (previousLanguage.current === i18n.resolvedLanguage) {
      return;
    }

    previousLanguage.current = i18n.resolvedLanguage;
    const manualAmountType = errors.amount?.type;
    if (manualAmountType?.startsWith("manual-")) {
      const code = manualAmountType.slice("manual-".length) as AmountErrorCode;
      setError("amount", {
        type: manualAmountType,
        message: getAmountErrorMessage(code, t),
      });
    }

    const fieldsToValidate: (keyof SelectionFormValues)[] = [];
    if (errors.shelterId) {
      fieldsToValidate.push("shelterId");
    }
    if (errors.amount && !manualAmountType?.startsWith("manual-")) {
      fieldsToValidate.push("amount");
    }
    if (fieldsToValidate.length > 0) {
      void trigger(fieldsToValidate);
    }
  }, [
    errors.amount,
    errors.shelterId,
    i18n.resolvedLanguage,
    setError,
    t,
    trigger,
  ]);

  useEffect(() => {
    const normalized = normalizeAmountEdit(amount, locale);
    if (normalized.accepted && normalized.value !== amount) {
      setValue("amount", normalized.value, {
        shouldValidate: Boolean(errors.amount),
      });
    }
  }, [amount, errors.amount, locale, setValue]);

  useEffect(() => {
    if (
      !sheltersQuery.isSuccess ||
      !shelterId ||
      shelters.some((shelter) => shelter.id.toString() === shelterId)
    ) {
      return;
    }

    setValue("shelterId", null, {
      shouldDirty: true,
      shouldValidate: isSubmitted || Boolean(errors.shelterId),
    });
  }, [
    errors.shelterId,
    isSubmitted,
    setValue,
    shelterId,
    shelters,
    sheltersQuery.isSuccess,
  ]);

  if (errors.shelterId?.message) {
    errorItems.push({
      fieldId: "shelter-id",
      label: t("selection.shelterLabel"),
      message: errors.shelterId.message,
    });
  }
  if (errors.amount?.message) {
    errorItems.push({
      fieldId: "amount",
      label: t("selection.customAmount"),
      message: errors.amount.message,
    });
  }

  return (
    <Form
      noValidate
      onSubmit={handleSubmit((selection) => onComplete(selection))}
    >
      <TargetFieldset>
        <TargetLegend>{t("selection.targetLegend")}</TargetLegend>
        <Controller
          control={control}
          name="target"
          render={({ field }) => (
            <TargetOptions data-target={field.value}>
              <TargetOption data-selected={field.value === "shelter"}>
                <input
                  checked={field.value === "shelter"}
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={() => field.onChange("shelter")}
                  ref={field.ref}
                  type="radio"
                  value="shelter"
                />
                <span>{t("selection.shelterTarget")}</span>
              </TargetOption>
              <TargetOption data-selected={field.value === "foundation"}>
                <input
                  checked={field.value === "foundation"}
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={() => {
                    field.onChange("foundation");
                    setValue("shelterId", null, { shouldDirty: true });
                    clearErrors("shelterId");
                  }}
                  ref={field.ref}
                  type="radio"
                  value="foundation"
                />
                <span>{t("selection.foundationTarget")}</span>
              </TargetOption>
            </TargetOptions>
          )}
        />
      </TargetFieldset>

      <ShelterRegion
        aria-hidden={target !== "shelter" || undefined}
        data-expanded={target === "shelter"}
        data-testid="shelter-region"
      >
        <ShelterSection>
          {sheltersQuery.isError ? (
            <InlineAlert
              action={
                <Button
                  loading={sheltersQuery.isFetching}
                  onClick={() => void sheltersQuery.refetch()}
                  variant="link"
                >
                  {t("common.retry")}
                </Button>
              }
              title={t("selection.sheltersLoadTitle")}
              tone="error"
            >
              {t("selection.sheltersLoadMessage")}
            </InlineAlert>
          ) : null}
          {hasNoShelters ? (
            <InlineAlert title={t("selection.sheltersEmptyTitle")} tone="info">
              {t("selection.sheltersEmptyMessage")}
            </InlineAlert>
          ) : null}
          <Controller
            control={control}
            name="shelterId"
            render={({ field }) => (
              <SelectField
                data={shelters.map((shelter) => ({
                  value: shelter.id.toString(),
                  label: shelter.name,
                }))}
                disabled={
                  target !== "shelter" ||
                  sheltersQuery.isPending ||
                  sheltersQuery.isError ||
                  hasNoShelters
                }
                error={errors.shelterId?.message}
                id="shelter-id"
                label={t("selection.shelterLabel")}
                onBlur={field.onBlur}
                onChange={(value) =>
                  setValue("shelterId", value, {
                    shouldDirty: true,
                    shouldValidate: Boolean(errors.shelterId),
                  })
                }
                placeholder={
                  sheltersQuery.isPending
                    ? t("selection.sheltersLoading")
                    : hasNoShelters
                      ? t("selection.sheltersEmptyPlaceholder")
                      : t("selection.shelterPlaceholder")
                }
                ref={field.ref}
                required
                value={field.value || null}
              />
            )}
          />
        </ShelterSection>
      </ShelterRegion>

      <AmountFieldset>
        <legend>{t("selection.amountLegend")}</legend>
        <CustomAmount
          data-amount-size={
            amount.length >= 9
              ? "long"
              : amount.length >= 7
                ? "medium"
                : "short"
          }
          style={amountStyle}
        >
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <TextField
                autoComplete="off"
                error={errors.amount?.message}
                id="amount"
                inputMode="decimal"
                label={t("selection.customAmount")}
                name={field.name}
                onBlur={() => {
                  const normalized = normalizeAmountOnBlur(field.value, locale);
                  if (normalized !== field.value) {
                    field.onChange(normalized);
                  }
                  if (errors.amount?.type?.startsWith("manual-")) {
                    return;
                  }
                  field.onBlur();
                }}
                onChange={(event) => updateAmount(event.target.value)}
                placeholder="0"
                ref={field.ref}
                required
                value={field.value}
              />
            )}
          />
          <Currency aria-hidden="true">€</Currency>
        </CustomAmount>
        <Presets aria-label={t("selection.presetAmounts")} role="group">
          {amountPresets.map((preset) => (
            <Preset
              aria-pressed={selectedAmountCents === preset * 100}
              key={preset}
              onClick={() => updateAmount(preset.toString())}
              type="button"
            >
              {formatCurrency(preset, locale)}
            </Preset>
          ))}
        </Presets>
      </AmountFieldset>

      {isSubmitted ? <FormErrorSummary errors={errorItems} /> : null}

      <Actions>
        <Button
          disabled
          icon={<ArrowLeftIcon />}
          iconPosition="start"
          variant="secondary"
        >
          {t("common.back")}
        </Button>
        <Button icon={<ArrowRightIcon />} type="submit">
          {t("common.continue")}
        </Button>
      </Actions>
    </Form>
  );
}
