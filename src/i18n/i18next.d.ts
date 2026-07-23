import "i18next";

import { defaultNamespace } from "./config";
import { sk } from "./resources/sk";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNamespace;
    resources: {
      translation: typeof sk;
    };
  }
}
