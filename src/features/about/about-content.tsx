import { ResultsStats } from "./results-stats";
import styles from "./about-content.module.scss";

export function AboutContent() {
  return (
    <article className={styles.page}>
      <h1>O projekte</h1>
      <p>
        Nadácia Good Boy sa venuje zlepšovaniu života psov v Žiline na
        Slovensku. Zachraňujeme opustené, týrané a bezdomovské psy, poskytujeme
        im lekársku starostlivosť, útočisko a lásku, ktorú si zaslúžia. Naším
        poslaním je dať týmto verným spoločníkom druhú šancu na život tým, že im
        nájdeme milujúci domov. Okrem záchrany a rehabilitácie sa zameriavame aj
        na podporu zodpovedného vlastníctva zvierat a ochrany zvierat
        prostredníctvom vzdelávacích a komunitných programov.
      </p>

      <section aria-label="Aktuálne výsledky" className={styles.stats}>
        <ResultsStats />
      </section>

      <p>
        Naša práca je možná vďaka podpore vášnivých dobrovoľníkov, štedrých
        darcov a komunity, ktorá sa hlboko stará o dobro zvierat. Organizujeme
        aj kastračné a sterilizačné iniciatívy, aby sme riešili problém túlavých
        psov a zabezpečili dlhodobý vplyv. V nadácii Good Boy veríme, že každý
        pes si zaslúži bezpečný, milujúci domov a šťastný život. Pridajte sa k
        nám a pomôžte nám robiť zmeny – či už dobrovoľníctvom, darovaním alebo
        adopciou chlpatého priateľa. Spoločne môžeme vytvoriť lepšiu budúcnosť
        pre psy v Žiline.
      </p>
    </article>
  );
}
