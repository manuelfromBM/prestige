"use client";

import Image from "next/image";
import styles from "./Trends.module.css";

interface Trend {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

const trends: Trend[] = [
  {
    id: 1,
    name: "Burst Fade",
    description: "Degradado circular alrededor de la oreja. Moderno y versátil.",
    imageUrl: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80",
  },
  {
    id: 2,
    name: "Low Taper",
    description: "Degradado sutil y bajo. Elegante, discreto y siempre vigente.",
    imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80",
  },
  {
    id: 3,
    name: "Mullet",
    description: "Corto adelante, largo atrás. El clásico rebelde que volvió con fuerza.",
    imageUrl: "https://images.unsplash.com/photo-1584316712724-f5d4b188fee2?w=600&q=80",
  },
  {
    id: 4,
    name: "French Crop",
    description: "Flequillo recto y lados cortos. Fácil de mantener y muy pedido.",
    imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80",
  },
];

export default function Trends() {
  return (
    <section className={styles.section} id="tendencias">
      <div className={styles.header}>
        <span className={styles.eyebrow}>En tendencia</span>
        <h2 className={styles.title}>Los cortes del momento</h2>
        <div className={styles.divider} />
        <p className={styles.subtitle}>
          ¿No sabes qué pedir? Estos son los estilos que más nos piden hoy.
        </p>
      </div>

      <div className={styles.grid}>
        {trends.map((t) => (
          <article key={t.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image
                src={t.imageUrl}
                alt={t.name}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className={styles.image}
              />
              <div className={styles.overlay} />
              <div className={styles.info}>
                <h3 className={styles.cardName}>{t.name}</h3>
                <p className={styles.cardDescription}>{t.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
