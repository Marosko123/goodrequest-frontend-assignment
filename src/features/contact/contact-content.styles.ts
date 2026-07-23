import Image from "next/image";
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
  padding-block: ${theme.space[5]};
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
    margin: 0 0 ${theme.space[5]};
    color: ${theme.colors.textSecondary};
    font: ${theme.typography.textMdRegular};
  }

  a {
    width: 100%;
    min-width: 0;
    color: ${theme.colors.primary};
    font: ${theme.typography.textMdMedium};
    overflow-wrap: anywhere;
    text-decoration: none;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
    }

    @media (pointer: coarse) {
      display: inline-flex;
      min-height: 2.75rem;
      align-items: center;
    }

    @media (width <= 48rem) {
      white-space: normal;
    }
  }

  &[data-contact="office"] a {
    text-align: start;
  }
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

export const ContactImage = styled(Image)`
  width: 100%;
  max-width: ${theme.layout.publicImageMax};
  height: ${theme.layout.publicImageHeight};
  margin-inline: auto;
  object-fit: cover;
  object-position: center 48%;
  border-radius: ${theme.radii.xl};

  @media (width <= 48rem) {
    height: 18rem;
  }
`;
