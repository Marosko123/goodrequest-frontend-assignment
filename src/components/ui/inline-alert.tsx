import type { ReactNode } from "react";

import styles from "./inline-alert.module.scss";

type AlertTone = "error" | "info" | "success" | "warning";

export function InlineAlert({
  children,
  title,
  tone = "info",
  action,
}: {
  children: ReactNode;
  title: string;
  tone?: AlertTone;
  action?: ReactNode;
}) {
  return (
    <div
      className={styles.alert}
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      <div>
        <strong className={styles.title}>{title}</strong>
        <div className={styles.body}>{children}</div>
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
