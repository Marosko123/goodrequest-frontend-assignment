"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import contactDogDesktop from "@/assets/contact-dog-desktop.webp";
import contactDogMobile from "@/assets/contact-dog-mobile.webp";
import { MailIcon, MarkerIcon, PhoneIcon } from "@/components/ui/icons";

import {
  ContactGrid,
  ContactImage,
  ContactItem,
  CopyFeedback,
  CopyValue,
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
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const copyRequest = useRef(0);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  useEffect(() => {
    return () => {
      copyRequest.current += 1;

      if (feedbackTimer.current) {
        clearTimeout(feedbackTimer.current);
      }
    };
  }, []);

  const clearFeedback = () => {
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
      feedbackTimer.current = null;
    }

    setCopiedValue(null);
  };

  const handleCopy = async (value: string) => {
    const requestId = ++copyRequest.current;
    clearFeedback();

    if (!navigator.clipboard?.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }

    if (requestId !== copyRequest.current) {
      return;
    }

    setCopiedValue(value);
    feedbackTimer.current = setTimeout(() => {
      setCopiedValue(null);
      feedbackTimer.current = null;
    }, 1_500);
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
              {item.icon === "office" ? (
                <a href={item.href}>{itemCopy.value}</a>
              ) : (
                <CopyValue>
                  {copiedValue === itemCopy.value ? (
                    <CopyFeedback aria-live="polite" role="status">
                      {t("contact.copiedToClipboard")}
                    </CopyFeedback>
                  ) : null}
                  <button
                    onClick={() => void handleCopy(itemCopy.value)}
                    type="button"
                  >
                    {itemCopy.value}
                  </button>
                </CopyValue>
              )}
            </ContactItem>
          );
        })}
      </ContactGrid>
      <picture>
        <source
          media="(width > 48rem)"
          srcSet={contactDogDesktop.src}
          type="image/webp"
        />
        <ContactImage
          alt={t("media.contactDog")}
          decoding="async"
          draggable={false}
          height={contactDogMobile.height}
          loading="lazy"
          src={contactDogMobile.src}
          style={{
            "--media-blur-desktop": `url(${contactDogDesktop.blurDataURL})`,
            "--media-blur-mobile": `url(${contactDogMobile.blurDataURL})`,
          }}
          width={contactDogMobile.width}
        />
      </picture>
    </Page>
  );
}
