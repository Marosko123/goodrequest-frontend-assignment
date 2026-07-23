import styled, { keyframes } from "styled-components";

import { fieldError, nonSelectableControl } from "@/styles/fragments";
import { theme } from "@/styles/theme";

const blockEnter = keyframes`
  from {
    opacity: 0.72;
    transform: translateY(0.25rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Form = styled.form`
  display: flex;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex-direction: column;

  @media (width <= 38rem) {
    gap: 0;
  }
`;

export const Block = styled.section`
  padding-block-end: ${theme.space[8]};
  border-block-end: 1px solid ${theme.colors.border};
  animation: ${blockEnter} ${theme.motion.base} ${theme.motion.easeEnter} both;

  & + & {
    padding-block: ${theme.space[8]};
    animation-delay: 40ms;
  }

  h2 {
    margin-block-end: ${theme.space[4]};
    font: ${theme.typography.textMdSemibold};
  }

  &[data-primary] {
    min-height: 11rem;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`;

export const Summary = styled.dl`
  display: grid;
  gap: ${theme.space[4]};
  margin: 0;

  div {
    display: grid;
    grid-template-columns: minmax(10rem, 1fr) minmax(0, 1fr);
    gap: ${theme.space[4]};
  }

  dt {
    color: ${theme.colors.textSecondary};
    font: ${theme.typography.textMdRegular};
  }

  dd {
    min-width: 0;
    margin: 0;
    overflow-wrap: anywhere;
    font: ${theme.typography.textMdSemibold};
    text-align: end;
  }

  @media (width <= 38rem) {
    div {
      grid-template-columns: 1fr;
      gap: ${theme.space[1]};
    }

    dd {
      text-align: start;
    }
  }
`;

export const ConsentField = styled.div`
  display: grid;
  gap: ${theme.space[2]};
  padding-block-start: ${theme.space[8]};
`;

export const ConsentLabel = styled.label`
  ${nonSelectableControl}

  display: flex;
  gap: ${theme.space[2]};
  align-items: flex-start;
  font: ${theme.typography.textSmMedium};
  cursor: pointer;

  > input {
    margin-block-start: 2px;
  }

  &:has(input[aria-invalid="true"]) > span {
    color: ${theme.colors.dangerHover};
  }

  &:has(input:disabled) {
    cursor: not-allowed;
  }

  @media (pointer: coarse) {
    min-height: ${theme.sizes.tapTarget};
  }
`;

// Indented to align under the consent text, clearing the checkbox gutter.
export const ErrorMessage = styled.p`
  ${fieldError}

  margin-inline-start: ${theme.space[6]};
`;

export const SubmissionFeedback = styled.div`
  padding-block-start: ${theme.space[6]};

  &:empty {
    display: none;
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  padding-block-start: ${theme.space[6]};
  margin-block: auto ${theme.space[10]};

  @media (width <= 38rem) {
    gap: ${theme.space[3]};

    > * {
      flex: 1;
      min-width: 0;
      padding-inline: ${theme.space[3]};
    }
  }

  @media (width <= 22rem) {
    flex-direction: column-reverse;

    > * {
      width: 100%;
    }
  }
`;
