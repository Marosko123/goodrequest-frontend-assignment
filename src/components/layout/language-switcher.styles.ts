import styled from "styled-components";

import { theme } from "@/styles/theme";

export const Switcher = styled.nav`
  position: fixed;
  z-index: 20;
  top: calc(${theme.layout.donationMediaInset} + ${theme.space[4]});
  right: calc(${theme.layout.donationMediaInset} + ${theme.space[4]});
  display: inline-flex;
  gap: ${theme.space[1]};
  padding: ${theme.space[1]};
  border: 1px solid ${theme.colors.borderSubtle};
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.canvas};

  @media (width <= 56rem) {
    top: ${theme.space[4]};
    right: ${theme.space[4]};
  }
`;

export const LocaleOption = styled.button`
  min-width: 2.25rem;
  min-height: 2rem;
  padding: ${theme.space[1]} ${theme.space[2]};
  border: 0;
  border-radius: ${theme.radii.xs};
  background: transparent;
  color: ${theme.colors.textTertiary};
  font: ${theme.typography.textSmMedium};
  cursor: pointer;
  transition:
    color ${theme.motion.transitionFast} ${theme.motion.easeStandard},
    background ${theme.motion.transitionFast} ${theme.motion.easeStandard};

  &:hover {
    color: ${theme.colors.primary};
    background: ${theme.colors.primarySoft};
  }

  &[data-active] {
    background: ${theme.colors.primary};
    color: ${theme.colors.canvas};
    cursor: default;
  }

  @media (pointer: coarse) {
    min-width: 2.75rem;
    min-height: 2.75rem;
  }
`;
