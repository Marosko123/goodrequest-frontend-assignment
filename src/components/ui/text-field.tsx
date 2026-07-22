import { forwardRef, type InputHTMLAttributes } from "react";

import styles from "./text-field.module.scss";

type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "aria-describedby" | "aria-invalid" | "id"
> & {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  wrapperClassName?: string | undefined;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { error, hint, id, label, required, wrapperClassName, ...inputProps },
    ref,
  ) {
    const describedBy = [
      hint ? `${id}-hint` : null,
      error ? `${id}-error` : null,
    ]
      .filter(Boolean)
      .join(" ");
    const wrapperClasses = [styles.field, wrapperClassName]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClasses}>
        <label className={styles.label} htmlFor={id}>
          {label}
          {required ? (
            <span aria-hidden="true" className={styles.required}>
              *
            </span>
          ) : null}
        </label>
        <input
          {...inputProps}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? "true" : undefined}
          className={styles.input}
          id={id}
          ref={ref}
          required={required}
        />
        {hint ? (
          <p className={styles.hint} id={`${id}-hint`}>
            {hint}
          </p>
        ) : null}
        {error ? (
          <p className={styles.error} id={`${id}-error`} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
