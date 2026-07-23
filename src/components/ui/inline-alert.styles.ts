import styled from "styled-components";

import { feedbackEnter } from "@/styles/fragments";
import { theme } from "@/styles/theme";

export const Alert = styled.div`
  ${feedbackEnter}

  display: flex;
  gap: ${theme.space[4]};
  align-items: flex-start;
  justify-content: space-between;
  padding: ${theme.space[4]};
  border: 1px solid ${theme.colors.borderSubtle};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.surface};

  &[data-tone="error"] {
    border-color: color-mix(in srgb, ${theme.colors.danger} 35%, transparent);
    background: ${theme.colors.dangerSoft};
  }

  &[data-tone="success"] {
    border-color: color-mix(in srgb, ${theme.colors.success} 35%, transparent);
    background: ${theme.colors.successSoft};
  }

  &[data-tone="warning"] {
    border-color: color-mix(in srgb, ${theme.colors.warning} 35%, transparent);
    background: ${theme.colors.warningSoft};
  }
`;

export const AlertTitle = styled.strong`
  display: block;
  margin-block-end: ${theme.space[1]};
  font: ${theme.typography.textMdSemibold};
`;

export const AlertBody = styled.div`
  color: ${theme.colors.textSecondary};
  font: ${theme.typography.textSmRegular};
`;

export const AlertAction = styled.div`
  flex: none;
`;
