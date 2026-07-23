import type { ButtonHTMLAttributes, ReactNode } from "react";

import { ButtonRoot, IconSlot, Spinner } from "./button.styles";

type ButtonVariant = "primary" | "secondary" | "destructive" | "link";
type ButtonSize = "sm" | "md" | "lg" | "xl";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
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
      data-size={size}
      data-variant={variant}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <Spinner aria-hidden="true" /> : null}
      {!loading && icon && iconPosition === "start" ? (
        <IconSlot aria-hidden="true" data-position="start">
          {icon}
        </IconSlot>
      ) : null}
      <span>{children}</span>
      {!loading && icon && iconPosition === "end" ? (
        <IconSlot aria-hidden="true" data-position="end">
          {icon}
        </IconSlot>
      ) : null}
    </ButtonRoot>
  );
}
