const stylelintConfig = {
  extends: ["stylelint-config-standard"],
  customSyntax: "postcss-styled-syntax",
  ignoreFiles: [".next/**", "out/**", "coverage/**"],
  rules: {
    "selector-class-pattern": null,
    "custom-property-pattern": null,
    "custom-property-empty-line-before": null,
    "no-descending-specificity": null,
  },
};

export default stylelintConfig;
