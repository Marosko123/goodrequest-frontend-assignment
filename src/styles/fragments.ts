import { css, keyframes } from "styled-components";

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

export const interactiveControl = css`
  min-height: var(--control-height);
  border-radius: var(--radius-sm);
  transition:
    background-color var(--transition-fast) var(--ease-standard),
    border-color var(--transition-fast) var(--ease-standard),
    box-shadow var(--transition-fast) var(--ease-standard),
    transform var(--transition-fast) var(--ease-standard);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const pressable = css`
  transition:
    background-color var(--motion-fast) var(--ease-standard),
    border-color var(--motion-fast) var(--ease-standard),
    box-shadow var(--motion-fast) var(--ease-standard),
    color var(--motion-fast) var(--ease-standard),
    opacity var(--motion-fast) var(--ease-standard),
    transform var(--motion-instant) var(--ease-enter);

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

    &:hover:not(:disabled),
    &:active:not(:disabled) {
      transform: none;
    }
  }
`;

export const feedbackEnter = css`
  animation: ${feedbackEnterKeyframes} var(--motion-base) var(--ease-enter) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`;
