"use client";

import styles from "./Benefits.module.css";

interface Benefit {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const benefits: Benefit[] = [
  {
    id: 1,
    title: "Barberos certificados",
    description: "Profesionales con formación y experiencia comprobada en cada técnica.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.3 7.2 16.9l.9-5.4L4.2 7.7l5.4-.8L12 2z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Atención personalizada",
    description: "Cada cliente es único. Escuchamos y adaptamos el estilo a ti.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a7 7 0 0 1 14 0v1" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Productos premium",
    description: "Trabajamos solo con marcas de primera para cuidar tu cabello y piel.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 2h6v3l1 2v13a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V7l1-2V2z" />
        <path d="M8 11h8" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Ambiente moderno",
    description: "Un espacio pensado para que te relajes y disfrutes la experiencia.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21V9l9-6 9 6v12" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    id: 5,
    title: "Puntualidad",
    description: "Respetamos tu tiempo. Reservas con hora y te atendemos a la hora.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    id: 6,
    title: "Reserva fácil",
    description: "Agenda por WhatsApp en segundos, sin llamadas ni esperas.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4" />
      </svg>
    ),
  },
];

export default function Benefits() {
  return (
    <section className={styles.section} id="beneficios">
      <div className={styles.header}>
        <span className={styles.eyebrow}>Por qué elegirnos</span>
        <h2 className={styles.title}>La diferencia se nota</h2>
        <div className={styles.divider} />
        <p className={styles.subtitle}>
          No solo cortamos cabello. Creamos una experiencia completa donde cada
          detalle importa.
        </p>
      </div>

      <div className={styles.grid}>
        {benefits.map((b) => (
          <article key={b.id} className={styles.card}>
            <div className={styles.iconWrap}>{b.icon}</div>
            <h3 className={styles.cardTitle}>{b.title}</h3>
            <p className={styles.cardDescription}>{b.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
