import styled from "styled-components";

import { fieldError, interactiveControl } from "@/styles/fragments";
import { theme } from "@/styles/theme";

export const Field = styled.div`
  display: grid;

  /* Keep this field's rows intrinsic when a neighbour grows. */
  align-content: start;
  gap: ${theme.space[1]};
  min-width: 0;
`;

export const Label = styled.label`
  color: ${theme.colors.text};
  font: ${theme.typography.textSmMedium};

  ${Field}:has(input[aria-invalid="true"]) & {
    color: ${theme.colors.dangerHover};
  }
`;

export const Input = styled.input`
  ${interactiveControl}

  width: 100%;
  min-width: 0;
  padding: 0 ${theme.space[4]};
  border: 1px solid transparent;
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  font: ${theme.typography.textMdRegular};
  user-select: text;

  &::placeholder {
    color: ${theme.colors.textTertiary};
    opacity: 1;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      background: ${theme.colors.surfaceHover};
    }
  }

  &:active:not(:disabled) {
    background: ${theme.colors.surfacePressed};
  }

  &:focus-visible {
    border-color: ${theme.colors.primaryPressed};
    background: ${theme.colors.canvas};
    box-shadow: ${theme.shadows.focus};
    outline: none;
  }

  &[aria-invalid="true"] {
    border-color: ${theme.colors.dangerHover};
    background: ${theme.colors.dangerSoft};
  }

  &:disabled {
    color: ${theme.colors.textMuted};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

export const Hint = styled.p`
  margin: 0;
  color: ${theme.colors.textSecondary};
  font: ${theme.typography.textSmRegular};
`;

export const ErrorMessage = styled.p`
  ${fieldError}
`;
