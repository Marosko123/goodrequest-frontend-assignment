import Image from "next/image";

import contactDog from "@/assets/contact-dog.jpg";
import { MailIcon, MarkerIcon, PhoneIcon } from "@/components/ui/icons";

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
    return <MailIcon />;
  }

  if (type === "office") {
    return <MarkerIcon />;
  }

  return <PhoneIcon />;
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
