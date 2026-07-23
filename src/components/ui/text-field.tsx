import type { ComponentPropsWithRef } from "react";

import { ErrorMessage, Field, Hint, Input, Label } from "./text-field.styles";

// `ComponentPropsWithRef` rather than `InputHTMLAttributes`: React 19 carries
// `ref` in props, so the prop type has to describe it too.
type TextFieldProps = Omit<
  ComponentPropsWithRef<"input">,
  "aria-describedby" | "aria-invalid" | "id"
> & {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  wrapperClassName?: string | undefined;
};

export function TextField({
  error,
  hint,
  id,
  label,
  ref,
  required,
  wrapperClassName,
  ...inputProps
}: TextFieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
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
}
