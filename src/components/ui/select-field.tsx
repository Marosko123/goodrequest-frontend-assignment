"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";

import { ChevronDownIcon } from "./icons";
import styles from "./select-field.module.scss";

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
      <div className={styles.field}>
        <label className={styles.label} htmlFor={id}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
        <span className={styles.control}>
          <select
            {...selectProps}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? "true" : undefined}
            className={styles.input}
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
          </select>
          <ChevronDownIcon className={styles.chevron} />
        </span>
        {error ? (
          <p className={styles.error} id={errorId}>
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
