import type { ComponentProps } from "react";

import { PrimaryActionLinkRoot } from "./primary-action-link.styles";

type PrimaryActionLinkProps = ComponentProps<typeof PrimaryActionLinkRoot>;

export function PrimaryActionLink(props: PrimaryActionLinkProps) {
  return <PrimaryActionLinkRoot {...props} data-ui="primary-action-link" />;
}
