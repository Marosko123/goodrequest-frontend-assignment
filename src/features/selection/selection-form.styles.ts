import styled from "styled-components";

import {
  nonSelectableControl,
  pressable,
  visuallyHidden,
} from "@/styles/fragments";
import { theme } from "@/styles/theme";

export const Form = styled.form`
  display: flex;
  min-width: 0;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: ${theme.space[10]};

  @media (width <= 42rem) {
    gap: ${theme.space[8]};
  }
`;

export const TargetFieldset = styled.fieldset`
  display: grid;
  gap: ${theme.space[5]};
  min-width: 0;
  padding: 0;
  margin: 0;
  border: 0;
`;

export const TargetLegend = styled.legend`
  ${visuallyHidden}
`;

export const AmountFieldset = styled.fieldset`
  display: grid;
  gap: ${theme.space[5]};
  min-width: 0;
  padding: 0;
  margin: 0;
  border: 0;

  > legend {
    float: left;
    width: 100%;
    margin-block-end: ${theme.space[6]};
    color: ${theme.colors.text};
    font: ${theme.typography.textMdSemibold};
  }
`;

export const TargetOptions = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  overflow: hidden;
  padding: 3px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};

  &::before {
    position: absolute;
    z-index: 0;
    inset-block: 3px;
    inset-inline-start: 3px;
    width: calc(50% - 3px);
    border-radius: calc(${theme.radii.md} - 3px);
    background: ${theme.colors.primary};
    content: "";
    transition: transform ${theme.motion.base} ${theme.motion.easePlayful};
  }

  &[data-target="foundation"]::before {
    transform: translateX(100%);
  }

  @media (width <= 42rem) {
    grid-template-columns: 1fr;

    &::before {
      inset-block: 3px auto;
      inset-inline: 3px;
      width: auto;
      height: calc(50% - 3px);
    }

    &&[data-target="foundation"]::before {
      transform: translateY(100%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      transition: none;
    }
  }
`;

export const TargetOption = styled.label`
  ${nonSelectableControl}

  position: relative;
  z-index: 1;
  display: grid;
  min-height: ${theme.sizes.controlHeight};
  padding-inline: ${theme.space[4]};
  border-radius: calc(${theme.radii.md} - 3px);
  place-items: center;
  font: ${theme.typography.textSmMedium};
  text-align: center;
  cursor: pointer;
  transition: color ${theme.motion.fast} ${theme.motion.easeStandard};

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  &:has(input:focus-visible) {
    box-shadow: ${theme.shadows.focus};
  }

  &[data-selected="true"] {
    color: ${theme.colors.onAccent};
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not([data-selected="true"]) {
      color: ${theme.colors.primary};
    }
  }

  &:active:not([data-selected="true"]) {
    color: ${theme.colors.primaryPressed};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const ShelterRegion = styled.div`
  display: grid;
  grid-template-rows: 0fr;
  margin-block: calc(-1 * ${theme.space[5]});
  visibility: hidden;
  opacity: 0;
  transition:
    grid-template-rows ${theme.motion.base} ${theme.motion.easeEnter},
    margin ${theme.motion.base} ${theme.motion.easeEnter},
    opacity ${theme.motion.fast} ${theme.motion.easeStandard},
    visibility 0s linear ${theme.motion.base};

  &[data-expanded="true"] {
    grid-template-rows: 1fr;
    margin-block: 0;
    visibility: visible;
    opacity: 1;
    transition-delay: 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const ShelterSection = styled.div`
  display: grid;
  gap: ${theme.space[4]};
  min-height: 0;
  overflow: hidden;

  ${ShelterRegion}[data-expanded="true"] & {
    overflow: visible;
  }
`;

export const CustomAmount = styled.div`
  --amount-font-size: 3.75rem;

  position: relative;
  width: min(
    100%,
    max(9.5rem, calc(var(--amount-characters) * 2.25rem + 4.5rem))
  );
  max-width: 28rem;
  margin-inline: auto;

  &[data-amount-size="medium"] {
    --amount-font-size: 3.25rem;
  }

  &[data-amount-size="long"] {
    --amount-font-size: 2.75rem;
  }

  label {
    ${visuallyHidden}
  }

  input {
    height: 5rem;
    padding: 0 2.75rem 0 ${theme.space[3]};
    border: 0;
    border-bottom: 2px solid ${theme.colors.primary};
    border-radius: 0;
    background: transparent;
    font: ${theme.typography.headingXlRegular};
    font-size: var(--amount-font-size);
    letter-spacing: ${theme.typography.trackingHeading};
    text-align: center;
    user-select: text;
  }

  input:focus-visible {
    border: 0;
    border-bottom: 2px solid ${theme.colors.primaryPressed};
    border-radius: 0;
    background: transparent;
    box-shadow: 0 3px 0
      color-mix(in srgb, ${theme.colors.focusRing} 48%, transparent);
    outline: none;
  }

  @media (width <= 24rem) {
    && {
      --amount-font-size: clamp(2rem, 11vw, 2.75rem);
    }

    width: 100%;
  }
`;

export const Currency = styled.span`
  position: absolute;
  top: 2.5rem;
  right: ${theme.space[3]};
  color: ${theme.colors.textSecondary};
  font: ${theme.typography.symbolMdRegular};
  transform: translateY(-50%);
`;

export const Presets = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: ${theme.space[4]};

  @media (width <= 42rem) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${theme.space[3]};
  }
`;

export const Preset = styled.button`
  ${pressable}

  min-height: ${theme.sizes.controlLg};
  padding: ${theme.space[2]};
  border: 1px solid transparent;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.surface};
  font: ${theme.typography.textMdMedium};
  cursor: pointer;

  &[aria-pressed="true"] {
    background: ${theme.colors.primary};
    color: ${theme.colors.onAccent};
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not([aria-pressed="true"]) {
      background: ${theme.colors.surfaceHover};
    }
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  padding-block-start: ${theme.space[2]};
  margin-block: auto ${theme.space[10]};

  @media (width <= 42rem) {
    gap: ${theme.space[3]};

    > * {
      flex: 1;
      min-width: 0;
      padding-inline: ${theme.space[3]};
    }
  }

  @media (width <= 22rem) {
    flex-direction: column;

    > * {
      width: 100%;
    }
  }
`;
