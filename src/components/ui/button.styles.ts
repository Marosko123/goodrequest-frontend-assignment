import styled, { keyframes } from "styled-components";

import { pressable } from "@/styles/fragments";
import { theme } from "@/styles/theme";

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const ButtonRoot = styled.button`
  ${pressable}

  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: ${theme.radii.sm};
  font: ${theme.typography.textMdMedium};
  cursor: pointer;
  user-select: none;

  &[data-size="sm"] {
    min-height: ${theme.sizes.controlSm};
    gap: ${theme.space[1]};
    padding: 2px ${theme.space[2]};
    border-radius: ${theme.radii.xs};
    font: ${theme.typography.textSmMedium};
  }

  &[data-size="md"] {
    min-height: ${theme.sizes.controlMd};
    gap: ${theme.space[1]};
    padding: ${theme.space[1]} ${theme.space[3]};
  }

  &[data-size="lg"] {
    min-height: ${theme.sizes.controlLg};
    gap: ${theme.space[2]};
    padding: ${theme.space[3]} ${theme.space[6]};
  }

  &[data-size="xl"] {
    min-height: ${theme.sizes.controlXl};
    gap: ${theme.space[2]};
    padding: ${theme.space[4]} ${theme.space[8]};
  }

  &[data-variant="primary"] {
    background: ${theme.colors.primary};
    color: #fff;

    &:hover:not(:disabled) {
      background: ${theme.colors.primaryHover};
    }

    &:active:not(:disabled),
    &:focus-visible {
      background: ${theme.colors.primaryPressed};
    }

    &:focus-visible {
      box-shadow: ${theme.shadows.focus};
    }

    &:disabled {
      background: ${theme.colors.primary};
    }
  }

  &[data-variant="secondary"] {
    background: ${theme.colors.surface};
    color: ${theme.colors.text};

    &:hover:not(:disabled) {
      background: ${theme.colors.surfaceHover};
    }

    &:active:not(:disabled),
    &:focus-visible {
      background: ${theme.colors.surfacePressed};
    }

    &:focus-visible {
      box-shadow: ${theme.shadows.focus};
    }

    &:disabled {
      background: ${theme.colors.surface};
    }
  }

  &[data-variant="destructive"] {
    background: ${theme.colors.danger};
    color: #fff;

    &:hover:not(:disabled) {
      background: ${theme.colors.dangerHover};
    }

    &:active:not(:disabled),
    &:focus-visible {
      background: ${theme.colors.dangerPressed};
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px rgb(159 18 57 / 24%);
    }

    &:disabled {
      background: ${theme.colors.danger};
    }
  }

  &[data-variant="link"] {
    min-height: auto;
    padding: 0;
    background: transparent;
    color: ${theme.colors.primary};

    &:hover:not(:disabled) {
      color: ${theme.colors.primaryHover};
      text-decoration: underline;
    }

    &:active:not(:disabled),
    &:focus-visible {
      color: ${theme.colors.primaryPressed};
    }

    &:focus-visible {
      box-shadow: ${theme.shadows.focus};
    }

    &:disabled {
      color: ${theme.colors.primary};
    }

    @media (pointer: coarse) {
      min-height: 2.75rem;
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.32;
  }

  &:focus-visible {
    outline: none;
  }
`;

export const IconSlot = styled.span`
  display: inline-grid;
  flex: none;
  place-items: center;
  width: ${theme.sizes.iconMd};
  height: ${theme.sizes.iconMd};
  transition: transform ${theme.motion.fast} ${theme.motion.easeEnter};

  ${ButtonRoot}[data-size="sm"] & {
    width: ${theme.sizes.iconSm};
    height: ${theme.sizes.iconSm};
  }

  @media (hover: hover) and (pointer: fine) {
    ${ButtonRoot}:hover:not(:disabled) &[data-position="start"] {
      transform: translateX(-2px);
    }

    ${ButtonRoot}:hover:not(:disabled) &[data-position="end"] {
      transform: translateX(2px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    ${ButtonRoot}:hover:not(:disabled) & {
      transform: none;
    }
  }
`;

export const Spinner = styled.span`
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid currentcolor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ${spin} 700ms linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: none;
  }
`;
