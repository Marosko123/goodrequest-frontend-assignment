import styles from "./logo.module.scss";

export function Logo() {
  return (
    <span className={styles.logo}>
      <svg aria-hidden="true" className={styles.mark} viewBox="0 0 32 32">
        <path d="M8.2 5.5 4 10.6l2.7 2.1v11.8h18.6V12.7l2.7-2.1-4.2-5.1-5 2.4H13.2l-5-2.4Z" />
        <path d="M12 15.2c0 2.8 1.8 5.2 4 5.2s4-2.4 4-5.2c-1.2.7-2.5 1.1-4 1.1s-2.8-.4-4-1.1Z" />
      </svg>
      <span>Good boy</span>
    </span>
  );
}
