import styled from "styled-components";

import { fieldError, interactiveControl } from "@/styles/fragments";
import { theme } from "@/styles/theme";

export const Form = styled.form`
  display: flex;
  min-width: 0;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: ${theme.space[4]};
`;

export const NameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${theme.space[5]};

  @media (width <= 38rem) {
    grid-template-columns: 1fr;
  }
`;

export const PhoneField = styled.div`
  display: grid;
  gap: ${theme.space[1]};
`;

export const PhoneLabel = styled.label`
  font: ${theme.typography.textSmMedium};
`;

export const PhoneControl = styled.div`
  display: grid;
  min-width: 0;
  grid-template-columns: 5rem minmax(0, 1fr);
  gap: ${theme.space[4]};
`;

export const CountryPicker = styled.div`
  min-width: 0;

  [role="combobox"] {
    width: 100%;
    min-height: ${theme.sizes.controlXl};
  }
`;

export const PhoneNumber = styled.span`
  ${interactiveControl}

  display: flex;
  min-width: 0;
  align-items: center;
  border: 1px solid transparent;
  background: ${theme.colors.surface};

  &:focus-within {
    border-color: ${theme.colors.primaryPressed};
    background: ${theme.colors.canvas};
    box-shadow: ${theme.shadows.focus};
  }

  &:has(input[aria-invalid="true"]) {
    border-color: ${theme.colors.dangerHover};
    background: ${theme.colors.dangerSoft};
  }
`;

export const Prefix = styled.span`
  flex: none;
  padding-inline-start: ${theme.space[4]};
  color: ${theme.colors.textSecondary};
  font: ${theme.typography.textMdRegular};
`;

export const PhoneDialCodeInput = styled.input`
  width: 3ch;
  flex: none;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${theme.colors.textSecondary};
  font: ${theme.typography.textMdRegular};
  outline: none;
  user-select: text;

  &:focus-visible {
    outline: none;
  }
`;

export const PhoneInput = styled.input`
  width: 100%;
  min-width: 0;
  padding: 0 ${theme.space[4]} 0 ${theme.space[2]};
  border: 0;
  background: transparent;
  font: ${theme.typography.textMdRegular};
  outline: none;
  user-select: text;

  &:focus-visible {
    outline: none;
  }

  &::placeholder {
    color: ${theme.colors.textTertiary};
  }
`;

export const ErrorMessage = styled.p`
  ${fieldError}
`;

export const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  padding-block-start: ${theme.space[4]};
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
