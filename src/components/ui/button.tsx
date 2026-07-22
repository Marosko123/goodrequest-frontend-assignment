import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./button.module.scss";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: ButtonVariant;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: styles.primary!,
  secondary: styles.secondary!,
  danger: styles.danger!,
  ghost: styles.ghost!,
};

export function Button({
  children,
  className,
  disabled,
  icon,
  iconPosition = "end",
  loading = false,
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
