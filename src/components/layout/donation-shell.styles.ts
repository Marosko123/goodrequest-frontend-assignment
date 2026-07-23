import styled from "styled-components";

import { theme } from "@/styles/theme";

export const Shell = styled.div`
  display: grid;
  grid-template-columns:
    ${theme.layout.contentMax}
    ${theme.layout.donationMediaWidth};
  gap: ${theme.layout.donationLayoutGap};
  width: min(100%, ${theme.layout.pageMax});
  min-height: 100svh;
  padding-inline: ${theme.layout.pageGutterDesktop}
    ${theme.layout.donationMediaInset};
  margin-inline: auto;

  @media (width < 90rem) and (width > 56rem) {
    grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.72fr);
    gap: ${theme.space[8]};
    padding-inline: ${theme.space[6]};
  }

  @media (width <= 56rem) {
    grid-template:
      "media" auto
      "content" minmax(min-content, 1fr) / minmax(0, 1fr);
    gap: 0;
    padding: 0;
  }
`;

export const ContentColumn = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto 1fr auto;
  min-width: 0;
  min-height: 100svh;
  padding-block: ${theme.layout.pagePaddingBlockDesktop};

  @media (width < 90rem) and (width > 56rem) {
    padding-block: ${theme.space[10]};
  }

  @media (width <= 56rem) {
    grid-area: content;
    min-height: auto;
    padding: ${theme.space[8]} ${theme.space[6]};
  }

  @media (width <= 32rem) {
    padding-inline: ${theme.space[4]};
  }
`;

export const Header = styled.header`
  padding-block-end: ${theme.space[10]};

  @media (width < 90rem) {
    padding-block-end: ${theme.space[8]};
  }
`;

export const Content = styled.main`
  display: grid;
  align-self: stretch;
  width: 100%;
  min-width: 0;
  max-width: ${theme.layout.contentMax};
`;

export const Media = styled.aside`
  position: sticky;
  top: ${theme.layout.donationMediaInset};
  align-self: start;
  height: calc(100svh - (2 * ${theme.layout.donationMediaInset}));
  min-height: 0;
  overflow: hidden;
  border-radius: ${theme.radii.xl};
  background: ${theme.colors.surface};

  @media (width <= 56rem) {
    position: relative;
    grid-area: media;
    top: auto;
    width: 100%;
    height: 22rem;
    min-height: 0;
    border-radius: 0 0 ${theme.radii.xl} ${theme.radii.xl};
  }

  @media (width <= 32rem) {
    height: 12rem;
  }
`;

export const MediaImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  background-color: ${theme.colors.surface};
  background-image: var(--media-blur-mobile);
  background-position: center;
  background-size: cover;
  object-fit: cover;
  object-position: center;

  @media (width <= 56rem) {
    background-position: center 58%;
    object-position: center 58%;
  }

  @media (width > 56rem) {
    background-image: var(--media-blur-desktop);
  }
`;
