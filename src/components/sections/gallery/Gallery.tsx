"use client";

import Image from "next/image";
import styles from "./Gallery.module.css";

interface Work {
  id: number;
  label: string;
  before: string;
  after: string;
}

const works: Work[] = [
  {
    id: 1,
    label: "Fade + Barba",
    before: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=600&q=80",
    after: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80",
  },
  {
    id: 2,
    label: "Corte clásico",
    before: "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=600&q=80",
    after: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80",
  },
  {
    id: 3,
    label: "Diseño + Perfilado",
    before: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
    after: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80",
  },
  {
    id: 4,
    label: "Texturizado",
    before: "https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=600&q=80",
    after: "https://images.unsplash.com/photo-1584316712724-f5d4b188fee2?w=600&q=80",
  },
  {
    id: 5,
    label: "Barba completa",
    before: "https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=600&q=80",
    after: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&q=80",
  },
  {
    id: 6,
    label: "Low Taper",
    before: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=80",
    after: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80",
  },
];

export default function Gallery() {
  return (
    <section className={styles.section} id="galeria">
      <div className={styles.header}>
        <span className={styles.eyebrow}>Nuestro trabajo</span>
        <h2 className={styles.title}>Antes & Después</h2>
        <div className={styles.divider} />
        <p className={styles.subtitle}>
          Pasa el cursor sobre cada trabajo para ver la transformación. Resultados
          reales de nuestros clientes.
        </p>
      </div>

      <div className={styles.grid}>
        {works.map((w) => (
          <figure key={w.id} className={styles.card}>
            <div className={styles.beforeLayer}>
              <Image
                src={w.before}
                alt={`${w.label} — antes`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className={styles.image}
              />
              <span className={`${styles.tag} ${styles.tagBefore}`}>Antes</span>
            </div>
            <div className={styles.afterLayer}>
              <Image
                src={w.after}
                alt={`${w.label} — después`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className={styles.image}
              />
              <span className={`${styles.tag} ${styles.tagAfter}`}>Después</span>
            </div>
            <figcaption className={styles.caption}>{w.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
