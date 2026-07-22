"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useDonationFlow } from "@/features/donation-flow/context";

import styles from "./success-content.module.scss";

export function SuccessContent() {
  const { dispatch } = useDonationFlow();

  useEffect(() => {
    dispatch({ type: "flowReset" });
  }, [dispatch]);

  return (
    <section className={styles.content}>
      <span aria-hidden="true" className={styles.icon}>
        ✓
      </span>
      <h1>Ďakujeme za váš príspevok</h1>
      <p>Príspevok bol úspešne prijatý.</p>
      <Link className={styles.link} href="/" prefetch={false}>
        Prispieť znova
      </Link>
    </section>
  );
}
