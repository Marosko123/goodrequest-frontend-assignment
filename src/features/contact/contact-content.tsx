"use client";

import { useTranslation } from "react-i18next";

import contactDog from "@/assets/contact-dog.jpg";
import { MailIcon, MarkerIcon, PhoneIcon } from "@/components/ui/icons";

import {
  ContactGrid,
  ContactImage,
  ContactItem,
  Icon,
  Page,
} from "./contact-content.styles";

type ContactItem = {
  href: string;
  icon: "email" | "office" | "phone";
};

const contactItems: ContactItem[] = [
  {
    href: "mailto:hello@goodrequest.com",
    icon: "email",
  },
  {
    href: "https://www.google.com/maps/search/?api=1&query=Obchodn%C3%A1%203D%2C%20010%2008%20%C5%BDilina%2C%20Slovakia",
    icon: "office",
  },
  {
    href: "tel:+421911750750",
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
  const { t } = useTranslation();
  const copy = {
    email: {
      title: t("contact.emailTitle"),
      description: t("contact.emailDescription"),
      value: "hello@goodrequest.com",
    },
    office: {
      title: t("contact.officeTitle"),
      description: t("contact.officeDescription"),
      value: t("contact.officeValue"),
    },
    phone: {
      title: t("contact.phoneTitle"),
      description: t("contact.phoneDescription"),
      value: "+421 911 750 750",
    },
  };

  return (
    <Page>
      <h1>{t("contact.title")}</h1>
      <ContactGrid>
        {contactItems.map((item) => {
          const itemCopy = copy[item.icon];
          return (
            <ContactItem data-contact={item.icon} key={item.icon}>
              <Icon>
                <ContactIcon type={item.icon} />
              </Icon>
              <h2>{itemCopy.title}</h2>
              <p>{itemCopy.description}</p>
              <a href={item.href}>{itemCopy.value}</a>
            </ContactItem>
          );
        })}
      </ContactGrid>
      <ContactImage
        alt={t("media.contactDog")}
        height={1706}
        priority
        sizes="(max-width: 900px) 100vw, 82rem"
        src={contactDog}
        width={2559}
      />
    </Page>
  );
}
