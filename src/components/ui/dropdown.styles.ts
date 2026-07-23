import styled, { css } from "styled-components";

import { fieldError } from "@/styles/fragments";
import { theme } from "@/styles/theme";

import { ChevronDownIcon } from "./icons";

/** Country flags are bitmaps, so they need an explicit ratio and a hairline. */
const countryFlag = css`
  > img[data-country] {
    width: 1.5rem;
    height: 1rem;
    flex: none;
    border-radius: 0.125rem;
    outline: 1px solid ${theme.colors.borderSubtle};
    outline-offset: -1px;
    object-fit: cover;
  }
`;

export const DropdownRoot = styled.div`
  position: relative;
  display: grid;
  min-width: 0;
  gap: ${theme.space[1]};

  &:has(> button[aria-expanded="true"]) {
    z-index: 40;
  }
`;

export const DropdownLabel = styled.label`
  color: ${theme.colors.text};
  font: ${theme.typography.textSmMedium};
  user-select: none;

  ${DropdownRoot}:has(button[aria-invalid="true"]) & {
    color: ${theme.colors.dangerHover};
  }
`;

export const DropdownTrigger = styled.button`
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: ${theme.space[2]};
  border: 1px solid transparent;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  cursor: pointer;
  text-align: left;
  user-select: none;
  transition:
    color ${theme.motion.fast} ${theme.motion.easeStandard},
    background-color ${theme.motion.fast} ${theme.motion.easeStandard},
    border-color ${theme.motion.fast} ${theme.motion.easeStandard},
    box-shadow ${theme.motion.fast} ${theme.motion.easeStandard},
    transform ${theme.motion.instant} ${theme.motion.easeEnter};

  &[data-variant="field"] {
    min-height: ${theme.sizes.controlXl};
    padding: 0 ${theme.space[4]};
    font: ${theme.typography.textMdRegular};
  }

  &[data-variant="compact"] {
    width: auto;
    min-width: 3rem;
    min-height: ${theme.sizes.tapTarget};
    justify-content: center;
    padding: ${theme.space[2]} ${theme.space[3]};
    font: ${theme.typography.textSmMedium};
  }

  &[data-variant="compact"][data-tone="floating"] {
    border-color: ${theme.colors.borderSubtle};
    box-shadow: 0 1px 2px ${theme.colors.shadow};
    background: color-mix(in srgb, ${theme.colors.canvas} 94%, transparent);
    backdrop-filter: blur(0.5rem);
  }

  @media (hover: hover) and (pointer: fine) {
    &[data-variant="field"]:hover:not(:disabled) {
      background: ${theme.colors.surfaceHover};
    }

    &[data-variant="compact"][data-tone="floating"]:hover:not(:disabled) {
      background: ${theme.colors.canvas};
      color: ${theme.colors.primary};
    }

    &[data-variant="compact"][data-tone="surface"]:hover:not(:disabled) {
      background: ${theme.colors.surfaceHover};
    }
  }

  &[aria-expanded="true"] {
    border-color: ${theme.colors.primaryPressed};
    background: ${theme.colors.canvas};
    box-shadow: ${theme.shadows.focus};
  }

  &:focus-visible {
    border-color: ${theme.colors.primaryPressed};
    background: ${theme.colors.canvas};
    box-shadow: ${theme.shadows.focus};
    outline: 0;
  }

  &[data-tone="surface"][aria-expanded="true"],
  &[data-tone="surface"]:focus-visible {
    background: ${theme.colors.surface};
  }

  &[aria-invalid="true"] {
    border-color: ${theme.colors.dangerHover};
    background: ${theme.colors.dangerSoft};
  }

  &[data-empty] {
    color: ${theme.colors.textTertiary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &:active:not(:disabled) {
    transform: scale(0.99);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:active:not(:disabled) {
      transform: none;
    }
  }
`;

export const DropdownValue = styled.span`
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: ${theme.space[2]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${DropdownTrigger}[data-variant="compact"] & {
    flex: none;
  }

  ${countryFlag}

  > svg {
    width: ${theme.sizes.iconMd};
    height: ${theme.sizes.iconMd};
    flex: none;
  }
`;

export const DropdownChevron = styled(ChevronDownIcon)`
  width: ${theme.sizes.iconSm};
  height: ${theme.sizes.iconSm};
  flex: none;
  margin-inline-start: auto;
  color: ${theme.colors.textTertiary};
  transform: rotate(0deg);
  transition:
    color ${theme.motion.fast} ${theme.motion.easeStandard},
    transform ${theme.motion.base} ${theme.motion.easeEnter};

  &[data-state="open"] {
    color: ${theme.colors.primary};
    transform: rotate(180deg);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const DropdownMenu = styled.div`
  position: absolute;
  z-index: 30;
  top: calc(100% + ${theme.space[2]});
  display: grid;
  width: 100%;
  max-width: min(24rem, calc(100vw - (2 * ${theme.space[4]})));
  max-height: min(18rem, 45dvh);
  gap: ${theme.space[1]};
  padding: ${theme.space[1]};
  overflow: hidden auto;
  overscroll-behavior: contain;
  border: 1px solid ${theme.colors.borderSubtle};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.card};
  background: ${theme.colors.canvas};
  scrollbar-gutter: stable;
  transform-origin: top left;
  transition:
    opacity ${theme.motion.fast} ${theme.motion.easeStandard},
    transform ${theme.motion.base} ${theme.motion.easeEnter},
    visibility 0s linear ${theme.motion.fast};

  &[data-align="start"] {
    left: 0;
  }

  &[data-align="end"] {
    right: 0;
    transform-origin: top right;
  }

  &[data-side="top"] {
    top: auto;
    bottom: calc(100% + ${theme.space[2]});
    transform-origin: bottom left;
  }

  &[data-side="top"][data-align="end"] {
    transform-origin: bottom right;
  }

  &[data-variant="compact"] {
    width: max-content;
    min-width: 100%;
    scrollbar-gutter: auto;
  }

  &[data-state="closed"] {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-0.25rem) scale(0.98);
  }

  &[data-side="top"][data-state="closed"] {
    transform: translateY(0.25rem) scale(0.98);
  }

  &[data-state="open"] {
    visibility: visible;
    opacity: 1;
    transform: translateY(0) scale(1);
    transition-delay: 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &[data-state="closed"],
    &[data-state="open"] {
      transform: none;
    }
  }
`;

export const DropdownOptionRow = styled.button`
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: ${theme.sizes.tapTarget};
  align-items: center;
  gap: ${theme.space[2]};
  padding: ${theme.space[2]} ${theme.space[3]};
  border: 0;
  border-radius: ${theme.radii.md};
  background: transparent;
  color: ${theme.colors.textTertiary};
  font: ${theme.typography.textSmMedium};
  cursor: pointer;
  text-align: left;
  user-select: none;
  transition:
    color ${theme.motion.fast} ${theme.motion.easeStandard},
    background-color ${theme.motion.fast} ${theme.motion.easeStandard};

  &[data-active="true"] {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.primaryHover};
  }

  &[aria-selected="true"] {
    background: ${theme.colors.primarySoft};
    color: ${theme.colors.primaryPressed};
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      background: ${theme.colors.surfaceHover};
      color: ${theme.colors.primaryHover};
    }

    &[aria-selected="true"]:hover:not(:disabled) {
      background: ${theme.colors.primarySoft};
      box-shadow: inset 0 0 0 1px ${theme.colors.primaryDisabled};
      color: ${theme.colors.primaryPressed};
    }
  }

  &:active:not(:disabled) {
    background: ${theme.colors.primaryPressed};
    color: ${theme.colors.inverseContentPrimary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  ${countryFlag}

  > svg {
    width: ${theme.sizes.iconMd};
    height: ${theme.sizes.iconMd};
    flex: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const DropdownOptionLabel = styled.span`
  min-width: 0;
  flex: 1;
  overflow-wrap: anywhere;
`;

export const DropdownSelectedIndicator = styled.span`
  width: ${theme.sizes.iconSm};
  flex: none;
  color: currentcolor;
  font: ${theme.typography.textSmMedium};
  opacity: 0;
  transform: scale(0.75);
  transition:
    opacity ${theme.motion.fast} ${theme.motion.easeStandard},
    transform ${theme.motion.base} ${theme.motion.easeEnter};

  &[data-visible="true"] {
    opacity: 1;
    transform: scale(1);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none;
  }
`;

export const DropdownError = styled.p`
  ${fieldError}
`;
