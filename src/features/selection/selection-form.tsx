"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { type CSSProperties, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

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
import { sheltersQueryOptions } from "@/lib/api/queries";

import {
  formatAmountInput,
  normalizeAmountEdit,
  normalizeAmountOnBlur,
  parseAmountToCents,
} from "./amount";
import { createSelectionSchema, type SelectionFormValues } from "./schema";
import styles from "./selection-form.module.scss";

const amountPresets = [5, 10, 20, 30, 50, 100] as const;
const emptyShelters: readonly Shelter[] = [];

function getDefaultValues(
  initialValue?: DonationSelection,
): SelectionFormValues {
  if (!initialValue) {
    return { target: "foundation", shelterId: null, amount: "50" };
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
  initialValue,
  onComplete,
}: {
  initialValue?: DonationSelection;
  onComplete: (selection: DonationSelection) => void;
}) {
  const sheltersQuery = useQuery(sheltersQueryOptions());
  const shelters = sheltersQuery.data ?? emptyShelters;
  const schema = useMemo(() => createSelectionSchema(shelters), [shelters]);
  const {
    control,
    formState: { errors, isSubmitted },
    handleSubmit,
    register,
    setValue,
  } = useForm<SelectionFormValues, unknown, DonationSelection>({
    defaultValues: getDefaultValues(initialValue),
    resolver: zodResolver(schema),
    shouldFocusError: true,
  });

  const target = useWatch({ control, name: "target" });
  const amount = useWatch({ control, name: "amount" });
  const selectedAmountCents = parseAmountToCents(amount);
  const errorItems: FormErrorItem[] = [];

  if (errors.shelterId?.message) {
    errorItems.push({
      fieldId: "shelter-id",
      label: "Útulok",
      message: errors.shelterId.message,
    });
  }
  if (errors.amount?.message) {
    errorItems.push({
      fieldId: "amount",
      label: "Vlastná suma",
      message: errors.amount.message,
    });
  }

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={handleSubmit((selection) => onComplete(selection))}
    >
      <fieldset className={styles.targetFieldset}>
        <legend className={styles.targetLegend}>Forma pomoci</legend>
        <Controller
          control={control}
          name="target"
          render={({ field }) => (
            <div className={styles.targetOptions} data-target={field.value}>
              <label
                className={styles.targetOption}
                data-selected={field.value === "shelter"}
              >
                <input
                  checked={field.value === "shelter"}
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={() => field.onChange("shelter")}
                  ref={field.ref}
                  type="radio"
                  value="shelter"
                />
                <span>Prispieť konkrétnemu útulku</span>
              </label>
              <label
                className={styles.targetOption}
                data-selected={field.value === "foundation"}
              >
                <input
                  checked={field.value === "foundation"}
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={() => {
                    field.onChange("foundation");
                    setValue("shelterId", null);
                  }}
                  ref={field.ref}
                  type="radio"
                  value="foundation"
                />
                <span>Prispieť celej nadácii</span>
              </label>
            </div>
          )}
        />
      </fieldset>

      <div
        aria-hidden={target !== "shelter"}
        className={styles.shelterRegion}
        data-expanded={target === "shelter"}
        data-testid="shelter-region"
      >
        <div className={styles.shelterSection}>
          {sheltersQuery.isError ? (
            <InlineAlert
              action={
                <Button
                  onClick={() => void sheltersQuery.refetch()}
                  variant="link"
                >
                  Skúsiť znova
                </Button>
              }
              title="Útulky sa nepodarilo načítať"
              tone="error"
            >
              Skontrolujte pripojenie a skúste načítanie zopakovať.
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
                  sheltersQuery.isError
                }
                error={errors.shelterId?.message}
                id="shelter-id"
                label="Útulok"
                onBlur={field.onBlur}
                onChange={field.onChange}
                placeholder={
                  sheltersQuery.isPending
                    ? "Načítavam útulky…"
                    : "Vyberte útulok zo zoznamu"
                }
                ref={field.ref}
                required
                value={field.value || null}
              />
            )}
          />
        </div>
      </div>

      <fieldset className={styles.amountFieldset}>
        <legend>Suma, ktorou chcem prispieť</legend>
        <div
          className={styles.customAmount}
          data-amount-size={
            amount.length > 8 ? "long" : amount.length > 6 ? "medium" : "short"
          }
          style={
            {
              "--amount-characters": Math.max(amount.length, 1),
            } as CSSProperties
          }
        >
          <TextField
            {...register("amount", {
              onBlur: (event) => {
                setValue(
                  "amount",
                  normalizeAmountOnBlur(event.target.value, "sk"),
                  {
                    shouldDirty: true,
                    shouldValidate: isSubmitted,
                  },
                );
              },
              onChange: (event) => {
                const normalized = normalizeAmountEdit(
                  event.target.value,
                  "sk",
                );
                if (normalized.accepted) {
                  setValue("amount", normalized.value, {
                    shouldDirty: true,
                    shouldValidate: isSubmitted,
                  });
                }
              },
            })}
            autoComplete="off"
            error={errors.amount?.message}
            id="amount"
            inputMode="decimal"
            label="Vlastná suma"
            placeholder="0"
          />
          <span aria-hidden="true" className={styles.currency}>
            €
          </span>
        </div>
        <div aria-label="Predvolené sumy" className={styles.presets}>
          {amountPresets.map((preset) => (
            <button
              aria-pressed={selectedAmountCents === preset * 100}
              className={styles.preset}
              key={preset}
              onClick={() =>
                setValue("amount", preset.toString(), {
                  shouldDirty: true,
                  shouldValidate: isSubmitted,
                })
              }
              type="button"
            >
              {preset} €
            </button>
          ))}
        </div>
      </fieldset>

      {isSubmitted ? <FormErrorSummary errors={errorItems} /> : null}

      <div className={styles.actions}>
        <Button
          disabled
          icon={<ArrowLeftIcon />}
          iconPosition="start"
          variant="secondary"
        >
          Späť
        </Button>
        <Button icon={<ArrowRightIcon />} type="submit">
          Pokračovať
        </Button>
      </div>
    </form>
  );
}
