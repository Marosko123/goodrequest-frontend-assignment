import styled from "styled-components";

import { theme } from "@/styles/theme";

export const Title = styled.h1`
  max-width: ${theme.layout.contentMax};
  margin-block-end: ${theme.space[10]};
`;

export const SectionTitle = styled.h2`
  margin-block-end: ${theme.space[4]};
  font: ${theme.typography.textMdSemibold};
`;
