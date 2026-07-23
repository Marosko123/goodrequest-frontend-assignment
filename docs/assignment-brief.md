# Assignment brief (verbatim source)

This file preserves the bilingual assignment brief exactly as supplied by GoodRequest.
It is the authoritative statement of scope: where any other document in this
repository contradicts it, this file wins.

Do not edit the text below. Interpretation and implementation decisions belong in
[ZADANIE.md](../ZADANIE.md) and [design-decisions.md](./design-decisions.md).

---

Cieľom zadania je vytvoriť jednoduchú aplikáciu v Next.js, ktorá slúži ako formulár pre nadáciu GoodBoy na podporu slovenských útulkov pre psy.

**Aplikácia by mala umožňovať potenciálnym podporovateľom:**

- zvoliť si formu pomoci- všeobecný príspevok pre nadáciu alebo príspevok pre konkrétny útulok
- vybrať si konkrétny útulok zo zoznamu zapojených útulkov (nepovinné pole v prípade všeobecného príspevku, v opačnom prípade povinné pole)
- zvoliť si výšku príspevku, pričom je možné nastaviť aj vlastnú hodnotu (povinné pole)
- vyplniť svoje osobné údaje:
    - meno- nepovinné pole (2-20 znakov)
    - priezvisko- povinné pole (2-30 znakov)
    - e-mail - validný formát e-mailovej adresy
    - telefón - slovenské alebo české číslo s predvoľbou +420 / +421 so zobrazením zvolenej krajiny vo forme vlajky štátu
    - potvrdiť súhlas so spracovaním osobných údajov (povinné pole)
    - odoslať zvalidovaný formulár, prípadne zrozumiteľne oznámiť používateľovi chybový stav
- pozrieť si kontaktné údaje organizácie v rámci stránky Kontakt
- zistiť celkovú vyzbieranú sumu a počet/zoznam darcov (tieto údaje sa pravidelne aktualizujú a sú dostupné cez endpoint opísaný nižšie)

Pre účely zadania sme vytvorili 3 jednoduché API endpointy - GET zoznamu útulkov zapojených do projektu, GET pre hodnotu vyzbieranej sumy a počet darcov a POST na odoslanie obsahu formuláru. Dokumentáciu k nim nájdete na nasledovnom odkaze: https://frontend-assignment-api.goodrequest.dev/apidoc/

Grafické podklady pre zadanie nájdete na nasledovnom odkaze (registrácia do toolu Figma je zdarma): https://www.figma.com/design/fOYdJW8UqfZjT8o2WYigty/Frontend-Assignment-2.0

Vizuálna kvalita spracovania aplikácie a štýlovanie je tiež predmetom hodnotenia. Plynulé a user friendly UI s peknými prechodmi a animáciami sú plusový bod. Môžete použiť Mantine, Antd alebo akúkoľvek inú UI knižnicu- výber nechávame na vás.

**Kritériá na použité technológie:**

- Použiť Next.js
- Použiť TypeScript
- Na server state management použiť [TanStack Query](https://tanstack.com/query/latest)
- Na client state management  (výber je na vás. Odporúčame context+reducer, zustand alebo iný)
- Knižnica pre správu formuláru (Odporúčame [react-hook-form](https://www.react-hook-form.com/), formik)
- Štruktúru projektu nechávame kompletne na vás, ale budeme ju hodnotiť. :)

*  Nice to have (nepovinné kritériá):
    - Použiť lokalizačnú knižnicu na stringy (napr. i18next)
    - Použiť styled-components
    - Validácia formuláru pomocou [Zod](https://zod.dev/) schémy
    - Myslieť na accessibility (https://www.goodrequest.com/sk/blog/pristupnost-webu-pre-vyvojarov)
    

*  Ak vám ostane čas alebo chuť :):

      - Responzívne zobrazenie
      - SEO (implementovať og:image a rôzne titles a descriptions na jednotlivých stepoch formuláru)
      - umožniť pridať viacerých darcov- je na vás ako to bude vyzerať

# Assignement for Frontend developer - GoodRequest

The goal of the task is to create a simple application in Next.js that serves as a form for the GoodBoy Foundation to support Slovak shelters for dogs.

**The application should allow potential supporters to:**

- choose the form of help- a general donation for the foundation or a donation for a specific shelter
- select a specific shelter from a list of participating shelters (optional field for a general donation, mandatory field if donating to a specific shelter)
- choose the amount of the donation, with the possibility to set a custom value (mandatory field)
- fill in their personal details:
    - name – optional field (2-20 characters)
    - surname – mandatory field (2-30 characters)
    - e-mail – valid format of the e-mail address
    - phone – Slovak or Czech number with the country code +420 / +421, showing the selected country flag
    - confirm consent for personal data processing (mandatory field)
    - submit the validated form, or clearly notify the user of any errors
- view the contact details of the organization on the Contact page
- see the total amount raised and the number/list of donors (these data are regularly updated and accessible through the API endpoint described below)

For the purpose of this assignment, we have created 3 simple API endpoints: a GET for the list of shelters participating in the project, a GET for the total amount raised and the number of donors, and a POST for submitting the form content. You can find the documentation for these endpoints at the following link: https://frontend-assignment-api.goodrequest.dev/apidoc/

Design assets for the assignment can be found at the following link (registration to Figma tool is free): https://www.figma.com/design/fOYdJW8UqfZjT8o2WYigty/Frontend-Assignment-2.0

The visual quality of the application and styling is also part of the evaluation. A smooth and user-friendly UI with nice transitions and animations will earn extra points. You may use Mantine, Antd, or any other UI library – the choice is up to you.

**Criteria for technologies to use:**

- Use Next.js
- Use TypeScript
- Use [TanStack Query](https://tanstack.com/query/latest) for server state management
- Use a client state management solution (The choice is yours. We recommend context + reducer, zustand or other )
- Use a library for form management (We recommend [react-hook-form](https://www.react-hook-form.com/), formik)
- You are free to decide the project structure, but we will evaluate it. :)

* Nice to have (optional criteria):

  - Use a localization library for strings (e.g., i18next)
  - Use styled-components
  - Form validation using a [Zod](https://zod.dev/) schema
  - Consider accessibility (https://www.goodrequest.com/en/blog/web-accessibility-for-developers)
    

* If you have some spare time :):
  - Responsive design
  - SEO (implement og:image and various titles and descriptions on different form steps)
  - Allow adding multiple donors – it's up to you how this will look
