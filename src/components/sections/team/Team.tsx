"use client";

import Image from "next/image";
import Carousel from "@/src/components/carousel/Carousel";
import { isUnoptimized } from "@/src/lib/images";
import type { SiteContent } from "@/src/server/services/content-service";
import styles from "./Team.module.css";

export default function Team({ barbers }: { barbers: SiteContent["barbers"] }) {
  if (barbers.length === 0) return null;

  return (
    <section className={styles.section} id="equipo">
      <div className={styles.header}>
        <span className={styles.eyebrow}>Quiénes somos</span>
        <h2 className={styles.title}>Nuestro equipo</h2>
        <div className={styles.divider} />
        <p className={styles.subtitle}>
          Las personas hacen la experiencia. Conoce a los barberos que estarán
          detrás de tu próximo look.
        </p>
      </div>

      <Carousel className={styles.grid} label="Equipo">
        {barbers.map((b) => (
          <article key={b.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image
                src={b.imageUrl}
                alt={b.name}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className={styles.image}
                unoptimized={isUnoptimized(b.imageUrl)}
              />
              <div className={styles.imageOverlay} />
              {b.experienceYears !== null && (
                <span className={styles.years}>
                  {b.experienceYears} {b.experienceYears === 1 ? "año" : "años"}
                </span>
              )}
            </div>
            <div className={styles.content}>
              <h3 className={styles.cardName}>{b.name}</h3>
              <p className={styles.cardRole}>{b.role}</p>
              {b.instagram && (
                <a href={b.instagram} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label={`Instagram de ${b.name}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              )}
            </div>
          </article>
        ))}
      </Carousel>
    </section>
  );
}
