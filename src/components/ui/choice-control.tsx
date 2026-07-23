"use client";

import { type ComponentPropsWithRef, useEffect, useRef } from "react";

import { ChoiceInput } from "./choice-control.styles";

type ChoiceControlBaseProps = Omit<
  ComponentPropsWithRef<"input">,
  "size" | "type"
> & {
  size?: "sm" | "md";
};

type ChoiceControlProps = ChoiceControlBaseProps &
  (
    | { indeterminate?: boolean; type: "checkbox" }
    | { indeterminate?: never; type: "radio" }
  );

export function ChoiceControl({
  className,
  indeterminate = false,
  ref: forwardedRef,
  size = "md",
  type,
  ...inputProps
}: ChoiceControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <ChoiceInput
      {...inputProps}
      className={className}
      data-size={size}
      ref={(node) => {
        inputRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
          return;
        }
        if (forwardedRef) {
          forwardedRef.current = node;
        }
      }}
      type={type}
    />
  );
}
