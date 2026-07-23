import styled from "styled-components";

import { theme } from "@/styles/theme";

export const Page = styled.article`
  display: grid;
  gap: ${theme.space[10]};
  padding-block: calc(${theme.space[6]} + ${theme.space[1]}) ${theme.space[12]};

  h1 {
    margin: 0;
  }

  > p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    font: ${theme.typography.textMdRegular};
  }

  @media (width <= 48rem) {
    gap: ${theme.space[8]};
    padding-block: ${theme.space[8]};
  }
`;

export const StatsSection = styled.section`
  min-height: 14.75rem;
  padding: ${theme.space[16]} ${theme.space[8]};
  border-block: 1px solid ${theme.colors.border};

  @media (width <= 48rem) {
    min-height: 0;
    padding: ${theme.space[10]} 0;
  }
`;
