"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";

import {
  Chevron,
  Control,
  ErrorMessage,
  Field,
  Label,
  Select,
} from "./select-field.styles";

type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children" | "onChange" | "value"
> & {
  data: readonly SelectOption[];
  label: string;
  error?: string | undefined;
  onChange: (value: string | null) => void;
  placeholder: string;
  value?: string | null | undefined;
};

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    {
      data,
      error,
      id,
      label,
      onChange,
      placeholder,
      required,
      value,
      ...selectProps
    },
    ref,
  ) {
    const errorId = `${id}-error`;

    return (
      <Field>
        <Label htmlFor={id}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </Label>
        <Control>
          <Select
            {...selectProps}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? "true" : undefined}
            data-empty={!value || undefined}
            data-size="xl"
            id={id}
            onChange={(event) => onChange(event.target.value || null)}
            ref={ref}
            required={required}
            value={value ?? ""}
          >
            <option disabled value="">
              {placeholder}
            </option>
            {data.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Chevron />
        </Control>
        {error ? (
          <ErrorMessage id={errorId} role="alert">
            {error}
          </ErrorMessage>
        ) : null}
      </Field>
    );
  },
);
