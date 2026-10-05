"use client";

import Image from "next/image";
import styles from "./FinalCta.module.css";

const WHATSAPP = "https://wa.me/56994872535?text=" +
  encodeURIComponent("¡Hola! Quiero reservar mi hora.");

export default function FinalCta() {
  return (
    <section className={styles.section} id="reservar">
      <div className={styles.bg}>
        <Image
          src="https://images.unsplash.com/photo-1521490878406-4d4b1e51b2b0?w=1600&q=80"
          alt=""
          fill
          sizes="100vw"
          className={styles.bgImage}
        />
        <div className={styles.bgOverlay} />
      </div>

      <div className={styles.content}>
        <span className={styles.eyebrow}>Tu turno</span>
        <h2 className={styles.title}>¿Listo para renovar tu estilo?</h2>
        <p className={styles.subtitle}>
          Reserva en segundos por WhatsApp y vive la experiencia completa. Tu
          próxima mejor versión te está esperando.
        </p>
        <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={styles.cta}>
          Reservar ahora
          <span className={styles.ctaArrow}>→</span>
        </a>
      </div>
    </section>
  );
}
