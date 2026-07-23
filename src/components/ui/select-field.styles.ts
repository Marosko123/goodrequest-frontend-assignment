import styled from "styled-components";

import { ChevronDownIcon } from "./icons";
import { feedbackEnter } from "@/styles/fragments";
import { theme } from "@/styles/theme";

export const Field = styled.div`
  display: grid;
  gap: ${theme.space[1]};
  min-width: 0;
`;

export const Label = styled.label`
  color: ${theme.colors.text};
  font: ${theme.typography.textSmMedium};
`;

export const Control = styled.span`
  position: relative;
  display: block;
  min-width: 0;
`;

export const Select = styled.select`
  width: 100%;
  min-width: 0;
  max-width: 100%;
  height: ${theme.sizes.controlXl};
  padding: 0 calc(${theme.space[4]} + ${theme.sizes.iconMd} + ${theme.space[2]})
    0 ${theme.space[4]};
  appearance: none;
  border: 1px solid transparent;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  font: ${theme.typography.textMdRegular};
  line-height: ${theme.typography.lineHeightTextMd};
  transition:
    background-color ${theme.motion.transitionFast} ${theme.motion.easeStandard},
    border-color ${theme.motion.transitionFast} ${theme.motion.easeStandard},
    box-shadow ${theme.motion.transitionFast} ${theme.motion.easeStandard};

  &:hover:not(:disabled) {
    background: ${theme.colors.surfaceHover};
  }

  &:focus {
    border-color: ${theme.colors.primaryPressed};
    background: ${theme.colors.canvas};
    box-shadow: ${theme.shadows.focus};
    outline: none;
  }

  &[aria-invalid="true"] {
    border-color: ${theme.colors.danger};
    background: ${theme.colors.dangerSoft};
  }

  &[data-empty] {
    color: ${theme.colors.textMuted};
  }

  &:disabled {
    color: ${theme.colors.textMuted};
    cursor: not-allowed;
    opacity: 0.32;
  }
`;

export const Chevron = styled(ChevronDownIcon)`
  position: absolute;
  top: 50%;
  right: ${theme.space[4]};
  width: ${theme.sizes.iconSm};
  height: ${theme.sizes.iconSm};
  color: ${theme.colors.textTertiary};
  pointer-events: none;
  transform: translateY(-50%);
`;

export const ErrorMessage = styled.p`
  ${feedbackEnter}

  margin: 0;
  color: ${theme.colors.danger};
  font: ${theme.typography.textSmRegular};
`;
