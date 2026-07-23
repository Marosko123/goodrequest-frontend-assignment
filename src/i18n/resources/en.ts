import type { TranslationShape } from "../types";
import type { sk } from "./sk";

export const en = {
  common: {
    back: "Back",
    continue: "Continue",
    retry: "Try again",
    contact: "Contact",
    about: "About the project",
    skipToContent: "Skip to main content",
  },
  language: {
    label: "Page language",
    openMenu: "Choose language",
    sk: "SK",
    en: "EN",
    cz: "CZ",
    switchToSk: "Switch to Slovak",
    switchToEn: "Switch to English",
    switchToCz: "Switch to Czech",
  },
  navigation: {
    home: "Good Boy – home",
    socials: "Social media",
    supplementary: "Additional pages",
  },
  media: {
    dogPanel: "Photo of a supported dog",
    donationDog: "Young dog on a beach",
    contactDog: "Golden retriever by the water",
  },
  steps: {
    progress: "Donation progress",
    selection: "Shelter selection",
    details: "Personal details",
    review: "Confirmation",
    status: {
      current: "Current step",
      finished: "Completed",
      inProgress: "Processing",
      wait: "Waiting",
      error: "Error",
    },
  },
  selection: {
    title: "Choose how you would like to help",
    targetLegend: "Type of support",
    shelterTarget: "Contribute to a specific shelter",
    foundationTarget: "Contribute to the whole foundation",
    sheltersLoadTitle: "Shelters could not be loaded",
    sheltersLoadMessage: "Check your connection and try loading them again.",
    shelterLabel: "Shelter",
    sheltersLoading: "Loading shelters…",
    shelterPlaceholder: "Choose a shelter from the list",
    amountLegend: "Amount I would like to contribute",
    customAmount: "Custom amount",
    presetAmounts: "Preset amounts",
    amountErrorEmpty: "Enter a contribution amount.",
    amountErrorNonPositive:
      "The contribution amount must be greater than zero.",
    amountErrorFormat: "Use digits and at most one decimal separator.",
    amountErrorPrecision: "Use no more than two decimal places.",
    amountErrorTooLarge: "The maximum contribution is 999,999 €.",
    shelterError: "Choose a shelter from the list.",
    sheltersEmptyTitle: "No shelters available",
    sheltersEmptyMessage:
      "A specific shelter cannot be selected right now. Try again later or contribute to the whole foundation.",
    sheltersEmptyPlaceholder: "No shelter is currently available",
  },
  details: {
    title: "We need a few details from you",
    sectionTitle: "About you",
    firstName: "First name",
    firstNamePlaceholder: "Enter your first name",
    lastName: "Last name",
    lastNamePlaceholder: "Enter your last name",
    email: "Email address",
    emailPlaceholder: "Enter your email",
    phone: "Phone number",
    phoneCountry: "Phone number country",
    phoneDialCode: "Phone number country code",
    slovakia: "Slovakia +421",
    czechia: "Czechia +420",
    firstNameError:
      "First name may remain empty or contain up to 20 letters, spaces, apostrophes or hyphens.",
    lastNameError:
      "Enter a valid last name using letters, spaces, apostrophes or hyphens.",
    emailError: "Enter a valid email address.",
    emailTooLongError:
      "An email address may contain no more than 254 characters.",
    phoneRequiredError: "Enter a phone number.",
    phoneCharactersError:
      "A phone number may contain only digits, spaces, parentheses, periods, + and hyphens.",
    phoneCountryError:
      "Use a Slovak or Czech number with the +421 or +420 country code.",
    phoneTooLongError: "The phone number is too long.",
    phoneError: "Enter a valid Slovak or Czech phone number.",
  },
  review: {
    title: "Review your details",
    formLabel: "Contribution confirmation",
    summary: "Summary",
    helpType: "Type of support",
    foundationHelp: "Financial contribution to the whole foundation",
    shelterHelp: "Financial contribution to a specific shelter",
    shelter: "Shelter",
    amount: "Contribution amount",
    personalData: "Personal details",
    fullName: "Full name",
    email: "Email",
    phone: "Phone number",
    consent: "I consent to the processing of my personal data",
    consentError: "Your consent is required to submit the contribution.",
    submit: "Submit form",
    submitting: "Submitting…",
    resend: "Submit again",
    status: {
      submittingTitle: "Waiting for confirmation",
      submittingMessage:
        "We are submitting the contribution. Wait until we receive confirmation.",
      restoredTitle: "Connection restored",
      restoredMessage:
        "We did not submit the contribution automatically. Try again when you are ready.",
    },
    errors: {
      offlineTitle: "You are offline",
      offlineMessage:
        "Connect to the internet and submit the contribution again. We will not retry the request automatically.",
      unknownTitle: "The submission outcome is unknown",
      unknownMessage:
        "The connection was interrupted after the request was sent. The contribution may have been received, so we will not retry it automatically. Submitting again may create a duplicate contribution.",
      rateLimitTitle: "Too many attempts",
      rateLimitMessage: "Wait a moment, then submit the contribution again.",
      invalidTitle: "The contribution could not be accepted",
      invalidMessage:
        "Check the details you entered. If they are correct, try submitting again.",
      serviceTitle: "The service is temporarily unavailable",
      serviceMessage:
        "We could not confirm the contribution. Please try again later.",
    },
  },
  success: {
    title: "Thank you for your contribution",
    message: "Your contribution was received successfully.",
    again: "Contribute again",
  },
  notFound: {
    title: "We couldn't find this trail.",
    description:
      "This page seems to have wandered off. Head home and continue on familiar ground.",
    home: "Back home",
  },
  about: {
    title: "About the project",
    intro:
      "The Good Boy Foundation works to improve the lives of dogs in Žilina, Slovakia. We rescue abandoned, abused and homeless dogs and provide the medical care, shelter and love they deserve. Our mission is to give these loyal companions a second chance by finding them loving homes. Alongside rescue and rehabilitation, we promote responsible pet ownership and animal welfare through educational and community programmes.",
    results: "Current results",
    outro:
      "Our work is possible thanks to passionate volunteers, generous donors and a community that cares deeply about animal welfare. We also organise spaying and neutering initiatives to address the number of stray dogs and create long-term impact. At the Good Boy Foundation, we believe every dog deserves a safe, loving home and a happy life. Join us and help make a difference through volunteering, donating or adopting a furry friend. Together, we can create a better future for dogs in Žilina.",
  },
  stats: {
    loading: "Loading statistics",
    loadTitle: "Statistics could not be loaded",
    loadMessage:
      "Current values are unavailable. We do not show outdated data instead.",
    contribution: "Total amount raised",
    contributors: "Number of donors",
    refreshTitle: "Statistics could not be updated",
    refreshMessage: "The last successfully loaded values are shown.",
  },
  contact: {
    title: "Contact",
    emailTitle: "Email",
    emailDescription: "Our friendly team is here to help.",
    officeTitle: "Office",
    officeDescription: "Come and say hello at our office.",
    officeValue: "Obchodná 3D, 010 08 Žilina, Slovakia",
    phoneTitle: "Phone",
    phoneDescription: "Monday to Friday from 8am to 5pm.",
    copiedToClipboard: "Copied to clipboard",
  },
  seo: {
    siteTitle: "GoodBoy – Help dogs and shelters",
    siteDescription:
      "Support the GoodBoy Foundation or a specific Slovak shelter. Choose who to help and how much to contribute.",
    imageAlt: "GoodBoy logo and a golden retriever on a beach.",
    homeTitle: "Help dogs and shelters",
    homeDescription:
      "Support the GoodBoy Foundation or a specific Slovak shelter. Choose who to help and how much to contribute.",
    aboutTitle: "How GoodBoy helps",
    aboutDescription:
      "Learn about the GoodBoy Foundation's mission and its current impact for dogs.",
    contactTitle: "Contact",
    contactDescription: "Contact the GoodRequest team in Žilina.",
    detailsTitle: "Your details",
    detailsDescription:
      "Enter the details required to submit your contribution.",
    reviewTitle: "Review your contribution",
    reviewDescription: "Review your details and submit your contribution.",
    successTitle: "Thank you for helping",
    successDescription: "We received your contribution successfully.",
  },
} as const satisfies TranslationShape<typeof sk>;
