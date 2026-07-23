import styled, { css, keyframes } from "styled-components";

import { theme } from "@/styles/theme";

const shimmer = keyframes`
  to { background-position: -200% 0; }
`;

/*
 * Shared by the loaded grid and its skeleton. They must occupy identical
 * space or swapping one for the other shifts the layout.
 */
const statsLayout = css`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${theme.space[8]};
  max-width: 76rem;
  min-height: 6.5rem;

  @media (width <= 38rem) {
    grid-template-columns: 1fr;
  }
`;

export const Content = styled.div`
  display: grid;
  gap: ${theme.space[4]};
`;

export const StatsGrid = styled.dl`
  ${statsLayout}

  /* Overridden inline with the real figure length; 1 means "never shrink". */
  --stat-characters: 1;

  margin: 0;

  > div {
    display: grid;
    container-type: inline-size;
    align-content: center;
    justify-items: center;
    min-width: 0;
    text-align: center;
  }

  dd {
    /*
     * The live total runs to 12+ digits and formats as one unbreakable token
     * (nbsp before €, no break after a group separator), so left alone it
     * walks straight off the page. Shrink only the figures that cannot fit
     * their own column: 0.52em is the average glyph advance of the heading
     * face, so retune it if the type changes. overflow-wrap catches whatever
     * the estimate still misses, and 1.2 is the line height both heading
     * tokens already ship at their full size.
     */
    --stat-fit: calc(100cqi / var(--stat-characters) / 0.52);

    margin: 0;
    overflow-wrap: anywhere;
    color: ${theme.colors.primary};
    font: ${theme.typography.headingXlSemibold};
    font-size: min(3.75rem, var(--stat-fit));
    line-height: 1.2;
    letter-spacing: ${theme.typography.trackingHeading};
  }

  dt {
    margin-block-start: ${theme.space[2]};
    font: ${theme.typography.textLgMedium};
  }

  @media (width <= 38rem) {
    dd {
      font: ${theme.typography.headingXlSemiboldCompact};
      font-size: min(2.5rem, var(--stat-fit));
      line-height: 1.2;
    }
  }
`;

export const LoadingGrid = styled.div`
  ${statsLayout}
`;

export const Skeleton = styled.div`
  width: min(100%, 22rem);
  height: 6rem;
  border-radius: ${theme.radii.lg};
  background: linear-gradient(
    90deg,
    ${theme.colors.surface} 25%,
    ${theme.colors.surfaceHover} 50%,
    ${theme.colors.surface} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
