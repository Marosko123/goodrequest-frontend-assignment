"use client";

import type { TFunction } from "i18next";
import {
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import type { UseFormClearErrors, UseFormReturn } from "react-hook-form";

import type { DonorDetails, PhoneCountry } from "@/domain/donation";

import {
  detectPhoneCountry,
  formatPhoneInput,
  getCountryFromPhoneDialCode,
  getPhoneCaretIndex,
  getPhoneDialCode,
  getPhoneErrorMessage,
} from "./phone";
import type { DetailsFormValues } from "./schema";

type DetailsForm = UseFormReturn<DetailsFormValues, unknown, DonorDetails>;

function countDigits(value: string): number {
  return value.replace(/\D/gu, "").length;
}

/**
 * Owns the two-input phone control: the editable dial code and the national
 * number stay in sync with the selected country, an international prefix typed
 * or pasted into either input re-detects the country, and the caret keeps its
 * position across reformatting.
 *
 * Errors raised here are typed `manual-<code>` so the form can retranslate them
 * on a language switch without discarding them.
 */
export function usePhoneField(
  form: DetailsForm,
  phone: string,
  phoneDialCode: string,
  country: PhoneCountry,
  t: TFunction,
) {
  const { clearErrors, setError, setValue } = form;
  const { errors } = form.formState;
  const dialCodeInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const pendingCaret = useRef<number | null>(null);

  // Reformatting rewrites the value, so the caret has to be restored against the
  // digit offset captured before the edit rather than the raw string index.
  useLayoutEffect(() => {
    const phoneInput = phoneInputRef.current;
    if (
      pendingCaret.current === null ||
      !phoneInput ||
      document.activeElement !== phoneInput
    ) {
      return;
    }

    const caret = getPhoneCaretIndex(phone, pendingCaret.current);
    phoneInput.setSelectionRange(caret, caret);
    pendingCaret.current = null;
  }, [phone]);

  function focusPhone(caret = 0) {
    phoneInputRef.current?.focus();
    phoneInputRef.current?.setSelectionRange(caret, caret);
  }

  function applyPhoneValue(rawValue: string, digitOffset: number) {
    const result = formatPhoneInput(rawValue, country);

    if (!result.accepted) {
      setError("phone", {
        type: `manual-${result.code}`,
        message: getPhoneErrorMessage(result.code, t),
      });
      return;
    }

    const detectedCountry = detectPhoneCountry(rawValue);
    if (detectedCountry) {
      setValue("phoneCountry", detectedCountry, { shouldDirty: true });
      setValue("phoneDialCode", getPhoneDialCode(detectedCountry), {
        shouldDirty: true,
        shouldValidate: Boolean(errors.phoneDialCode),
      });
      clearErrors("phoneDialCode");
    }

    pendingCaret.current = detectedCountry
      ? countDigits(result.value)
      : digitOffset;
    setValue("phone", result.value, {
      shouldDirty: true,
      shouldValidate: Boolean(errors.phone),
    });
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    const caret = event.target.selectionStart ?? event.target.value.length;
    applyPhoneValue(
      event.target.value,
      countDigits(event.target.value.slice(0, caret)),
    );
  }

  function handleDialCodeChange(event: ChangeEvent<HTMLInputElement>) {
    const nextDialCode = event.target.value;
    if (!/^\d{0,3}$/u.test(nextDialCode)) {
      setError("phoneDialCode", {
        type: "manual-characters",
        message: getPhoneErrorMessage("characters", t),
      });
      return;
    }

    setValue("phoneDialCode", nextDialCode, {
      shouldDirty: true,
      shouldValidate: Boolean(errors.phoneDialCode),
    });

    const nextCountry = getCountryFromPhoneDialCode(nextDialCode);
    if (nextCountry) {
      setValue("phoneCountry", nextCountry, { shouldDirty: true });
      clearErrors("phoneDialCode");
      focusPhone();
      return;
    }

    // Two digits could still become a supported prefix, so only a complete
    // three-digit code is reported as unsupported.
    if (nextDialCode.length === 3) {
      setError("phoneDialCode", {
        type: "manual-unsupportedCountry",
        message: getPhoneErrorMessage("unsupportedCountry", t),
      });
    }
  }

  function handleDialCodePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pastedValue = event.clipboardData.getData("text");
    const detectedCountry = detectPhoneCountry(pastedValue);
    if (!detectedCountry) {
      return;
    }

    event.preventDefault();
    const result = formatPhoneInput(pastedValue, detectedCountry);
    if (!result.accepted) {
      setError("phoneDialCode", {
        type: `manual-${result.code}`,
        message: getPhoneErrorMessage(result.code, t),
      });
      return;
    }

    setValue("phoneCountry", detectedCountry, { shouldDirty: true });
    setValue("phoneDialCode", getPhoneDialCode(detectedCountry), {
      shouldDirty: true,
      shouldValidate: Boolean(errors.phoneDialCode),
    });
    clearErrors(["phoneDialCode", "phone"] as Parameters<
      UseFormClearErrors<DetailsFormValues>
    >[0]);
    pendingCaret.current = countDigits(result.value);
    focusPhone();
    setValue("phone", result.value, {
      shouldDirty: true,
      shouldValidate: Boolean(errors.phone),
    });
  }

  function handleDialCodeKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    if (
      event.key === "ArrowRight" &&
      input.selectionStart === input.selectionEnd &&
      input.selectionEnd === input.value.length
    ) {
      event.preventDefault();
      focusPhone();
    }
  }

  function focusDialCodeEnd(value: string) {
    dialCodeInputRef.current?.focus();
    dialCodeInputRef.current?.setSelectionRange(value.length, value.length);
  }

  function handlePhoneKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const selectionStart = input.selectionStart ?? 0;
    const selectionEnd = input.selectionEnd ?? selectionStart;
    if (selectionStart !== selectionEnd) {
      return;
    }

    // The two inputs read as one field, so the caret crosses between them.
    if (selectionStart === 0 && event.key === "ArrowLeft") {
      event.preventDefault();
      focusDialCodeEnd(phoneDialCode);
      return;
    }

    if (selectionStart === 0 && event.key === "Backspace") {
      event.preventDefault();
      const nextDialCode = phoneDialCode.slice(0, -1);
      setValue("phoneDialCode", nextDialCode, { shouldDirty: true });
      focusDialCodeEnd(nextDialCode);
      return;
    }

    // Backspace on a formatting space deletes the digit before it instead.
    if (
      event.key === "Backspace" &&
      selectionStart > 0 &&
      /\D/u.test(input.value[selectionStart - 1] ?? "")
    ) {
      event.preventDefault();
      let digitIndex = selectionStart - 2;
      while (digitIndex >= 0 && /\D/u.test(input.value[digitIndex] ?? "")) {
        digitIndex -= 1;
      }
      if (digitIndex >= 0) {
        const nextValue =
          input.value.slice(0, digitIndex) + input.value.slice(digitIndex + 1);
        applyPhoneValue(
          nextValue,
          countDigits(input.value.slice(0, digitIndex)),
        );
      }
    }
  }

  function handleCountryChange(
    nextCountry: PhoneCountry,
    onChange: (value: PhoneCountry) => void,
  ) {
    onChange(nextCountry);
    setValue("phoneDialCode", getPhoneDialCode(nextCountry), {
      shouldDirty: true,
      shouldValidate: Boolean(errors.phoneDialCode),
    });
    clearErrors("phoneDialCode");
    const formatted = formatPhoneInput(phone, nextCountry);
    if (formatted.accepted) {
      setValue("phone", formatted.value, {
        shouldDirty: true,
        shouldValidate: Boolean(errors.phone),
      });
    }
  }

  return {
    dialCodeInputRef,
    phoneInputRef,
    handleCountryChange,
    handleDialCodeChange,
    handleDialCodeKeyDown,
    handleDialCodePaste,
    handlePhoneChange,
    handlePhoneKeyDown,
  };
}
