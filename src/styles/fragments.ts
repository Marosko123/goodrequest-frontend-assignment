import { css, keyframes } from "styled-components";

import { theme } from "./theme";

const feedbackEnterKeyframes = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.25rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const visuallyHidden = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
`;

export const nonSelectableControl = css`
  user-select: none;
`;

export const interactiveControl = css`
  min-height: ${theme.sizes.controlHeight};
  border-radius: ${theme.radii.sm};
  transition:
    background-color ${theme.motion.fast} ${theme.motion.easeStandard},
    border-color ${theme.motion.fast} ${theme.motion.easeStandard},
    box-shadow ${theme.motion.fast} ${theme.motion.easeStandard},
    transform ${theme.motion.fast} ${theme.motion.easeStandard};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const pressable = css`
  transition:
    background-color ${theme.motion.fast} ${theme.motion.easeStandard},
    border-color ${theme.motion.fast} ${theme.motion.easeStandard},
    box-shadow ${theme.motion.fast} ${theme.motion.easeStandard},
    color ${theme.motion.fast} ${theme.motion.easeStandard},
    opacity ${theme.motion.fast} ${theme.motion.easeStandard},
    transform ${theme.motion.instant} ${theme.motion.easeEnter};

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:active:not(:disabled) {
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) and (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      transform: none;
    }
  }
`;

export const feedbackEnter = css`
  animation: ${feedbackEnterKeyframes} ${theme.motion.base}
    ${theme.motion.easeEnter} both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`;

/*
 * Every inline validation message, wherever it renders. Kept in one place
 * because the phone field and the text fields sit on the same screen: when
 * these drifted apart, the same error rendered in two different reds.
 */
export const fieldError = css`
  ${feedbackEnter}

  margin: 0;
  color: ${theme.colors.dangerHover};
  font: ${theme.typography.textSmRegular};
`;
