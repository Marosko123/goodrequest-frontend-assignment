import { en } from "./resources/en";
import { sk } from "./resources/sk";

export { en, sk };

export const resources = {
  sk: { translation: sk },
  en: { translation: en },
} as const;
