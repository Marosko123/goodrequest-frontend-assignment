import { cz } from "./resources/cz";
import { en } from "./resources/en";
import { sk } from "./resources/sk";

export { cz, en, sk };

export const resources = {
  sk: { translation: sk },
  en: { translation: en },
  cz: { translation: cz },
} as const;
