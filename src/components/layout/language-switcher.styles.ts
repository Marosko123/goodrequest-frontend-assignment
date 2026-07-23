import styled from "styled-components";

import { theme } from "@/styles/theme";

export const Switcher = styled.nav`
  position: fixed;
  z-index: 20;
  top: calc(${theme.layout.donationMediaInset} + ${theme.space[4]});
  right: calc(${theme.layout.donationMediaInset} + ${theme.space[4]});
  isolation: isolate;

  @media (width <= 56rem) {
    top: ${theme.space[4]};
    right: ${theme.space[4]};
  }
`;
