"use client";

import Image from "next/image";
import styles from "./Testimonials.module.css";

interface Review {
  id: number;
  name: string;
  text: string;
  rating: number;
  avatar: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Felipe A.",
    rating: 5,
    text: "El mejor fade que me han hecho en años. Se nota que son profesionales y la asesoría de imagen me cambió el look completamente.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
  },
  {
    id: 2,
    name: "Rodrigo M.",
    rating: 5,
    text: "Puntualidad total, ambiente increíble y el trato es de otro nivel. Ya soy cliente fijo, no me atiendo en otro lado.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    id: 3,
    name: "Sebastián T.",
    rating: 5,
    text: "Llegué sin saber qué corte quería y salí feliz. Me asesoraron según mi cara y quedó perfecto. 100% recomendado.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80",
  },
  {
    id: 4,
    name: "Andrés P.",
    rating: 5,
    text: "Productos de primera y detalle en todo. La barba me quedó impecable. Vale cada peso.",
    avatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=200&q=80",
  },
  {
    id: 5,
    name: "Camilo R.",
    rating: 5,
    text: "Reservé por WhatsApp en segundos y me atendieron a la hora exacta. El resultado, espectacular.",
    avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&q=80",
  },
  {
    id: 6,
    name: "Joaquín V.",
    rating: 5,
    text: "Ambiente moderno, música buena y barberos que saben lo que hacen. Una experiencia completa.",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&q=80",
  },
];

function Stars({ n }: { n: number }) {
  return (
    <span className={styles.stars} aria-label={`${n} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < n ? styles.starOn : styles.starOff}>★</span>
      ))}
    </span>
  );
}

export default function Testimonials() {
  return (
    <section className={styles.section} id="testimonios">
      <div className={styles.header}>
        <span className={styles.eyebrow}>Lo que dicen</span>
        <h2 className={styles.title}>Testimonios</h2>
        <div className={styles.divider} />
        <div className={styles.ratingSummary}>
          <Stars n={5} />
          <span className={styles.ratingText}><strong>4.9</strong> · +250 reseñas en Google</span>
        </div>
      </div>

      <div className={styles.grid}>
        {reviews.map((r) => (
          <article key={r.id} className={styles.card}>
            <span className={styles.quote}>&ldquo;</span>
            <Stars n={r.rating} />
            <p className={styles.text}>{r.text}</p>
            <div className={styles.author}>
              <div className={styles.avatar}>
                <Image src={r.avatar} alt={r.name} fill sizes="44px" className={styles.avatarImg} />
              </div>
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>{r.name}</span>
                <span className={styles.authorSource}>Cliente verificado</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
