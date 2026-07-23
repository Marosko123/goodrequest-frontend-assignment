import Link from "next/link";
import styled, { css, keyframes } from "styled-components";

import { nonSelectableControl, visuallyHidden } from "@/styles/fragments";
import { theme } from "@/styles/theme";

const stepPop = keyframes`
  from { transform: scale(0.86); }
  to { transform: scale(1); }
`;

const progressSpin = keyframes`
  to { transform: rotate(360deg); }
`;

export const StepperNav = styled.nav`
  width: 100%;
`;

export const StepList = styled.ol`
  display: flex;
  width: 100%;
  padding: 0;
  margin: 0;
  list-style: none;

  @media (width < 30rem) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export const Step = styled.li`
  position: relative;
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  min-width: 0;
  color: ${theme.colors.text};
  font: ${theme.typography.textMdRegular};

  &[data-status="wait"] {
    color: ${theme.colors.textTertiary};
  }

  &[data-status="error"] {
    color: ${theme.colors.danger};
  }

  &:last-of-type {
    flex: 0 0 auto;
  }

  @media (width >= 30rem) and (width < 37.5rem) {
    font: ${theme.typography.textSmRegular};
  }

  @media (width < 30rem) {
    align-items: flex-start;
    justify-content: center;
    font: ${theme.typography.textSmRegular};
  }
`;

const stepControl = css`
  ${nonSelectableControl}

  position: relative;
  z-index: 1;
  display: inline-flex;
  flex: 0 0 auto;
  gap: ${theme.space[2]};
  align-items: center;
  min-width: max-content;
  padding: 0;
  border: 0;
  border-radius: ${theme.radii.xs};
  background: transparent;
  color: inherit;
  font: inherit;
  text-decoration: none;

  @media (width < 30rem) {
    flex-direction: column;
    gap: ${theme.space[1]};
    width: 100%;
    min-width: 0;
    text-align: center;
  }
`;

export const StepLink = styled(Link)`
  ${stepControl}

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${theme.colors.primaryHover};
    }
  }

  &:active {
    color: ${theme.colors.primaryPressed};
  }
`;

export const StepContent = styled.span`
  ${stepControl}
`;

export const StepDisabled = styled.button`
  ${stepControl}
  cursor: default;
`;

export const StepNumber = styled.span`
  position: relative;
  display: inline-grid;
  flex: 0 0 auto;
  width: ${theme.sizes.controlMd};
  height: ${theme.sizes.controlMd};
  border: 1px solid ${theme.colors.surface};
  border-radius: 50%;
  place-items: center;
  color: ${theme.colors.border};
  background: ${theme.colors.canvas};
  line-height: ${theme.typography.lineHeightTextMd};
  transition:
    background-color ${theme.motion.fast} ${theme.motion.easeStandard},
    border-color ${theme.motion.fast} ${theme.motion.easeStandard},
    color ${theme.motion.fast} ${theme.motion.easeStandard};

  ${Step}[data-status="current"] & {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.inverseContentPrimary};
    background: ${theme.colors.primary};
    animation: ${stepPop} ${theme.motion.base} ${theme.motion.easePlayful} both;
  }

  ${Step}[data-status="finished"] & {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }

  ${Step}[data-status="error"] & {
    border-color: ${theme.colors.danger};
    color: ${theme.colors.danger};
  }

  ${Step}[data-status="in-progress"] & {
    border-color: transparent;
    color: ${theme.colors.inverseContentPrimary};
    background: transparent;

    svg {
      position: absolute;
      inset: -0.25rem;
      overflow: visible;
    }

    [data-vector="progress"] {
      transform-origin: center;
      animation: ${progressSpin} 1.2s linear infinite;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    ${Step}[data-status="current"] & {
      animation: none;
      transform: none;
    }

    ${Step}[data-status="in-progress"] & [data-vector="progress"] {
      animation: none;
    }
  }
`;

export const StepLabel = styled.span`
  overflow: visible;
  white-space: nowrap;
  text-overflow: clip;

  @media (width < 30rem) {
    min-height: 2.5rem;
    white-space: normal;
    overflow-wrap: anywhere;
  }
`;

export const StepLine = styled.span`
  flex: 1 1 2rem;
  min-width: 0.5rem;
  height: 1px;
  margin-inline: ${theme.space[2]} ${theme.space[4]};
  background: ${theme.colors.border};

  @media (width < 30rem) {
    position: absolute;
    z-index: 0;
    top: calc((${theme.sizes.controlMd} - 1px) / 2);
    right: calc(-50% + 1.5rem);
    left: calc(50% + 1.5rem);
    min-width: 0;
    margin: 0;
  }
`;

export const StepStatusText = styled.span`
  ${visuallyHidden}
`;

export const StepperAnnouncement = styled.span`
  ${visuallyHidden}
`;
