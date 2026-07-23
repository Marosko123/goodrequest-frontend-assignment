import type { ButtonHTMLAttributes, ReactNode } from "react";

import { ButtonRoot, IconSlot, Spinner } from "./button.styles";

type ButtonVariant = "primary" | "secondary" | "destructive" | "link";
type ButtonSize = "sm" | "md" | "lg" | "xl";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: ReactNode;
  variant?: ButtonVariant;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  size?: ButtonSize;
};

export function Button({
  children,
  className,
  disabled,
  icon,
  iconPosition = "end",
  loading = false,
  loadingLabel,
  size = "xl",
  type = "button",
  variant = "primary",
  ...buttonProps
}: ButtonProps) {
  return (
    <ButtonRoot
      {...buttonProps}
      aria-busy={loading || undefined}
      className={className}
      data-loading={loading || undefined}
      data-size={size}
      data-variant={variant}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <Spinner data-size={size === "sm" ? "sm" : "md"} /> : null}
      {!loading && icon && iconPosition === "start" ? (
        <IconSlot aria-hidden="true" data-position="start">
          {icon}
        </IconSlot>
      ) : null}
      <span>{loading ? (loadingLabel ?? children) : children}</span>
      {!loading && icon && iconPosition === "end" ? (
        <IconSlot aria-hidden="true" data-position="end">
          {icon}
        </IconSlot>
      ) : null}
    </ButtonRoot>
  );
}
