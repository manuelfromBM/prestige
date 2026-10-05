"use client";

import Image from "next/image";
import styles from "./Hero.module.css";

const WHATSAPP = "https://wa.me/56994872535?text=" +
  encodeURIComponent("¡Hola! Quiero reservar una hora.");

export default function Hero() {
  return (
    <section className={styles.section} id="inicio">
      {/* Imagen de fondo */}
      <div className={styles.bg}>
        <Image
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600&q=80"
          alt="Barbería"
          fill
          priority
          sizes="100vw"
          className={styles.bgImage}
        />
        <div className={styles.bgOverlay} />
      </div>

      {/* Contenido */}
      <div className={styles.content}>
        <span className={styles.eyebrow}>Barbería premium</span>
        <h1 className={styles.title}>
          Más que un corte,
          <span className={styles.titleAccent}> una experiencia.</span>
        </h1>
        <p className={styles.subtitle}>
          Agenda hoy y transforma tu estilo con barberos certificados,
          productos premium y asesoría personalizada.
        </p>

        <div className={styles.actions}>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
            Reserva tu hora
            <span className={styles.btnArrow}>→</span>
          </a>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={styles.btnWhatsapp}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12 2a10 10 0 0 0-8.53 15.24L2 22l4.9-1.28A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-2.9.76.77-2.83-.2-.29A8.2 8.2 0 1 1 12 20.2z"/>
            </svg>
            WhatsApp
          </a>
        </div>

        {/* Mini indicadores de confianza */}
        <div className={styles.trust}>
          <span className={styles.trustItem}><strong>+10</strong> años de experiencia</span>
          <span className={styles.trustDot} />
          <span className={styles.trustItem}><strong>4.9★</strong> en Google</span>
          <span className={styles.trustDot} />
          <span className={styles.trustItem}>Barberos certificados</span>
        </div>
      </div>

      {/* Flecha scroll */}
      <a href="#beneficios" className={styles.scroll} aria-label="Bajar">
        <span className={styles.scrollLine} />
      </a>
    </section>
  );
}
