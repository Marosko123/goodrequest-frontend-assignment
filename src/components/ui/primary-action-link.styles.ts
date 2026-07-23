import Link from "next/link";
import styled from "styled-components";

import { pressable } from "@/styles/fragments";
import { theme } from "@/styles/theme";

export const PrimaryActionLinkRoot = styled(Link)`
  ${pressable}

  display: inline-flex;
  min-height: ${theme.sizes.controlXl};
  align-items: center;
  justify-content: center;
  gap: ${theme.space[2]};
  padding: ${theme.space[4]} ${theme.space[8]};
  border: 1px solid transparent;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.primary};
  color: ${theme.colors.onAccent};
  font: ${theme.typography.textMdMedium};
  text-align: center;
  text-decoration: none;
  user-select: none;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: ${theme.colors.primaryHover};
    }
  }

  &:active,
  &:focus-visible {
    background: ${theme.colors.primaryPressed};
  }

  &:focus-visible {
    outline: 0;
    box-shadow: ${theme.shadows.focus};
  }
`;
