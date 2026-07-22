"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import styles from "./choice-control.module.scss";

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
      <input
        {...inputProps}
        className={[styles.control, className].filter(Boolean).join(" ")}
        data-indeterminate={indeterminate || undefined}
        data-size={size}
        ref={inputRef}
        type={type}
      />
    );
  },
);
