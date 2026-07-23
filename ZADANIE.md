# Implementačné zadanie

## Cieľ

Vytvoriť kvalitnú, responzívnu aplikáciu v Next.js a TypeScripte, ktorá umožní podporiť nadáciu GoodBoy alebo konkrétny slovenský útulok. Zdrojový dvojjazyčný brief je v [docs/assignment-brief.md](./docs/assignment-brief.md); pri rozpore má prednosť jeho obsah.

## Povinné používateľské scenáre

- Darca si zvolí všeobecný príspevok alebo príspevok konkrétnemu útulku.
- Zoznam útulkov sa načíta z dodaného API. Útulok je povinný pri adresnom príspevku a nepovinný pri všeobecnom príspevku.
- Darca si zvolí predvolenú alebo vlastnú povinnú sumu.
- Formulár spracuje meno (nepovinné, 2–20 znakov), priezvisko (povinné, 2–30 znakov), platný e-mail, slovenské alebo české telefónne číslo s predvoľbou `+421`/`+420` a príslušnou vlajkou.
- Povinný súhlas so spracovaním osobných údajov musí byť potvrdený pred odoslaním.
- Platné dáta sa odošlú cez dodaný POST endpoint. Chyby validácie, siete aj servera sa zobrazia zrozumiteľne a bez straty vyplnených údajov.
- Samostatná kontaktná stránka zobrazí údaje organizácie.
- Aplikácia zobrazí pravidelne aktualizovanú vyzbieranú sumu a počet alebo zoznam darcov z dodaného API.

## Povinný technický základ

- Next.js, TypeScript a pnpm s commitnutým `pnpm-lock.yaml`.
- TanStack Query pre serverový stav.
- Samostatné riešenie klientského stavu, napríklad Context + reducer alebo Zustand.
- Knižnica pre správu formulára, napríklad React Hook Form alebo Formik.
- Prístupnosť, responzívnosť, jasné focus/error/success stavy a rozumné rešpektovanie `prefers-reduced-motion`.
- Štruktúra s jasne oddelenými UI, formulárovými, validačnými a API zodpovednosťami.

## Podklady

- API dokumentácia: https://frontend-assignment-api.goodrequest.dev/apidoc/
- Figma: https://www.figma.com/design/fOYdJW8UqfZjT8o2WYigty/Frontend-Assignment-2.0
- Odporúčania pre prístupnosť: https://www.goodrequest.com/sk/blog/pristupnost-webu-pre-vyvojarov

## GitHub Pages kontrakt

- Produkčný build musí byť statický export Next.js cez `output: "export"` a musí vytvoriť priečinok `out/` s `index.html`.
- Projektová Pages URL používa podcestu `/goodrequest-frontend-assignment`; odkazy a statické assety musia fungovať aj pod týmto `basePath`.
- Funkcie vyžadujúce trvalý Next.js server, napríklad API routes, SSR alebo predvolená serverová optimalizácia obrázkov, sa nesmú použiť.
- Dodané externé API sa volá z klienta cez TanStack Query. Do klientského buildu nesmú vstúpiť tajné hodnoty.
- Workflow vykoná `pnpm install --frozen-lockfile`, `pnpm build`, overí `out/index.html` a nasadí obsah `out/`.

## Akceptačné kritériá

- Všetky povinné scenáre a podmienené validácie fungujú pri úspechu aj chybách API.
- Ovládanie je použiteľné klávesnicou, má zrozumiteľné popisy a spätne väzby a funguje na mobile aj desktope.
- Vizuál zodpovedá dodanému dizajnu a prechody nebránia používaniu.
- Build je deterministický cez frozen pnpm lockfile, prejde bez chýb a výsledný statický export funguje na GitHub Pages pod projektovou URL.
- Voliteľné rozšírenia ako lokalizácia, Zod, SEO metadata či viacerí darcovia sa pridajú až po spoľahlivom dokončení povinného rozsahu.

## Aktuálny stav

Repozitár obsahuje hotovú statickú Next.js aplikáciu s kompletným trojkrokovým flow, kontaktnou stránkou, stránkou o projekte, živými API dátami, testami a výkonnostnými limitmi. Workflow po úspešných kontrolách nasadí export `out/` na GitHub Pages.
