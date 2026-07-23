"use client";

import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useLazyZodResolver } from "@/lib/validation/use-lazy-zod-resolver";

import { useDonationStepStatus } from "@/components/layout/donation-progress-context";
import { Button } from "@/components/ui/button";
import { Dropdown, type DropdownOption } from "@/components/ui/dropdown";
import {
  FormErrorSummary,
  type FormErrorItem,
} from "@/components/ui/form-error-summary";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CountryFlag,
} from "@/components/ui/icons";
import { TextField } from "@/components/ui/text-field";
import type { DonorDetails, PhoneCountry } from "@/domain/donation";
import type { DonorDraft } from "@/features/donation-flow/state";
import type { DonationRoutePrefetchIntent } from "@/lib/navigation/use-donation-route-prefetch";

import {
  formatPhoneInput,
  getPhoneDialCode,
  getPhoneErrorMessage,
  type PhoneErrorCode,
} from "./phone";
import type { DetailsFormValues } from "./schema";
import { usePhoneField } from "./use-phone-field";
import {
  Actions,
  CountryPicker,
  ErrorMessage,
  Form,
  NameGrid,
  PhoneControl,
  PhoneDialCodeInput,
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
    return {
      ...initialDraft,
      phoneDialCode:
        initialDraft.phoneDialCode ??
        getPhoneDialCode(initialDraft.phoneCountry),
    };
  }

  const phoneCountry = initialValue?.phoneCountry ?? "SK";
  const formattedPhone = initialValue
    ? formatPhoneInput(initialValue.phoneE164, phoneCountry)
    : null;

  return {
    firstName: initialValue?.firstName ?? "",
    lastName: initialValue?.lastName ?? "",
    email: initialValue?.email ?? "",
    phoneDialCode: getPhoneDialCode(phoneCountry),
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
  nextStepPrefetch,
}: {
  initialDraft?: DonorDraft;
  initialValue?: DonorDetails;
  onBack: () => void;
  onComplete: (donor: DonorDetails) => void;
  onDraftChange?: (draft: DonorDraft) => void;
  nextStepPrefetch?: DonationRoutePrefetchIntent;
}) {
  const { i18n, t } = useTranslation();
  const phoneCountryOptions = useMemo<readonly DropdownOption<PhoneCountry>[]>(
    () => [
      {
        value: "SK",
        label: t("details.slovakia"),
        leadingVisual: <CountryFlag country="SK" />,
        triggerContent: <CountryFlag country="SK" />,
      },
      {
        value: "CZ",
        label: t("details.czechia"),
        leadingVisual: <CountryFlag country="CZ" />,
        triggerContent: <CountryFlag country="CZ" />,
      },
    ],
    [t],
  );
  const resolver = useLazyZodResolver<DetailsFormValues, DonorDetails>(
    async () => (await import("./schema")).createDetailsSchema(t),
  );
  const form = useForm<DetailsFormValues, unknown, DonorDetails>({
    defaultValues: getDefaultValues(initialDraft, initialValue),
    resolver,
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });
  const {
    control,
    formState: { errors, isSubmitted },
    handleSubmit,
    register,
    setError,
    setFocus,
    subscribe,
    trigger,
  } = form;
  const country = useWatch({ control, name: "phoneCountry" });
  const phoneDialCode = useWatch({ control, name: "phoneDialCode" });
  const phone = useWatch({ control, name: "phone" });
  const {
    dialCodeInputRef,
    phoneInputRef,
    handleCountryChange,
    handleDialCodeChange,
    handleDialCodeKeyDown,
    handleDialCodePaste,
    handlePhoneChange,
    handlePhoneKeyDown,
  } = usePhoneField(form, phone, phoneDialCode, country, t);
  const previousLanguage = useRef(i18n.resolvedLanguage);
  const phoneDialCodeRegistration = register("phoneDialCode");
  const phoneRegistration = register("phone");
  const phoneError = errors.phoneDialCode?.message ?? errors.phone?.message;
  const errorItems: FormErrorItem[] = [
    ["first-name", t("details.firstName"), errors.firstName?.message],
    ["last-name", t("details.lastName"), errors.lastName?.message],
    ["email", t("details.email"), errors.email?.message],
    [
      errors.phoneDialCode ? "phone-dial-code" : "phone",
      t("details.phone"),
      phoneError,
    ],
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
  useDonationStepStatus(2, hasErrors ? "error" : "current");

  useEffect(() => {
    if (previousLanguage.current === i18n.resolvedLanguage) {
      return;
    }

    previousLanguage.current = i18n.resolvedLanguage;
    if (isSubmitted || hasErrors) {
      const manualPhoneFields = (["phoneDialCode", "phone"] as const).filter(
        (fieldName) => errors[fieldName]?.type?.startsWith("manual-"),
      );

      for (const fieldName of manualPhoneFields) {
        const manualType = errors[fieldName]?.type;
        if (!manualType) {
          continue;
        }
        const code = manualType.slice("manual-".length) as PhoneErrorCode;
        setError(fieldName, {
          type: manualType,
          message: getPhoneErrorMessage(code, t),
        });
      }

      const fieldsToValidate = (
        Object.keys(errors) as (keyof DetailsFormValues)[]
      ).filter((fieldName) => !manualPhoneFields.includes(fieldName as never));
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

  return (
    <Form
      noValidate
      onSubmit={handleSubmit(
        (donor) => onComplete(donor),
        (validationErrors) => {
          const firstInvalid = (
            [
              "firstName",
              "lastName",
              "email",
              "phoneDialCode",
              "phone",
            ] as const
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
          <Controller
            control={control}
            name="phoneCountry"
            render={({ field }) => (
              <CountryPicker>
                <Dropdown
                  ariaLabel={t("details.phoneCountry")}
                  id="phone-country"
                  listboxLabel={t("details.phoneCountry")}
                  name={field.name}
                  onBlur={field.onBlur}
                  onValueChange={(value) =>
                    handleCountryChange(value, field.onChange)
                  }
                  options={phoneCountryOptions}
                  ref={field.ref}
                  tone="surface"
                  value={field.value}
                  variant="compact"
                />
              </CountryPicker>
            )}
          />
          <PhoneNumber>
            <Prefix data-testid="phone-prefix">+</Prefix>
            <PhoneDialCodeInput
              {...phoneDialCodeRegistration}
              aria-describedby={
                errors.phoneDialCode ? "phone-error" : undefined
              }
              aria-invalid={errors.phoneDialCode ? "true" : undefined}
              aria-label={t("details.phoneDialCode")}
              autoComplete="tel-country-code"
              id="phone-dial-code"
              inputMode="numeric"
              maxLength={3}
              onBlur={(event) => {
                if (!errors.phoneDialCode?.type?.startsWith("manual-")) {
                  void phoneDialCodeRegistration.onBlur(event);
                }
              }}
              onChange={handleDialCodeChange}
              onKeyDown={handleDialCodeKeyDown}
              onPaste={handleDialCodePaste}
              ref={(node) => {
                phoneDialCodeRegistration.ref(node);
                dialCodeInputRef.current = node;
              }}
              required
              type="tel"
              value={phoneDialCode}
            />
            <PhoneInput
              {...phoneRegistration}
              aria-describedby={phoneError ? "phone-error" : undefined}
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
              onKeyDown={handlePhoneKeyDown}
              placeholder="123 321 123"
              ref={(node) => {
                phoneRegistration.ref(node);
                phoneInputRef.current = node;
              }}
              required
              type="tel"
              value={phone}
            />
          </PhoneNumber>
        </PhoneControl>
        {phoneError ? (
          <ErrorMessage id="phone-error" role="alert">
            {phoneError}
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
        <Button {...nextStepPrefetch} icon={<ArrowRightIcon />} type="submit">
          {t("common.continue")}
        </Button>
      </Actions>
    </Form>
  );
}
