import styled from "styled-components";

import { feedbackEnter } from "@/styles/fragments";
import { theme } from "@/styles/theme";

// Rose 300 at 10%, the Figma tint behind the error glyph. It is the one step
// of the danger ramp the palette does not carry, and it is decorative only —
// the glyph on top is what has to meet contrast.
const roseTint = "rgb(253 164 175 / 10%)";

export const Alert = styled.div`
  ${feedbackEnter}

  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr) auto;
  gap: ${theme.space[4]};
  align-items: flex-start;
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

  @media (width <= 38rem) {
    grid-template-columns: 2.5rem minmax(0, 1fr);
  }
`;

export const FeaturedIcon = styled.span`
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: ${theme.radii.sm};
  background: color-mix(
    in srgb,
    ${theme.colors.primaryDisabled} 10%,
    transparent
  );
  color: ${theme.colors.primary};

  &[data-tone="error"] {
    background: ${roseTint};
    color: ${theme.colors.danger};
  }

  &[data-tone="warning"] {
    background: ${theme.colors.warningSoft};
    color: ${theme.colors.warning};
  }

  &[data-tone="success"] {
    background: ${theme.colors.successSoft};
    color: ${theme.colors.success};
  }

  svg {
    width: ${theme.sizes.iconMd};
    height: ${theme.sizes.iconMd};
  }
`;

export const AlertCopy = styled.div`
  min-width: 0;
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

  @media (width <= 38rem) {
    grid-column: 2;
  }
`;
