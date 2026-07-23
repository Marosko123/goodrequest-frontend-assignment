import styled, { keyframes } from "styled-components";

import { pressable } from "@/styles/fragments";
import { theme } from "@/styles/theme";
import { LoadingSpinnerIcon } from "./icons";

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

// Filled variants differ only in their palette, so each one declares the four
// colours it needs and a single shared block applies the state machine.
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
    --button-surface: ${theme.colors.primary};
    --button-surface-hover: ${theme.colors.primaryHover};
    --button-surface-pressed: ${theme.colors.primaryPressed};
    --button-content: ${theme.colors.onAccent};
  }

  &[data-variant="secondary"] {
    --button-surface: ${theme.colors.surface};
    --button-surface-hover: ${theme.colors.surfaceHover};
    --button-surface-pressed: ${theme.colors.surfacePressed};
    --button-content: ${theme.colors.text};
  }

  &[data-variant="destructive"] {
    --button-surface: ${theme.colors.danger};
    --button-surface-hover: ${theme.colors.dangerHover};
    --button-surface-pressed: ${theme.colors.dangerPressed};
    --button-content: ${theme.colors.onAccent};
    --button-focus-ring: ${theme.shadows.focusDanger};
  }

  &[data-variant="primary"],
  &[data-variant="secondary"],
  &[data-variant="destructive"] {
    background: var(--button-surface);
    color: var(--button-content);

    @media (hover: hover) and (pointer: fine) {
      &:hover:not(:disabled) {
        background: var(--button-surface-hover);
      }
    }

    &:active:not(:disabled),
    &:focus-visible {
      background: var(--button-surface-pressed);
    }

    &:focus-visible {
      box-shadow: var(--button-focus-ring, ${theme.shadows.focus});
    }

    &:disabled {
      background: var(--button-surface);
    }
  }

  &[data-variant="link"] {
    min-height: auto;
    padding: 0;
    background: transparent;
    color: ${theme.colors.primary};

    @media (hover: hover) and (pointer: fine) {
      &:hover:not(:disabled) {
        color: ${theme.colors.primaryHover};
        text-decoration: underline;
      }
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
      min-height: ${theme.sizes.tapTarget};
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.32;
  }

  &[data-loading="true"]:disabled {
    cursor: progress;
    opacity: 1;
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
  }

  @media (prefers-reduced-motion: reduce) and (hover: hover) and (pointer: fine) {
    ${ButtonRoot}:hover:not(:disabled) & {
      transform: none;
    }
  }
`;

export const Spinner = styled(LoadingSpinnerIcon)`
  width: ${theme.sizes.iconMd};
  height: ${theme.sizes.iconMd};
  flex: none;
  animation: ${spin} 700ms linear infinite;

  &[data-size="sm"] {
    width: ${theme.sizes.iconSm};
    height: ${theme.sizes.iconSm};
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: none;
  }
`;
