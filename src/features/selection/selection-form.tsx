"use client";

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useLazyZodResolver } from "@/lib/validation/use-lazy-zod-resolver";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import { useDonationStepStatus } from "@/components/layout/donation-progress-context";
import {
  FormErrorSummary,
  type FormErrorItem,
} from "@/components/ui/form-error-summary";
import { Dropdown, type DropdownOption } from "@/components/ui/dropdown";
import { TextField } from "@/components/ui/text-field";
import type { DonationSelection, Shelter } from "@/domain/donation";
import type { SelectionDraft } from "@/features/donation-flow/state";
import { formatCurrency } from "@/i18n/format";
import { getAppLocale } from "@/i18n/config";
import type { DonationRoutePrefetchIntent } from "@/lib/navigation/use-donation-route-prefetch";

import {
  formatAmountInput,
  getAmountErrorMessage,
  normalizeAmountEdit,
  normalizeAmountOnBlur,
  parseDonationAmount,
  parseAmountToCents,
  type AmountErrorCode,
} from "./amount";
import type { SelectionFormValues } from "./schema";
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
const noShelterOptions: readonly DropdownOption<string>[] = [];
const ShelterQueryField = lazy(() => import("./shelter-query-field"));

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
  nextStepPrefetch,
}: {
  initialDraft?: SelectionDraft;
  initialValue?: DonationSelection;
  onDraftChange?: (draft: SelectionDraft) => void;
  onComplete: (selection: DonationSelection) => void;
  nextStepPrefetch?: DonationRoutePrefetchIntent;
}) {
  const { i18n, t } = useTranslation();
  const locale = getAppLocale(i18n.resolvedLanguage);
  const [shelters, setShelters] = useState<readonly Shelter[]>(emptyShelters);
  const [sheltersError, setSheltersError] = useState(false);
  const [sheltersActivated, setSheltersActivated] = useState(
    initialDraft?.target === "shelter" || initialValue?.target === "shelter",
  );
  const resolver = useLazyZodResolver<SelectionFormValues, DonationSelection>(
    async () => (await import("./schema")).createSelectionSchema(shelters, t),
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
    resolver,
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const target = useWatch({ control, name: "target" });
  const amount = useWatch({ control, name: "amount" });
  const selectedAmountCents = parseAmountToCents(amount);
  const previousLanguage = useRef(i18n.resolvedLanguage);
  const amountStyle = {
    "--amount-characters": Math.max(1, Math.min(amount.length, 10)),
  } as CSSProperties;
  const errorItems: FormErrorItem[] = [];
  const handleShelterQueryChange = useCallback(
    (nextShelters: readonly Shelter[], isError: boolean) => {
      setShelters(nextShelters);
      setSheltersError(isError);
    },
    [],
  );

  const updateAmount = (rawValue: string) => {
    const result = normalizeAmountEdit(rawValue, locale);

    if (!result.accepted) {
      setError("amount", {
        type: `manual-${result.code}`,
        message: getAmountErrorMessage(result.code, t),
      });
      return;
    }

    if (parseDonationAmount(result.value).ok) {
      clearErrors("amount");
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

  useDonationStepStatus(
    1,
    errorItems.length > 0 || (target === "shelter" && sheltersError)
      ? "error"
      : "current",
  );

  // Rendered both as the lazy chunk's Suspense fallback and before the shelter
  // branch is ever activated, so the control keeps its box and its label instead
  // of appearing only once the query chunk resolves.
  const shelterFieldPlaceholder = (
    <Controller
      control={control}
      name="shelterId"
      render={({ field }) => (
        <Dropdown
          disabled
          error={errors.shelterId?.message}
          id="shelter-id"
          label={t("selection.shelterLabel")}
          onValueChange={() => undefined}
          options={noShelterOptions}
          placeholder={t("selection.sheltersLoading")}
          ref={field.ref}
          required
          value={field.value || null}
        />
      )}
    />
  );

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
                  onChange={() => {
                    setSheltersActivated(true);
                    field.onChange("shelter");
                  }}
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
          {sheltersActivated ? (
            <Suspense fallback={shelterFieldPlaceholder}>
              <ShelterQueryField
                control={control}
                enabled={target === "shelter"}
                isSubmitted={isSubmitted}
                onQueryChange={handleShelterQueryChange}
                setValue={setValue}
                {...(errors.shelterId ? { error: errors.shelterId } : {})}
              />
            </Suspense>
          ) : (
            shelterFieldPlaceholder
          )}
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
        <Button {...nextStepPrefetch} icon={<ArrowRightIcon />} type="submit">
          {t("common.continue")}
        </Button>
      </Actions>
    </Form>
  );
}
