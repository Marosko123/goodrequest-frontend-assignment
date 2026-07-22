"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangeEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormErrorSummary,
  type FormErrorItem,
} from "@/components/ui/form-error-summary";
import { TextField } from "@/components/ui/text-field";
import type { DonorDetails } from "@/domain/donation";

import { detectPhoneCountry } from "./phone";
import { detailsSchema, type DetailsFormValues } from "./schema";
import styles from "./details-form.module.scss";

function getDefaultValues(initialValue?: DonorDetails): DetailsFormValues {
  return {
    firstName: initialValue?.firstName ?? "",
    lastName: initialValue?.lastName ?? "",
    email: initialValue?.email ?? "",
    phone: initialValue?.phoneE164 ?? "",
    phoneCountry: initialValue?.phoneCountry ?? "SK",
  };
}

export function DetailsForm({
  initialValue,
  onBack,
  onComplete,
}: {
  initialValue?: DonorDetails;
  onBack: () => void;
  onComplete: (donor: DonorDetails) => void;
}) {
  const {
    control,
    formState: { errors, isSubmitted },
    handleSubmit,
    register,
    setValue,
  } = useForm<DetailsFormValues, unknown, DonorDetails>({
    defaultValues: getDefaultValues(initialValue),
    resolver: zodResolver(detailsSchema),
    shouldFocusError: true,
  });
  const country = useWatch({ control, name: "phoneCountry" });
  const phoneRegistration = register("phone");
  const errorItems: FormErrorItem[] = [
    ["first-name", "Meno", errors.firstName?.message],
    ["last-name", "Priezvisko", errors.lastName?.message],
    ["email", "E-mailová adresa", errors.email?.message],
    ["phone", "Telefónne číslo", errors.phone?.message],
  ]
    .filter((item): item is [string, string, string] => Boolean(item[2]))
    .map(([fieldId, label, message]) => ({ fieldId, label, message }));

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    void phoneRegistration.onChange(event);
    const detectedCountry = detectPhoneCountry(event.target.value);
    if (detectedCountry && detectedCountry !== country) {
      setValue("phoneCountry", detectedCountry, { shouldDirty: true });
    }
  }

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={handleSubmit((donor) => onComplete(donor))}
    >
      <div className={styles.nameGrid}>
        <TextField
          {...register("firstName")}
          autoComplete="given-name"
          error={errors.firstName?.message}
          id="first-name"
          label="Meno"
          maxLength={20}
          placeholder="Zadajte vaše meno"
        />
        <TextField
          {...register("lastName")}
          autoComplete="family-name"
          error={errors.lastName?.message}
          id="last-name"
          label="Priezvisko"
          maxLength={30}
          placeholder="Zadajte vaše priezvisko"
          required
        />
      </div>

      <TextField
        {...register("email")}
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email?.message}
        id="email"
        inputMode="email"
        label="E-mailová adresa"
        placeholder="Zadajte váš e-mail"
        required
        type="email"
      />

      <div className={styles.phoneField}>
        <label className={styles.phoneLabel} htmlFor="phone">
          Telefónne číslo
        </label>
        <div className={styles.phoneControl}>
          <label className="sr-only" htmlFor="phone-country">
            Krajina telefónneho čísla
          </label>
          <Controller
            control={control}
            name="phoneCountry"
            render={({ field }) => (
              <select
                aria-label="Krajina telefónneho čísla"
                className={styles.countrySelect}
                id="phone-country"
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                ref={field.ref}
                value={field.value}
              >
                <option value="SK">🇸🇰 +421</option>
                <option value="CZ">🇨🇿 +420</option>
              </select>
            )}
          />
          <input
            {...phoneRegistration}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            aria-invalid={errors.phone ? "true" : undefined}
            autoComplete="tel"
            className={styles.phoneInput}
            id="phone"
            inputMode="tel"
            onChange={handlePhoneChange}
            placeholder={country === "CZ" ? "777 123 456" : "0901 234 567"}
            type="tel"
          />
        </div>
        {errors.phone?.message ? (
          <p className={styles.error} id="phone-error" role="alert">
            {errors.phone.message}
          </p>
        ) : null}
      </div>

      {isSubmitted ? <FormErrorSummary errors={errorItems} /> : null}

      <div className={styles.actions}>
        <Button onClick={onBack} variant="secondary">
          Späť
        </Button>
        <Button type="submit">Pokračovať</Button>
      </div>
    </form>
  );
}
