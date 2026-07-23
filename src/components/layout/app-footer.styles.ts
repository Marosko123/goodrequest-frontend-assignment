import Link from "next/link";
import styled from "styled-components";

import { theme } from "@/styles/theme";

export const Footer = styled.footer`
  display: flex;
  gap: ${theme.space[6]};
  align-items: center;
  justify-content: space-between;
  min-height: 3.5rem;
  padding-block-start: calc(${theme.space[6]} - 1px);
  border-top: 1px solid ${theme.colors.border};

  @media (width <= 32rem) {
    align-items: flex-start;
  }
`;

export const HomeLink = styled(Link)`
  text-decoration: none;

  @media (pointer: coarse) {
    display: inline-flex;
    min-height: 2.75rem;
    align-items: center;
  }
`;

export const FooterLinks = styled.div`
  display: flex;
  gap: ${theme.space[8]};
  align-items: center;

  @media (width <= 32rem) {
    flex-direction: column;
    gap: ${theme.space[3]};
    align-items: flex-end;
  }
`;

export const Socials = styled.nav`
  display: flex;
  gap: ${theme.space[4]};
  align-items: center;
  color: ${theme.colors.textMuted};

  a {
    display: grid;
    width: ${theme.sizes.iconSm};
    height: ${theme.sizes.iconSm};
    place-items: center;

    @media (pointer: coarse) {
      width: 2.75rem;
      height: 2.75rem;
    }
  }

  svg {
    width: ${theme.sizes.iconSm};
    height: ${theme.sizes.iconSm};
  }
`;

export const Navigation = styled.nav`
  display: flex;
  gap: ${theme.space[8]};
  align-items: center;
  color: ${theme.colors.textSecondary};
  font: ${theme.typography.textMdRegular};

  a {
    text-decoration: none;

    &:hover {
      color: ${theme.colors.primary};
    }

    @media (pointer: coarse) {
      display: inline-flex;
      min-height: 2.75rem;
      align-items: center;
    }
  }

  @media (width <= 32rem) {
    flex-direction: column;
    gap: ${theme.space[1]};
    align-items: flex-end;
  }
`;
