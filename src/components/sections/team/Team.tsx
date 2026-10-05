"use client";

import Image from "next/image";
import styles from "./Team.module.css";

interface Barber {
  id: number;
  name: string;
  role: string;
  years: string;
  imageUrl: string;
  instagram?: string;
}

const barbers: Barber[] = [
  {
    id: 1,
    name: "Matías Rojas",
    role: "Barbero master · Fades",
    years: "12 años",
    imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80",
    instagram: "#",
  },
  {
    id: 2,
    name: "Diego Fuentes",
    role: "Especialista en barba",
    years: "8 años",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80",
    instagram: "#",
  },
  {
    id: 3,
    name: "Cristóbal Vera",
    role: "Diseños & asesoría",
    years: "10 años",
    imageUrl: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=600&q=80",
    instagram: "#",
  },
  {
    id: 4,
    name: "Ignacio Soto",
    role: "Cortes clásicos",
    years: "6 años",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    instagram: "#",
  },
];

export default function Team() {
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

      <div className={styles.grid}>
        {barbers.map((b) => (
          <article key={b.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image
                src={b.imageUrl}
                alt={b.name}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className={styles.image}
              />
              <div className={styles.imageOverlay} />
              <span className={styles.years}>{b.years}</span>
            </div>
            <div className={styles.content}>
              <h3 className={styles.cardName}>{b.name}</h3>
              <p className={styles.cardRole}>{b.role}</p>
              {b.instagram && (
                <a href={b.instagram} className={styles.social} aria-label={`Instagram de ${b.name}`}>
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
      </div>
    </section>
  );
}
