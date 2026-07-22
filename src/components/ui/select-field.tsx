"use client";

import { Select, type SelectProps } from "@mantine/core";

import styles from "./select-field.module.scss";

type SelectFieldProps = Omit<SelectProps, "classNames" | "error" | "label"> & {
  label: string;
  error?: string | undefined;
};

export function SelectField({
  error,
  label,
  required,
  ...selectProps
}: SelectFieldProps) {
  return (
    <Select
      {...selectProps}
      classNames={{
        label: styles.label!,
        input: styles.input!,
        error: styles.error!,
        dropdown: styles.dropdown!,
        option: styles.option!,
      }}
      {...(error ? { error } : {})}
      label={label}
      nothingFoundMessage="Nenašli sa žiadne útulky."
      {...(required === undefined ? {} : { required })}
      searchable
      withCheckIcon
    />
  );
}
