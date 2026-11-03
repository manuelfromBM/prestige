"use client";

import Carousel from "@/src/components/carousel/Carousel";
import type { SiteContent } from "@/src/server/services/content-service";
import styles from "./Promotions.module.css";

const WHATSAPP = "https://wa.me/56994872535?text=";

const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

export default function Promotions({ promos }: { promos: SiteContent["promotions"] }) {
  if (promos.length === 0) return null;

  return (
    <section className={styles.section} id="promociones">
      <div className={styles.header}>
        <span className={styles.eyebrow}>Ofertas</span>
        <h2 className={styles.title}>Promociones</h2>
        <div className={styles.divider} />
        <p className={styles.subtitle}>
          Aprovecha nuestros descuentos y combos. Válidos presentando la promo al reservar.
        </p>
      </div>

      <Carousel className={styles.grid} label="Promociones">
        {promos.map((p) => (
          <article key={p.id} className={`${styles.card} ${p.featured ? styles.featured : ""}`}>
            {p.featured && <span className={styles.ribbon}>Más popular</span>}
            <span className={styles.tag}>{p.tag}</span>
            <h3 className={styles.cardTitle}>{p.title}</h3>
            {p.price !== null && <p className={styles.price}>{clp.format(p.price)}</p>}
            <p className={styles.cardDescription}>{p.description}</p>
            <a
              href={WHATSAPP + encodeURIComponent(p.message)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cta}
            >
              Aprovechar
              <span className={styles.ctaArrow}>→</span>
            </a>
          </article>
        ))}
      </Carousel>
    </section>
  );
}
