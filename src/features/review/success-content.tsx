"use client";

import Link from "next/link";
import { useEffect } from "react";

import { CheckIcon } from "@/components/ui/icons";
import { useDonationFlow } from "@/features/donation-flow/context";

import styles from "./success-content.module.scss";

export function SuccessContent() {
  const { dispatch } = useDonationFlow();

  useEffect(() => {
    dispatch({ type: "flowReset" });
  }, [dispatch]);

  return (
    <section className={styles.content}>
      <span aria-hidden="true" className={styles.celebration}>
        <CheckIcon className={styles.icon} />
      </span>
      <h1>Ďakujeme za váš príspevok</h1>
      <p>Príspevok bol úspešne prijatý.</p>
      <Link className={styles.link} href="/" prefetch={false}>
        Prispieť znova
      </Link>
    </section>
  );
}
