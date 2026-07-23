import Link from "next/link";
import styled from "styled-components";

import { nonSelectableControl } from "@/styles/fragments";
import { theme } from "@/styles/theme";

export const Footer = styled.footer`
  display: flex;
  gap: ${theme.space[8]};
  align-items: center;
  min-height: 3.5rem;
  padding-block-start: calc(${theme.space[6]} - 1px);
  border-top: 1px solid ${theme.colors.border};

  @media (width <= 32rem) {
    display: grid;
    grid-template-areas:
      "brand socials"
      "navigation navigation";
    grid-template-columns: minmax(0, 1fr) auto;
    gap: ${theme.space[1]} ${theme.space[3]};
    align-items: center;
    min-height: 0;
  }
`;

export const HomeLink = styled(Link)`
  ${nonSelectableControl}

  text-decoration: none;
  transition: opacity ${theme.motion.fast} ${theme.motion.easeStandard};

  &:active {
    opacity: 0.72;
  }

  @media (width <= 32rem) {
    grid-area: brand;
  }

  @media (pointer: coarse) {
    display: inline-flex;
    min-height: ${theme.sizes.tapTarget};
    align-items: center;
  }
`;

export const Socials = styled.nav`
  display: flex;
  gap: ${theme.space[4]};
  align-items: center;
  margin-inline-start: auto;

  @media (width <= 32rem) {
    grid-area: socials;
    justify-self: end;
    margin-inline-start: 0;
  }
`;

export const Navigation = styled.nav`
  ${nonSelectableControl}

  display: flex;
  gap: ${theme.space[8]};
  align-items: center;
  color: ${theme.colors.textSecondary};
  font: ${theme.typography.textMdRegular};

  a {
    text-decoration: none;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        color: ${theme.colors.primary};
      }
    }

    &:active {
      color: ${theme.colors.primaryPressed};
    }

    @media (pointer: coarse) {
      display: inline-flex;
      min-height: ${theme.sizes.tapTarget};
      align-items: center;
    }
  }

  @media (width <= 32rem) {
    grid-area: navigation;
    gap: ${theme.space[6]};
    justify-self: center;

    a {
      white-space: nowrap;
    }
  }
`;
