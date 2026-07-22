import Image from "next/image";

import contactDog from "@/assets/contact-dog.jpg";

import styles from "./contact-content.module.scss";

type ContactItem = {
  title: string;
  description: string;
  href: string;
  value: string;
  icon: "email" | "office" | "phone";
};

const contactItems: ContactItem[] = [
  {
    title: "Email",
    description: "Our friendly team is here to help.",
    href: "mailto:hello@goodrequest.com",
    value: "hello@goodrequest.com",
    icon: "email",
  },
  {
    title: "Office",
    description: "Come say hello at our office HQ.",
    href: "https://www.google.com/maps/search/?api=1&query=Obchodn%C3%A1%203D%2C%20010%2008%20%C5%BDilina%2C%20Slovakia",
    value: "Obchodná 3D, 010 08 Žilina, Slovakia",
    icon: "office",
  },
  {
    title: "Phone",
    description: "Mon-Fri from 8am to 5pm.",
    href: "tel:+421911750750",
    value: "+421 911 750 750",
    icon: "phone",
  },
];

function ContactIcon({ type }: { type: ContactItem["icon"] }) {
  if (type === "email") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M3 6.5 12 13l9-6.5M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      </svg>
    );
  }

  if (type === "office") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M8.5 3H5a2 2 0 0 0-2 2c0 8.8 7.2 16 16 16a2 2 0 0 0 2-2v-3.5l-4.5-1-1.3 2.6a13.2 13.2 0 0 1-8.3-8.3l2.6-1.3L8.5 3Z" />
    </svg>
  );
}

export function ContactContent() {
  return (
    <article className={styles.page}>
      <h1>Kontakt</h1>
      <div className={styles.contactGrid}>
        {contactItems.map((item) => (
          <section className={styles.contactItem} key={item.title}>
            <span className={styles.icon}>
              <ContactIcon type={item.icon} />
            </span>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <a href={item.href}>{item.value}</a>
          </section>
        ))}
      </div>
      <Image
        alt="Zlatý retriever pri vode"
        className={styles.image}
        height={1706}
        priority
        sizes="(max-width: 900px) 100vw, 82rem"
        src={contactDog}
        width={2559}
      />
    </article>
  );
}
