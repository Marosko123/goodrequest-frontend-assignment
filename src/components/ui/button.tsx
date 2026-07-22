import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./button.module.scss";

type ButtonVariant = "primary" | "secondary" | "destructive" | "link";
type ButtonSize = "sm" | "md" | "lg" | "xl";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: ButtonVariant;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: styles.primary!,
  secondary: styles.secondary!,
  destructive: styles.destructive!,
  link: styles.link!,
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
  const classes = [styles.button, variantClasses[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...buttonProps}
      aria-busy={loading || undefined}
      className={classes}
      data-size={size}
      data-variant={variant}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <span aria-hidden="true" className={styles.spinner} /> : null}
      {!loading && icon && iconPosition === "start" ? (
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
      {!loading && icon && iconPosition === "end" ? (
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
      ) : null}
    </button>
  );
}
