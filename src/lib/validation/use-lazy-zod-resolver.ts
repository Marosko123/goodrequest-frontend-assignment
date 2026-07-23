"use client";

import { useCallback, useEffect, useRef } from "react";
import type { FieldValues, Resolver } from "react-hook-form";

import type { ZodMiniSchema } from "./react-hook-form-resolver";

/**
 * Builds a React Hook Form resolver that loads the schema and the Zod Mini
 * bridge on first validation, keeping both out of the initial route bundle.
 *
 * The returned resolver keeps a stable identity so React Hook Form never has to
 * re-register it; a ref carries the newest `loadSchema`, which is what lets a
 * step rebuild its schema from a changed translator or shelter list without a
 * dependency list at the call site.
 */
export function useLazyZodResolver<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
>(
  loadSchema: () => Promise<ZodMiniSchema<TTransformedValues, TFieldValues>>,
): Resolver<TFieldValues, unknown, TTransformedValues> {
  const latestLoadSchema = useRef(loadSchema);

  useEffect(() => {
    latestLoadSchema.current = loadSchema;
  });

  return useCallback(async (values, context, options) => {
    const [{ createZodMiniResolver }, schema] = await Promise.all([
      import("./react-hook-form-resolver"),
      latestLoadSchema.current(),
    ]);

    return createZodMiniResolver<TFieldValues, TTransformedValues>(schema)(
      values,
      context,
      options,
    );
  }, []);
}
