import type { TranslationShape } from "../types";
import type { sk } from "./sk";

export const cz = {
  common: {
    back: "Zpět",
    continue: "Pokračovat",
    retry: "Zkusit znovu",
    contact: "Kontakt",
    about: "O projektu",
    formErrors: "Formulář obsahuje chyby",
    skipToContent: "Přeskočit na hlavní obsah",
  },
  language: {
    label: "Jazyk stránky",
    openMenu: "Vybrat jazyk",
    sk: "SK",
    en: "EN",
    cz: "CZ",
    switchToSk: "Přepnout do slovenštiny",
    switchToEn: "Přepnout do angličtiny",
    switchToCz: "Přepnout do češtiny",
  },
  navigation: {
    home: "Good Boy – domů",
    socials: "Sociální sítě",
    supplementary: "Doplňkové stránky",
  },
  media: {
    dogPanel: "Fotografie podporovaného psa",
    donationDog: "Mladý pes na pláži",
    contactDog: "Zlatý retrívr u vody",
  },
  steps: {
    progress: "Průběh příspěvku",
    selection: "Výběr útulku",
    details: "Osobní údaje",
    review: "Potvrzení",
    status: {
      current: "Aktuální krok",
      finished: "Dokončeno",
      inProgress: "Zpracovává se",
      wait: "Čeká",
      error: "Chyba",
    },
  },
  selection: {
    title: "Vyberte si, jak chcete pomoci",
    targetLegend: "Forma pomoci",
    shelterTarget: "Přispět konkrétnímu útulku",
    foundationTarget: "Přispět celé nadaci",
    sheltersLoadTitle: "Útulky se nepodařilo načíst",
    sheltersLoadMessage: "Zkontrolujte připojení a zkuste načtení zopakovat.",
    shelterLabel: "Útulek",
    sheltersLoading: "Načítám útulky…",
    shelterPlaceholder: "Vyberte útulek ze seznamu",
    amountLegend: "Částka, kterou chci přispět",
    customAmount: "Vlastní částka",
    presetAmounts: "Přednastavené částky",
    amountErrorEmpty: "Zadejte částku příspěvku.",
    amountErrorNonPositive: "Částka příspěvku musí být vyšší než nula.",
    amountErrorFormat:
      "Použijte pouze číslice a nejvýše jeden desetinný oddělovač.",
    amountErrorPrecision: "Použijte nejvýše dvě desetinná místa.",
    amountErrorTooLarge: "Maximální výše příspěvku je 999 999 €.",
    shelterError: "Vyberte útulek ze seznamu.",
    sheltersEmptyTitle: "Žádné dostupné útulky",
    sheltersEmptyMessage:
      "Konkrétnímu útulku nyní nelze přispět. Zkuste to později nebo přispějte celé nadaci.",
    sheltersEmptyPlaceholder: "Není dostupný žádný útulek",
  },
  details: {
    title: "Potřebujeme od Vás několik informací",
    sectionTitle: "O Vás",
    firstName: "Jméno",
    firstNamePlaceholder: "Zadejte své jméno",
    lastName: "Příjmení",
    lastNamePlaceholder: "Zadejte své příjmení",
    email: "E-mailová adresa",
    emailPlaceholder: "Zadejte svůj e-mail",
    phone: "Telefonní číslo",
    phoneCountry: "Země telefonního čísla",
    phoneDialCode: "Předvolba telefonního čísla",
    slovakia: "Slovensko +421",
    czechia: "Česko +420",
    firstNameError:
      "Jméno může zůstat prázdné nebo obsahovat nejvýše 20 písmen, mezer, apostrofů či spojovníků.",
    lastNameError:
      "Zadejte platné příjmení s písmeny, mezerami, apostrofy nebo spojovníky.",
    emailError: "Zadejte platnou e-mailovou adresu.",
    emailTooLongError: "E-mailová adresa může mít nejvýše 254 znaků.",
    phoneRequiredError: "Zadejte telefonní číslo.",
    phoneCharactersError:
      "Telefonní číslo může obsahovat pouze číslice, mezery, závorky, tečky, + a pomlčky.",
    phoneCountryError:
      "Použijte slovenské nebo české číslo s předvolbou +421 nebo +420.",
    phoneTooLongError: "Telefonní číslo je příliš dlouhé.",
    phoneError: "Zadejte platné slovenské nebo české telefonní číslo.",
  },
  review: {
    title: "Zkontrolujte zadané údaje",
    formLabel: "Potvrzení příspěvku",
    summary: "Shrnutí",
    helpType: "Forma pomoci",
    foundationHelp: "Finanční příspěvek celé nadaci",
    shelterHelp: "Finanční příspěvek konkrétnímu útulku",
    shelter: "Útulek",
    amount: "Částka příspěvku",
    personalData: "Osobní údaje",
    fullName: "Jméno a příjmení",
    email: "E-mail",
    phone: "Telefonní číslo",
    consent: "Souhlasím se zpracováním svých osobních údajů",
    consentError: "K odeslání příspěvku je nutný Váš souhlas.",
    submit: "Odeslat formulář",
    submitting: "Odesíláme…",
    resend: "Odeslat znovu",
    status: {
      submittingTitle: "Čekáme na potvrzení",
      submittingMessage:
        "Příspěvek odesíláme. Počkejte, dokud nedostaneme potvrzení.",
      restoredTitle: "Připojení je obnoveno",
      restoredMessage:
        "Příspěvek jsme automaticky neodeslali. Až budete připraveni, zkuste to znovu.",
    },
    errors: {
      offlineTitle: "Jste offline",
      offlineMessage:
        "Připojte se k internetu a poté příspěvek odešlete znovu. Požadavek neopakujeme automaticky.",
      unknownTitle: "Výsledek odeslání neznáme",
      unknownMessage:
        "Spojení se po odeslání požadavku přerušilo. Příspěvek mohl být přijat, proto požadavek neopakujeme automaticky. Opětovné odeslání může vytvořit duplicitní příspěvek.",
      rateLimitTitle: "Příliš mnoho pokusů",
      rateLimitMessage: "Chvíli počkejte a potom příspěvek odešlete znovu.",
      invalidTitle: "Příspěvek se nepodařilo přijmout",
      invalidMessage:
        "Zkontrolujte zadané údaje. Pokud jsou správné, zkuste odeslání zopakovat.",
      serviceTitle: "Služba je dočasně nedostupná",
      serviceMessage: "Příspěvek jsme nepotvrdili. Zkuste to prosím později.",
    },
  },
  success: {
    title: "Děkujeme za Váš příspěvek",
    message: "Příspěvek byl úspěšně přijat.",
    again: "Přispět znovu",
  },
  notFound: {
    title: "Tuhle stopu jsme nenašli.",
    description:
      "Stránka se asi zatoulala. Vraťte se na úvod a pokračujte po známé trase.",
    home: "Zpět domů",
  },
  about: {
    title: "O projektu",
    intro:
      "Nadace Good Boy se věnuje zlepšování života psů v Žilině na Slovensku. Zachraňujeme opuštěné, týrané a bezprizorní psy a poskytujeme jim lékařskou péči, útočiště a lásku, kterou si zaslouží. Naším posláním je dát těmto věrným společníkům druhou šanci na život a najít jim milující domov. Vedle záchrany a rehabilitace podporujeme odpovědné chovatelství a ochranu zvířat prostřednictvím vzdělávacích a komunitních programů.",
    results: "Aktuální výsledky",
    outro:
      "Naše práce je možná díky nadšeným dobrovolníkům, štědrým dárcům a komunitě, které záleží na dobrých životních podmínkách zvířat. Pořádáme také kastrační programy, které pomáhají řešit problém toulavých psů a přinášejí dlouhodobý dopad. V nadaci Good Boy věříme, že každý pes si zaslouží bezpečný, milující domov a šťastný život. Přidejte se k nám a pomozte dobrovolnictvím, darem nebo adopcí chlupatého přítele. Společně můžeme vytvořit lepší budoucnost pro psy v Žilině.",
  },
  stats: {
    loading: "Načítám statistiky",
    loadTitle: "Statistiky se nepodařilo načíst",
    loadMessage:
      "Aktuální hodnoty nejsou dostupné. Neaktuální údaje místo nich nezobrazujeme.",
    contribution: "Celková vybraná částka",
    contributors: "Počet dárců",
    refreshTitle: "Statistiky se nepodařilo aktualizovat",
    refreshMessage: "Zobrazujeme poslední úspěšně načtené hodnoty.",
  },
  contact: {
    title: "Kontakt",
    emailTitle: "E-mail",
    emailDescription: "Náš tým Vám rád pomůže.",
    officeTitle: "Kancelář",
    officeDescription: "Rádi Vás přivítáme v naší kanceláři.",
    officeValue: "Obchodná 3D, 010 08 Žilina, Slovensko",
    phoneTitle: "Telefon",
    phoneDescription: "Pondělí až pátek od 8:00 do 17:00.",
    copiedToClipboard: "Zkopírováno do schránky",
  },
  seo: {
    siteTitle: "GoodBoy – Pomozte psům a útulkům",
    siteDescription:
      "Přispějte nadaci GoodBoy nebo konkrétnímu slovenskému útulku. Vyberte si, komu a jakou částkou pomůžete.",
    imageAlt: "Logo GoodBoy a zlatý retrívr na pláži.",
    homeTitle: "Pomozte psům a útulkům",
    homeDescription:
      "Přispějte nadaci GoodBoy nebo konkrétnímu slovenskému útulku. Vyberte si, komu a jakou částkou pomůžete.",
    aboutTitle: "Jak GoodBoy pomáhá",
    aboutDescription:
      "Poznejte poslání nadace GoodBoy a její aktuální výsledky pomoci psům.",
    contactTitle: "Kontakt",
    contactDescription: "Kontaktujte tým GoodRequest v Žilině.",
    detailsTitle: "Osobní údaje",
    detailsDescription: "Doplňte údaje potřebné k odeslání příspěvku.",
    reviewTitle: "Zkontrolujte příspěvek",
    reviewDescription: "Zkontrolujte údaje a odešlete svůj příspěvek.",
    successTitle: "Děkujeme za pomoc",
    successDescription: "Váš příspěvek jsme úspěšně přijali.",
  },
} as const satisfies TranslationShape<typeof sk>;
