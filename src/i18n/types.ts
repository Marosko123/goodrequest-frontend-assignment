export type TranslationShape<T> = {
  readonly [Key in keyof T]: T[Key] extends string
    ? string
    : T[Key] extends object
      ? TranslationShape<T[Key]>
      : never;
};
