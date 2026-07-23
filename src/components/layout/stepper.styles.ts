import styled, { keyframes } from "styled-components";

import { theme } from "@/styles/theme";

const stepPop = keyframes`
  from { transform: scale(0.86); }
  to { transform: scale(1); }
`;

const stepCheckDraw = keyframes`
  to { stroke-dashoffset: 0; }
`;

export const StepperNav = styled.nav`
  width: 100%;
  overflow: hidden;
`;

export const StepList = styled.ol`
  display: grid;
  grid-template-columns: 16.75rem 16.75rem minmax(0, 1fr);
  padding: 0;
  margin: 0;
  list-style: none;

  @media (width <= 40rem) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${theme.space[2]};
  }
`;

export const Step = styled.li`
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  gap: ${theme.space[2]};
  align-items: center;
  min-width: 0;
  color: ${theme.colors.textTertiary};
  font: ${theme.typography.textMdRegular};
  transition: color ${theme.motion.fast} ${theme.motion.easeStandard};

  &[data-current],
  &[data-complete] {
    color: ${theme.colors.text};
  }

  &:last-of-type {
    grid-template-columns: auto minmax(0, 1fr);
  }

  @media (width <= 40rem) {
    grid-template-columns: auto minmax(0, 1fr);
    gap: ${theme.space[2]};
    font: ${theme.typography.textSmRegular};
  }
`;

export const StepNumber = styled.span`
  display: inline-grid;
  width: ${theme.sizes.controlMd};
  height: ${theme.sizes.controlMd};
  border: 1px solid ${theme.colors.borderSubtle};
  border-radius: 50%;
  place-items: center;
  color: inherit;
  transition:
    background-color ${theme.motion.fast} ${theme.motion.easeStandard},
    border-color ${theme.motion.fast} ${theme.motion.easeStandard},
    color ${theme.motion.fast} ${theme.motion.easeStandard},
    transform ${theme.motion.base} ${theme.motion.easePlayful};

  ${Step}[data-current] &,
  ${Step}[data-complete] & {
    border-color: ${theme.colors.primary};
  }

  ${Step}[data-current] & {
    background: ${theme.colors.primary};
    color: #fafafa;
    animation: ${stepPop} ${theme.motion.base} ${theme.motion.easePlayful} both;
  }

  ${Step}[data-complete] & {
    background: ${theme.colors.canvas};
    color: ${theme.colors.primary};

    svg {
      width: ${theme.sizes.iconSm};
      height: 0.75rem;
    }

    [data-motion="step-check"] path {
      stroke-dasharray: 22;
      stroke-dashoffset: 0;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    ${Step}[data-complete] & [data-motion="step-check"] path {
      stroke-dashoffset: 22;
      animation: ${stepCheckDraw} ${theme.motion.base} ${theme.motion.easeEnter}
        forwards;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    ${Step}[data-current] & {
      animation: none;
      transform: none;
    }
  }

  @media (width <= 40rem) {
    width: 1.75rem;
    height: 1.75rem;
  }
`;

export const StepLabel = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const StepLine = styled.span`
  width: auto;
  height: 1px;
  margin-inline: ${theme.space[2]} ${theme.space[4]};
  background: ${theme.colors.border};
  transition: background-color ${theme.motion.base} ${theme.motion.easeStandard};

  ${Step}[data-complete] & {
    background: ${theme.colors.primary};
  }

  @media (width <= 40rem) {
    display: none;
  }
`;
