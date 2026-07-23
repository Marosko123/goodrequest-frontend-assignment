import styled from "styled-components";

import { theme } from "@/styles/theme";

export const ChoiceInput = styled.input`
  position: relative;
  display: inline-grid;
  flex: none;
  padding: 0;
  margin: 0;
  appearance: none;
  border: 1px solid ${theme.colors.textSubtle};
  background: ${theme.colors.canvas};
  cursor: pointer;
  place-items: center;
  user-select: none;
  transition:
    background-color ${theme.motion.fast} ${theme.motion.easeStandard},
    border-color ${theme.motion.fast} ${theme.motion.easeStandard},
    box-shadow ${theme.motion.fast} ${theme.motion.easeStandard},
    color ${theme.motion.fast} ${theme.motion.easeStandard};

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
    width: 100%;
    height: 100%;
    background: currentcolor;
    content: "";
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M12 5 6.5 10.5 4 8' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
      center / 100% 100% no-repeat;
    opacity: 0;
    transition: opacity ${theme.motion.fast} ${theme.motion.easeStandard};
  }

  &[type="radio"]::after {
    width: 37.5%;
    height: 37.5%;
    border-radius: 50%;
    background: currentcolor;
    mask: none;
  }

  &:checked,
  &[type="checkbox"]:indeterminate {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.primarySoft};
    color: ${theme.colors.primary};

    &::after {
      opacity: 1;
    }
  }

  &[type="checkbox"]:indeterminate::after {
    width: 58.333%;
    height: 2px;
    mask: none;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled, :checked, :indeterminate) {
      border-color: ${theme.colors.primaryHover};
      background: ${theme.colors.primarySoft};
      color: ${theme.colors.primaryHover};
    }
  }

  &:active:not(:disabled) {
    box-shadow: inset 0 0 0 1px ${theme.colors.primaryPressed};
  }

  &:focus-visible {
    border-color: ${theme.colors.primaryPressed};
    box-shadow: ${theme.shadows.focus};
    color: ${theme.colors.primaryPressed};
    outline: none;
  }

  &[aria-invalid="true"] {
    border-color: ${theme.colors.dangerHover};
    background: ${theme.colors.canvas};
    color: ${theme.colors.dangerHover};
  }

  &:checked[aria-invalid="true"],
  &[type="checkbox"]:indeterminate[aria-invalid="true"] {
    background: ${theme.colors.dangerSoft};
  }

  &:disabled {
    cursor: not-allowed;
    border-color: ${theme.colors.textMuted};
    background: ${theme.colors.canvas};
    color: ${theme.colors.textMuted};
    opacity: 0.32;
  }

  &:disabled:checked,
  &[type="checkbox"]:disabled:indeterminate {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.inverseContentPrimary};
    color: ${theme.colors.primary};
  }

  @media (prefers-reduced-motion: reduce) {
    &,
    &::after {
      transition: none;
    }
  }
`;
