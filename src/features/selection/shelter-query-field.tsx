"use client";

import { useQuery } from "@tanstack/react-query";
import type { Control, FieldError, UseFormSetValue } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { QueryProvider } from "@/app/query-provider";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Dropdown } from "@/components/ui/dropdown";
import type { DonationSelection, Shelter } from "@/domain/donation";
import { sheltersQueryOptions } from "@/lib/api/queries";

import type { SelectionFormValues } from "./schema";

type ShelterQueryFieldProps = {
  control: Control<SelectionFormValues, unknown, DonationSelection>;
  enabled: boolean;
  error?: FieldError;
  isSubmitted: boolean;
  onQueryChange: (shelters: readonly Shelter[], isError: boolean) => void;
  setValue: UseFormSetValue<SelectionFormValues>;
};

const emptyShelters: readonly Shelter[] = [];

function ShelterQueryFieldContent({
  control,
  enabled,
  error,
  isSubmitted,
  onQueryChange,
  setValue,
}: ShelterQueryFieldProps) {
  const { t } = useTranslation();
  const query = useQuery(sheltersQueryOptions(enabled));
  const shelters = query.data ?? emptyShelters;
  const shelterId = useWatch({ control, name: "shelterId" });
  const hasNoShelters = query.isSuccess && shelters.length === 0;

  useEffect(() => {
    onQueryChange(shelters, query.isError);
  }, [onQueryChange, query.isError, shelters]);

  useEffect(() => {
    if (
      !query.isSuccess ||
      !shelterId ||
      shelters.some((shelter) => shelter.id.toString() === shelterId)
    ) {
      return;
    }

    setValue("shelterId", null, {
      shouldDirty: true,
      shouldValidate: isSubmitted || Boolean(error),
    });
  }, [error, isSubmitted, query.isSuccess, setValue, shelterId, shelters]);

  return (
    <>
      {query.isError ? (
        <InlineAlert
          action={
            <Button
              loading={query.isFetching}
              onClick={() => void query.refetch()}
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
          <Dropdown
            disabled={
              !enabled || query.isPending || query.isError || hasNoShelters
            }
            error={error?.message}
            id="shelter-id"
            label={t("selection.shelterLabel")}
            name={field.name}
            onBlur={field.onBlur}
            onValueChange={(value) =>
              setValue("shelterId", value, {
                shouldDirty: true,
                shouldValidate: Boolean(error),
              })
            }
            options={shelters.map((shelter) => ({
              value: shelter.id.toString(),
              label: shelter.name,
            }))}
            placeholder={
              query.isPending
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
    </>
  );
}

export default function ShelterQueryField(props: ShelterQueryFieldProps) {
  return (
    <QueryProvider>
      <ShelterQueryFieldContent {...props} />
    </QueryProvider>
  );
}
