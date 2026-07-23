import type { ReactNode } from "react";

import { AlertCircleIcon } from "./icons";
import {
  Alert,
  AlertAction,
  AlertBody,
  AlertCopy,
  FeaturedIcon,
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
      aria-atomic="true"
      aria-label={title}
      aria-live={tone === "error" ? "assertive" : "polite"}
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      <FeaturedIcon aria-hidden="true" data-featured-icon data-tone={tone}>
        <AlertCircleIcon />
      </FeaturedIcon>
      <AlertCopy>
        <AlertTitle>{title}</AlertTitle>
        <AlertBody>{children}</AlertBody>
      </AlertCopy>
      {action ? <AlertAction>{action}</AlertAction> : null}
    </Alert>
  );
}
