"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangeEvent, useEffect, useMemo, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

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
import type { DonorDetails, PhoneCountry } from "@/domain/donation";
import type { DonorDraft } from "@/features/donation-flow/state";

import { formatPhoneInput, type PhoneErrorCode } from "./phone";
import {
  createDetailsSchema,
  getPhoneErrorMessage,
  type DetailsFormValues,
} from "./schema";
import {
  Actions,
  CountryPicker,
  CountrySelect,
  ErrorMessage,
  Form,
  NameGrid,
  PhoneControl,
  PhoneField,
  PhoneInput,
  PhoneLabel,
  PhoneNumber,
  Prefix,
} from "./details-form.styles";

function getDefaultValues(
  initialDraft?: DonorDraft,
  initialValue?: DonorDetails,
): DetailsFormValues {
  if (initialDraft) {
    return initialDraft;
  }

  const phoneCountry = initialValue?.phoneCountry ?? "SK";
  const formattedPhone = initialValue
    ? formatPhoneInput(initialValue.phoneE164, phoneCountry)
    : null;

  return {
    firstName: initialValue?.firstName ?? "",
    lastName: initialValue?.lastName ?? "",
    email: initialValue?.email ?? "",
    phone: formattedPhone?.accepted ? formattedPhone.value : "",
    phoneCountry,
  };
}

export function DetailsForm({
  initialDraft,
  initialValue,
  onBack,
  onComplete,
  onDraftChange,
}: {
  initialDraft?: DonorDraft;
  initialValue?: DonorDetails;
  onBack: () => void;
  onComplete: (donor: DonorDetails) => void;
  onDraftChange?: (draft: DonorDraft) => void;
}) {
  const { i18n, t } = useTranslation();
  const schema = useMemo(() => createDetailsSchema(t), [t]);
  const {
    control,
    formState: { errors, isSubmitted },
    handleSubmit,
    register,
    setError,
    setFocus,
    setValue,
    subscribe,
    trigger,
  } = useForm<DetailsFormValues, unknown, DonorDetails>({
    defaultValues: getDefaultValues(initialDraft, initialValue),
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });
  const country = useWatch({ control, name: "phoneCountry" });
  const phone = useWatch({ control, name: "phone" });
  const previousLanguage = useRef(i18n.resolvedLanguage);
  const phoneRegistration = register("phone");
  const errorItems: FormErrorItem[] = [
    ["first-name", t("details.firstName"), errors.firstName?.message],
    ["last-name", t("details.lastName"), errors.lastName?.message],
    ["email", t("details.email"), errors.email?.message],
    ["phone", t("details.phone"), errors.phone?.message],
  ]
    .filter((item): item is [string, string, string] => Boolean(item[2]))
    .map(([fieldId, label, message]) => ({ fieldId, label, message }));

  useEffect(() => {
    if (!onDraftChange) {
      return;
    }

    return subscribe({
      formState: { values: true },
      callback: ({ values }) => onDraftChange(values),
    });
  }, [onDraftChange, subscribe]);

  const hasErrors = errorItems.length > 0;

  useEffect(() => {
    if (previousLanguage.current === i18n.resolvedLanguage) {
      return;
    }

    previousLanguage.current = i18n.resolvedLanguage;
    if (isSubmitted || hasErrors) {
      const manualPhoneType = errors.phone?.type;
      if (manualPhoneType?.startsWith("manual-")) {
        const code = manualPhoneType.slice("manual-".length) as PhoneErrorCode;
        setError("phone", {
          type: manualPhoneType,
          message: getPhoneErrorMessage(code, t),
        });
      }

      const fieldsToValidate = (
        Object.keys(errors) as (keyof DetailsFormValues)[]
      ).filter(
        (fieldName) =>
          fieldName !== "phone" || !manualPhoneType?.startsWith("manual-"),
      );
      if (fieldsToValidate.length > 0) {
        void trigger(fieldsToValidate);
      }
    }
  }, [
    errors,
    hasErrors,
    i18n.resolvedLanguage,
    isSubmitted,
    setError,
    t,
    trigger,
  ]);

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    const result = formatPhoneInput(event.target.value, country);

    if (!result.accepted) {
      setError("phone", {
        type: `manual-${result.code}`,
        message: getPhoneErrorMessage(result.code, t),
      });
      return;
    }

    if (result.country !== country) {
      setValue("phoneCountry", result.country, { shouldDirty: true });
    }
    setValue("phone", result.value, {
      shouldDirty: true,
      shouldValidate: Boolean(errors.phone),
    });
  }

  function handlePhoneCountryChange(
    nextCountry: PhoneCountry,
    onChange: (value: PhoneCountry) => void,
  ) {
    onChange(nextCountry);
    const formatted = formatPhoneInput(phone, nextCountry);
    if (formatted.accepted) {
      setValue("phone", formatted.value, {
        shouldDirty: true,
        shouldValidate: Boolean(errors.phone),
      });
    }
  }

  return (
    <Form
      noValidate
      onSubmit={handleSubmit(
        (donor) => onComplete(donor),
        (validationErrors) => {
          const firstInvalid = (
            ["firstName", "lastName", "email", "phone"] as const
          ).find((fieldName) => validationErrors[fieldName]);
          if (firstInvalid) {
            setFocus(firstInvalid);
          }
        },
      )}
    >
      <NameGrid>
        <TextField
          {...register("firstName")}
          autoComplete="given-name"
          error={errors.firstName?.message}
          id="first-name"
          label={t("details.firstName")}
          placeholder={t("details.firstNamePlaceholder")}
        />
        <TextField
          {...register("lastName")}
          autoComplete="family-name"
          error={errors.lastName?.message}
          id="last-name"
          label={t("details.lastName")}
          placeholder={t("details.lastNamePlaceholder")}
          required
        />
      </NameGrid>

      <TextField
        {...register("email")}
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email?.message}
        id="email"
        inputMode="email"
        label={t("details.email")}
        placeholder={t("details.emailPlaceholder")}
        required
        type="email"
      />

      <PhoneField>
        <PhoneLabel htmlFor="phone">
          {t("details.phone")}
          <span aria-hidden="true"> *</span>
        </PhoneLabel>
        <PhoneControl>
          <label className="sr-only" htmlFor="phone-country">
            {t("details.phoneCountry")}
          </label>
          <Controller
            control={control}
            name="phoneCountry"
            render={({ field }) => (
              <CountryPicker>
                <CountryFlag country={field.value} />
                <ChevronDownIcon />
                <CountrySelect
                  aria-label={t("details.phoneCountry")}
                  id="phone-country"
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    handlePhoneCountryChange(
                      event.target.value as PhoneCountry,
                      field.onChange,
                    )
                  }
                  ref={field.ref}
                  value={field.value}
                >
                  <option value="SK">{t("details.slovakia")}</option>
                  <option value="CZ">{t("details.czechia")}</option>
                </CountrySelect>
              </CountryPicker>
            )}
          />
          <PhoneNumber>
            <Prefix data-testid="phone-prefix">
              {country === "CZ" ? "+420" : "+421"}
            </Prefix>
            <PhoneInput
              {...phoneRegistration}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              aria-invalid={errors.phone ? "true" : undefined}
              autoComplete="tel-national"
              id="phone"
              inputMode="tel"
              onBlur={(event) => {
                if (!errors.phone?.type?.startsWith("manual-")) {
                  void phoneRegistration.onBlur(event);
                }
              }}
              onChange={handlePhoneChange}
              placeholder="123 321 123"
              required
              type="tel"
              value={phone}
            />
          </PhoneNumber>
        </PhoneControl>
        {errors.phone?.message ? (
          <ErrorMessage id="phone-error" role="alert">
            {errors.phone.message}
          </ErrorMessage>
        ) : null}
      </PhoneField>

      {isSubmitted ? <FormErrorSummary errors={errorItems} /> : null}

      <Actions>
        <Button
          icon={<ArrowLeftIcon />}
          iconPosition="start"
          onClick={onBack}
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
