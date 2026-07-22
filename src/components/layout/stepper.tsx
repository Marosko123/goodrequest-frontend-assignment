import styles from "./stepper.module.scss";

type DonationStep = 1 | 2 | 3;

const steps: ReadonlyArray<{ number: DonationStep; label: string }> = [
  { number: 1, label: "Výber útulku" },
  { number: 2, label: "Osobné údaje" },
  { number: 3, label: "Potvrdenie" },
];

export function Stepper({ currentStep }: { currentStep: DonationStep }) {
  return (
    <nav aria-label="Priebeh príspevku" className={styles.stepper}>
      <ol aria-label="Priebeh príspevku" className={styles.list}>
        {steps.map((step) => {
          const isCurrent = step.number === currentStep;
          const isComplete = step.number < currentStep;

          return (
            <li
              aria-current={isCurrent ? "step" : undefined}
              className={styles.step}
              data-complete={isComplete || undefined}
              data-current={isCurrent || undefined}
              key={step.number}
            >
              <span aria-hidden="true" className={styles.number}>
                {step.number}
              </span>
              <span className={styles.label}>{step.label}</span>
              {step.number < 3 ? (
                <span aria-hidden="true" className={styles.line} />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
