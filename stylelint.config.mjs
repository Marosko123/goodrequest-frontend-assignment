const stylelintConfig = {
  extends: ["stylelint-config-standard-scss"],
  ignoreFiles: [".next/**", "out/**", "coverage/**"],
  rules: {
    "selector-class-pattern": null,
    "custom-property-pattern": null,
  },
};

export default stylelintConfig;
