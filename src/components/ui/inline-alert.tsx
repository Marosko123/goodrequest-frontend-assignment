import type { ReactNode } from "react";

import {
  Alert,
  AlertAction,
  AlertBody,
  AlertTitle,
} from "./inline-alert.styles";

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
    <Alert
      aria-label={title}
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      <div>
        <AlertTitle>{title}</AlertTitle>
        <AlertBody>{children}</AlertBody>
      </div>
      {action ? <AlertAction>{action}</AlertAction> : null}
    </Alert>
  );
}
