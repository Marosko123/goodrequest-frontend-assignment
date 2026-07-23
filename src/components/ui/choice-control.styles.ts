import styled from "styled-components";

import { theme } from "@/styles/theme";

export const ChoiceInput = styled.input`
  position: relative;
  display: inline-grid;
  flex: none;
  padding: 0;
  margin: 0;
  appearance: none;
  border: 1px solid ${theme.colors.textMuted};
  background: ${theme.colors.canvas};
  cursor: pointer;
  place-items: center;
  transition:
    background-color ${theme.motion.fast} ${theme.motion.easeStandard},
    border-color ${theme.motion.fast} ${theme.motion.easeStandard},
    box-shadow ${theme.motion.fast} ${theme.motion.easeStandard},
    color ${theme.motion.fast} ${theme.motion.easeStandard},
    transform ${theme.motion.instant} ${theme.motion.easeEnter};

  &[data-size="sm"] {
    width: ${theme.sizes.iconSm};
    height: ${theme.sizes.iconSm};
    border-radius: ${theme.radii.xs};
  }

  &[data-size="md"] {
    width: ${theme.sizes.iconMd};
    height: ${theme.sizes.iconMd};
    border-radius: 0.375rem;
  }

  &[type="radio"] {
    border-radius: 50%;
  }

  &::after {
    display: block;
    width: 54%;
    height: 30%;
    border-width: 0 0 2px 2px;
    border-style: solid;
    border-color: currentcolor;
    content: "";
    opacity: 0;
    transform: translateY(-10%) rotate(-45deg) scale(0.65);
    transition:
      opacity ${theme.motion.fast} ${theme.motion.easeStandard},
      transform ${theme.motion.fast} ${theme.motion.easePlayful};
  }

  &[type="radio"]::after {
    width: 40%;
    height: 40%;
    border: 0;
    border-radius: 50%;
    background: currentcolor;
    transform: scale(0.65);
  }

  &:hover:not(:disabled) {
    border-color: ${theme.colors.primaryHover};
    background: ${theme.colors.primarySoft};
  }

  &:focus-visible {
    border-color: ${theme.colors.primaryPressed};
    box-shadow: ${theme.shadows.focus};
    outline: none;
  }

  &:checked,
  &[data-indeterminate] {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.primarySoft};
    color: ${theme.colors.primary};

    &::after {
      opacity: 1;
      transform: translateY(-10%) rotate(-45deg) scale(1);
    }
  }

  &[type="radio"]:checked::after {
    transform: scale(1);
  }

  &[data-indeterminate]::after {
    width: 58%;
    height: 0;
    border-width: 0 0 2px;
    transform: scale(1);
  }

  &:active:not(:disabled) {
    transform: scale(0.94);
  }

  &[aria-invalid="true"] {
    border-color: ${theme.colors.dangerHover};
    background: ${theme.colors.dangerSoft};
    color: ${theme.colors.dangerHover};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.32;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &,
    &::after {
      transition: none;
    }

    &:hover:not(:disabled),
    &:active:not(:disabled) {
      transform: none;
    }
  }
`;
