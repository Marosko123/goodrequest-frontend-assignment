"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangeEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  CountryFlag,
} from "@/components/ui/icons";
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
  const dialCode = initialValue?.phoneCountry === "CZ" ? "+420" : "+421";

  return {
    firstName: initialValue?.firstName ?? "",
    lastName: initialValue?.lastName ?? "",
    email: initialValue?.email ?? "",
    phone: initialValue?.phoneE164?.replace(dialCode, "") ?? "",
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
    const rawValue = event.target.value;
    const detectedCountry = detectPhoneCountry(rawValue);
    const nationalValue = detectedCountry
      ? rawValue.replace(/^(?:\+|00)(?:420|421)\s*/, "")
      : rawValue;

    setValue("phone", nationalValue, {
      shouldDirty: true,
      shouldValidate: isSubmitted,
    });
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
              <span className={styles.countryPicker}>
                <CountryFlag country={field.value} />
                <ChevronDownIcon />
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
                  <option value="SK">Slovensko +421</option>
                  <option value="CZ">Česko +420</option>
                </select>
              </span>
            )}
          />
          <span className={styles.phoneNumber}>
            <span className={styles.prefix} data-testid="phone-prefix">
              {country === "CZ" ? "+420" : "+421"}
            </span>
            <input
              {...phoneRegistration}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              aria-invalid={errors.phone ? "true" : undefined}
              autoComplete="tel-national"
              className={styles.phoneInput}
              id="phone"
              inputMode="tel"
              onChange={handlePhoneChange}
              placeholder="123 321 123"
              required
              type="tel"
            />
          </span>
        </div>
        {errors.phone?.message ? (
          <p className={styles.error} id="phone-error" role="alert">
            {errors.phone.message}
          </p>
        ) : null}
      </div>

      {isSubmitted ? <FormErrorSummary errors={errorItems} /> : null}

      <div className={styles.actions}>
        <Button
          icon={<ArrowLeftIcon />}
          iconPosition="start"
          onClick={onBack}
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
