"use client";

import styles from "./Promotions.module.css";

const WHATSAPP = "https://wa.me/56994872535?text=";

interface Promo {
  id: number;
  tag: string;
  title: string;
  description: string;
  price?: string;
  featured?: boolean;
  msg: string;
}

const promos: Promo[] = [
  {
    id: 1,
    tag: "Primera visita",
    title: "-20% en tu primer corte",
    description: "¿Es tu primera vez con nosotros? Te damos la bienvenida con un descuento especial.",
    msg: "¡Hola! Quiero usar la promo de primera visita.",
  },
  {
    id: 2,
    tag: "Combo estrella",
    title: "Corte + Barba",
    description: "El combo más pedido a precio especial. Look completo en una sola visita.",
    price: "$15.000",
    featured: true,
    msg: "¡Hola! Quiero el combo Corte + Barba.",
  },
  {
    id: 3,
    tag: "Estudiantes",
    title: "-15% con credencial",
    description: "Presenta tu credencial de estudiante y aprovecha el descuento todos los días.",
    msg: "¡Hola! Quiero la promo de estudiantes.",
  },
  {
    id: 4,
    tag: "Membresía",
    title: "Plan mensual",
    description: "Cortes ilimitados al mes por una tarifa fija. Ideal si te cuidas siempre.",
    msg: "¡Hola! Quiero info de la membresía mensual.",
  },
];

export default function Promotions() {
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

      <div className={styles.grid}>
        {promos.map((p) => (
          <article key={p.id} className={`${styles.card} ${p.featured ? styles.featured : ""}`}>
            {p.featured && <span className={styles.ribbon}>Más popular</span>}
            <span className={styles.tag}>{p.tag}</span>
            <h3 className={styles.cardTitle}>{p.title}</h3>
            {p.price && <p className={styles.price}>{p.price}</p>}
            <p className={styles.cardDescription}>{p.description}</p>
            <a
              href={WHATSAPP + encodeURIComponent(p.msg)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cta}
            >
              Aprovechar
              <span className={styles.ctaArrow}>→</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
