import { forwardRef, type InputHTMLAttributes } from "react";

import { ErrorMessage, Field, Hint, Input, Label } from "./text-field.styles";

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
    return (
      <Field className={wrapperClassName}>
        <Label htmlFor={id}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </Label>
        <Input
          {...inputProps}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? "true" : undefined}
          data-size="xl"
          id={id}
          ref={ref}
          required={required}
        />
        {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
        {error ? (
          <ErrorMessage id={`${id}-error`} role="alert">
            {error}
          </ErrorMessage>
        ) : null}
      </Field>
    );
  },
);
