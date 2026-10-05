"use client";

import Image from "next/image";
import styles from "./Services.module.css";

interface Service {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  tag?: string;
}

const services: Service[] = [
  {
    id: 1,
    name: "Degradado",
    description: "Transición perfecta de corto a largo con técnica de máquina experta.",
    imageUrl: "https://images.unsplash.com/photo-1570654639102-bdd95efeca7a?w=600&q=80",
    tag: "Más pedido",
  },
  {
    id: 2,
    name: "Perfilaciones",
    description: "Líneas limpias y definidas que enmarcan tu rostro con precisión.",
    imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80",
  },
  {
    id: 3,
    name: "Diseños",
    description: "Arte en cabello: patrones, figuras y grabados a medida.",
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
    tag: "Premium",
  },
  {
    id: 4,
    name: "Cortes",
    description: "Desde clásico a moderno — el corte que refleja quién eres.",
    imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80",
  },
  {
    id: 5,
    name: "Cejas",
    description: "Perfilado y diseño de cejas para un look definido y armónico.",
    imageUrl: "https://images.unsplash.com/photo-1570654639102-bdd95efeca7a?w=600&q=80",
  },
  {
    id: 6,
    name: "Barbas",
    description: "Arreglo, modelado y cuidado de barba con productos de primera.",
    imageUrl: "https://images.unsplash.com/photo-1570654639102-bdd95efeca7a?w=600&q=80",
  },
  {
    id: 7,
    name: "Asesoría de Imagen",
    description: "Análisis facial y estilo personalizado para proyectar tu mejor versión.",
    imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&q=80",
    tag: "Exclusivo",
  },
  {
    id: 8,
    name: "Depilaciones",
    description: "Retiro de vello facial con cera o hilo para acabados impecables.",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
  },
  {
    id: 9,
    name: "Servicio Completo",
    description: "La experiencia total: corte, barba, perfilado y asesoría en una sola visita.",
    imageUrl: "https://images.unsplash.com/photo-1561948955-570b270e7c36?w=600&q=80",
    tag: "Todo incluido",
  },
];

export default function Services() {
  return (
    <section className={styles.section} id="servicios">
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.eyebrow}>Lo que hacemos</span>
        <h2 className={styles.title}>Nuestros Servicios</h2>
        <div className={styles.divider} />
        <p className={styles.subtitle}>
          Cada servicio ejecutado con precisión, sin apuro y con los mejores productos del mercado.
        </p>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {services.map((service) => (
          <article key={service.id} className={styles.card}>
            {/* Image */}
            <div className={styles.imageWrapper}>
              <Image
                src={service.imageUrl}
                alt={service.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={styles.image}
              />
              {/* Overlay gradient */}
              <div className={styles.imageOverlay} />
              {/* Tag badge */}
              {service.tag && (
                <span className={styles.badge}>{service.tag}</span>
              )}
            </div>

            {/* Content */}
            <div className={styles.content}>
              <h3 className={styles.cardTitle}>{service.name}</h3>
              <p className={styles.cardDescription}>{service.description}</p>
              <button className={styles.cta} type="button">
                Reservar
                <span className={styles.ctaArrow}>→</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className={styles.bottomCta}>
        <p className={styles.bottomCtaText}>¿No encuentras lo que buscas?</p>
        <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
          Contáctanos por WhatsApp
        </a>
      </div>
    </section>
  );
}