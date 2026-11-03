"use client";

import Image from "next/image";
import styles from "./About.module.css";
import logo from "@/public/logo-prestige-barber-circle.jpg";

const stats = [
  { value: "+10", label: "Años de historia" },
  { value: "+8.000", label: "Clientes felices" },
  { value: "5", label: "Barberos expertos" },
];

export default function About() {
  return (
    <section className={styles.section} id="nosotros">
      <div className={styles.layout}>
        {/* Imagen */}
        <div className={styles.imageCol}>
          <div className={styles.imageWrapper}>
            <Image
              src={logo}
              alt="Logo de Prestige Barber"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className={styles.logoImage}
            />
          </div>
        </div>

        {/* Texto */}
        <div className={styles.textCol}>
          <span className={styles.eyebrow}>Nuestra historia</span>
          <h2 className={styles.title}>Nacimos de una pasión por el oficio</h2>
          <p className={styles.text}>
            Empezamos con una sola silla y una idea clara: que cortarse el pelo
            fuera una experiencia, no un trámite. Hoy somos un equipo que combina
            la técnica clásica de la barbería tradicional con las tendencias
            actuales.
          </p>
          <p className={styles.text}>
            Lo que nos hace distintos no es solo el corte: es el detalle, la
            conversación y el compromiso de que salgas sintiéndote la mejor
            versión de ti mismo.
          </p>

          <div className={styles.stats}>
            {stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
