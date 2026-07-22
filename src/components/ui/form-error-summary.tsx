import styles from "./form-error-summary.module.scss";

export type FormErrorItem = {
  fieldId: string;
  label: string;
  message: string;
};

export function FormErrorSummary({
  errors,
}: {
  errors: readonly FormErrorItem[];
}) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="form-error-summary-title"
      className={styles.summary}
      role="alert"
      tabIndex={-1}
    >
      <h2 className={styles.title} id="form-error-summary-title">
        Formulár obsahuje chyby
      </h2>
      <ul className={styles.list}>
        {errors.map((error) => (
          <li key={error.fieldId}>
            <a
              href={`#${error.fieldId}`}
              onClick={() => document.getElementById(error.fieldId)?.focus()}
            >
              {error.label}: {error.message}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
