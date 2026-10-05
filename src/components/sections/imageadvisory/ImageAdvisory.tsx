"use client";

import Image from "next/image";
import styles from "./ImageAdvisory.module.css";

const WHATSAPP = "https://wa.me/56994872535?text=" +
  encodeURIComponent("¡Hola! Me interesa la asesoría de imagen.");

const points = [
  "Análisis de tu tipo de rostro y facciones",
  "El estilo que va con tu personalidad y rutina",
  "Recomendaciones de mantención en casa",
  "Productos ideales para tu tipo de cabello",
];

export default function ImageAdvisory() {
  return (
    <section className={styles.section} id="asesoria">
      <div className={styles.layout}>
        {/* Texto */}
        <div className={styles.textCol}>
          <span className={styles.eyebrow}>Asesoría de imagen</span>
          <h2 className={styles.title}>
            No solo cortamos cabello.
          </h2>
          <p className={styles.lead}>
            Te ayudamos a encontrar el estilo que mejor representa tu
            personalidad. Antes de tomar la máquina, entendemos quién eres y
            hacia dónde quieres proyectar.
          </p>

          <ul className={styles.list}>
            {points.map((p) => (
              <li key={p} className={styles.listItem}>
                <span className={styles.check} aria-hidden="true">✓</span>
                {p}
              </li>
            ))}
          </ul>

          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={styles.cta}>
            Quiero mi asesoría
            <span className={styles.ctaArrow}>→</span>
          </a>
        </div>

        {/* Imagen */}
        <div className={styles.imageCol}>
          <div className={styles.imageWrapper}>
            <Image
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80"
              alt="Asesoría de imagen personalizada"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className={styles.image}
            />
          </div>
          <div className={styles.badge}>
            <span className={styles.badgeStar}>★</span>
            Servicio exclusivo
          </div>
        </div>
      </div>
    </section>
  );
}
