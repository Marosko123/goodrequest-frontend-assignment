import { appBasePath } from "@/i18n/config";

export const interFontFaceCss = `
  @font-face {
    font-family: "Inter Variable";
    font-style: normal;
    font-display: swap;
    font-weight: 400 700;
    src: url("${appBasePath}/fonts/inter-latin-ext-wght-normal.woff2")
      format("woff2-variations");
    unicode-range: U+010C-010F, U+011A-011B, U+013D-013E, U+0147-0148,
      U+0158-0159, U+0160-0165, U+016E-016F, U+017D-017E;
  }

  @font-face {
    font-family: "Inter Variable";
    font-style: normal;
    font-display: swap;
    font-weight: 400 700;
    src: url("${appBasePath}/fonts/inter-latin-wght-normal.woff2")
      format("woff2-variations");
    unicode-range: U+0020-007E, U+00A0, U+00C0-00FF, U+2010-2011, U+2013,
      U+2018-2019, U+2026, U+20AC, U+2212;
  }
`;
