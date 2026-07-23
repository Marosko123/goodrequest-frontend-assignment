"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { ChoiceInput } from "./choice-control.styles";

type ChoiceControlProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  indeterminate?: boolean;
  size?: "sm" | "md";
  type: "checkbox" | "radio";
};

export const ChoiceControl = forwardRef<HTMLInputElement, ChoiceControlProps>(
  function ChoiceControl(
    { className, indeterminate = false, size = "md", type, ...inputProps },
    forwardedRef,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(
      forwardedRef,
      () => inputRef.current as HTMLInputElement,
    );
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <ChoiceInput
        {...inputProps}
        className={className}
        data-indeterminate={indeterminate || undefined}
        data-size={size}
        ref={inputRef}
        type={type}
      />
    );
  },
);
