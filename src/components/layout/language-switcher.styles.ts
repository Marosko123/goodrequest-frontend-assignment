import styled from "styled-components";

import { theme } from "@/styles/theme";

export const Switcher = styled.nav`
  position: fixed;
  z-index: 20;
  top: calc(${theme.layout.donationMediaInset} + ${theme.space[4]});

  /*
   * Both shells are capped at pageMax and centred, so past that width the
   * viewport edge is no longer the layout edge. Fold the leftover gutter into
   * the offset to keep the switcher pinned to the page column.
   */
  right: calc(
    max(0px, (100% - ${theme.layout.pageMax}) / 2) +
      ${theme.layout.donationMediaInset} + ${theme.space[4]}
  );
  isolation: isolate;

  @media (width <= 56rem) {
    /* Lines up with the shell's block padding, so it shares the header row. */
    top: ${theme.space[8]};
    right: ${theme.space[4]};
  }
`;
