import styled from "styled-components";

import { theme } from "@/styles/theme";

export const Switcher = styled.nav`
  position: fixed;
  z-index: 20;
  top: calc(${theme.layout.donationMediaInset} + ${theme.space[4]});

  /* Keep the fixed control aligned with the centred page shell. */
  right: calc(
    max(0px, (100% - ${theme.layout.pageMax}) / 2) +
      ${theme.layout.donationMediaInset} + ${theme.space[4]}
  );
  isolation: isolate;

  @media (width <= 56rem) {
    top: ${theme.space[8]};
    right: ${theme.space[4]};
  }
`;
