import styled from "styled-components";

import { theme } from "@/styles/theme";

export const Page = styled.article`
  display: grid;
  gap: ${theme.space[10]};
  padding-block: calc(${theme.space[6]} + ${theme.space[1]}) ${theme.space[10]};

  h1 {
    margin: 0;
  }

  @media (width <= 48rem) {
    gap: ${theme.space[8]};
    padding-block: ${theme.space[8]};
  }
`;

export const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 18rem));
  justify-content: space-between;
  width: 100%;
  max-width: ${theme.layout.publicImageMax};
  min-height: 14rem;
  padding-block: ${theme.space[3]};
  margin-inline: auto;

  @media (width <= 48rem) {
    grid-template-columns: 1fr;
    gap: ${theme.space[10]};
    justify-content: stretch;
    min-height: 0;
  }
`;

export const ContactItem = styled.section`
  display: grid;
  justify-items: center;
  text-align: center;

  h2 {
    margin-block: ${theme.space[5]} ${theme.space[3]};
    font: ${theme.typography.textXlSemibold};
  }

  p {
    margin: 0 0 ${theme.space[10]};
    color: ${theme.colors.textSecondary};
    font: ${theme.typography.textMdRegular};
  }

  a,
  button {
    width: 100%;
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: ${theme.colors.primary};
    font: ${theme.typography.textMdMedium};
    overflow-wrap: anywhere;
    text-decoration: none;
    white-space: nowrap;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        text-decoration: underline;
      }
    }

    &:active {
      color: ${theme.colors.primaryPressed};
      text-decoration: underline;
    }

    @media (pointer: coarse) {
      display: inline-flex;
      min-height: ${theme.sizes.tapTarget};
      align-items: center;
    }

    @media (width <= 48rem) {
      white-space: normal;
    }
  }

  &[data-contact="office"] a {
    text-align: start;

    @media (width <= 48rem) {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
  }

  button {
    cursor: pointer;
    text-align: center;
    user-select: none;

    @media (pointer: coarse) {
      justify-content: center;
    }
  }
`;

export const CopyValue = styled.span`
  position: relative;
  display: block;
  width: 100%;
`;

export const CopyFeedback = styled.span`
  position: absolute;
  z-index: 1;
  bottom: calc(100% + ${theme.space[2]});
  left: 50%;
  width: max-content;
  max-width: 100%;
  padding: ${theme.space[1]} ${theme.space[2]};
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.text};
  box-shadow: 0 0.25rem 0.75rem ${theme.colors.shadow};
  color: ${theme.colors.inverseContentPrimary};
  font: ${theme.typography.textSmMedium};
  pointer-events: none;
  transform: translateX(-50%);
`;

export const Icon = styled.span`
  display: grid;
  width: ${theme.sizes.controlLg};
  height: ${theme.sizes.controlLg};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.primary};
  place-items: center;

  svg {
    width: ${theme.sizes.iconLg};
    height: ${theme.sizes.iconLg};
  }
`;

export const ContactImage = styled.img`
  width: 100%;
  max-width: ${theme.layout.publicImageMax};
  height: ${theme.layout.publicImageHeight};
  margin-inline: auto;
  background-color: ${theme.colors.surface};
  background-image: var(--media-blur-mobile);
  background-position: center 48%;
  background-size: cover;
  object-fit: cover;
  object-position: center 48%;
  border-radius: ${theme.radii.xl};

  @media (width <= 48rem) {
    height: 18rem;
  }

  @media (width > 48rem) {
    background-image: var(--media-blur-desktop);
  }
`;
