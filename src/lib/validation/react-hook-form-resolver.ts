import type {
  FieldError,
  FieldErrors,
  FieldValues,
  Resolver,
} from "react-hook-form";

type ZodMiniIssue = {
  code: string;
  message: string;
  path: readonly PropertyKey[];
};

export type ZodMiniSchema<Output, Input> = {
  safeParseAsync(
    values: Input,
  ): Promise<
    | { success: true; data: Output }
    | { success: false; error: { issues: readonly ZodMiniIssue[] } }
  >;
};

function addIssue(
  errors: Record<string, unknown>,
  issue: ZodMiniIssue,
  allCriteria: boolean,
) {
  const path = issue.path.length > 0 ? issue.path.map(String) : ["root"];
  let target: Record<string, unknown> = errors;

  for (const [index, part] of path.entries()) {
    if (index === path.length - 1) {
      const existing = target[part] as FieldError | undefined;
      if (!existing) {
        target[part] = { message: issue.message, type: issue.code };
      }

      if (allCriteria) {
        const fieldError = target[part] as FieldError;
        const types = fieldError.types ?? {};
        const previous = types[issue.code];
        fieldError.types = {
          ...types,
          [issue.code]: previous
            ? ([] as string[]).concat(previous as string[], issue.message)
            : issue.message,
        };
      }
      return;
    }

    const nextPart = path[index + 1]!;
    target[part] ??= /^\d+$/u.test(nextPart) ? [] : {};
    target = target[part] as Record<string, unknown>;
  }
}

function toFieldErrors<TFieldValues extends FieldValues>(
  issues: readonly ZodMiniIssue[],
  allCriteria: boolean,
): FieldErrors<TFieldValues> {
  const errors: Record<string, unknown> = {};

  for (const issue of issues) {
    addIssue(errors, issue, allCriteria);
  }

  return errors as FieldErrors<TFieldValues>;
}

export function createZodMiniResolver<
  TFieldValues extends FieldValues,
  TTransformedValues,
>(
  schema: ZodMiniSchema<TTransformedValues, TFieldValues>,
): Resolver<TFieldValues, unknown, TTransformedValues> {
  return async (values, _context, options) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return { errors: {}, values: result.data };
    }

    return {
      errors: toFieldErrors<TFieldValues>(
        result.error.issues,
        options.criteriaMode === "all" && !options.shouldUseNativeValidation,
      ),
      values: {},
    };
  };
}
