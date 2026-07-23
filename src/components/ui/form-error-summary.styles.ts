import styled from "styled-components";

import { feedbackEnter } from "@/styles/fragments";
import { theme } from "@/styles/theme";

// Text colour is dangerHover, not danger: the list is 14px body text on the
// soft tint, where danger reaches only 3.9:1. It also matches the field errors
// this summary links to.
export const Summary = styled.section`
  ${feedbackEnter}

  padding: ${theme.space[4]};
  border: 1px solid color-mix(in srgb, ${theme.colors.danger} 35%, transparent);
  border-radius: ${theme.radii.md};
  background: ${theme.colors.dangerSoft};
  color: ${theme.colors.dangerHover};
`;

export const SummaryTitle = styled.h2`
  margin: 0 0 ${theme.space[2]};
  color: inherit;
  font: ${theme.typography.textMdSemibold};
`;

export const ErrorList = styled.ul`
  display: grid;
  gap: ${theme.space[1]};
  padding-inline-start: ${theme.space[5]};
  margin: 0;
  font: ${theme.typography.textSmRegular};

  a {
    @media (pointer: coarse) {
      display: inline-flex;
      min-height: ${theme.sizes.tapTarget};
      align-items: center;
    }
  }
`;
