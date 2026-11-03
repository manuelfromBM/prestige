"use client";

import Image from "next/image";
import Link from "next/link";
import Carousel from "@/src/components/carousel/Carousel";
import { isUnoptimized } from "@/src/lib/images";
import type { SiteContent } from "@/src/server/services/content-service";
import styles from "./Services.module.css";

export default function Services({ services }: { services: SiteContent["services"] }) {
  if (services.length === 0) return null;

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
      <Carousel className={styles.grid} label="Servicios">
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
                unoptimized={isUnoptimized(service.imageUrl)}
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
              <Link href={`/agendar?servicio=${service.id}`} className={styles.cta}>
                Reservar
                <span className={styles.ctaArrow}>→</span>
              </Link>
            </div>
          </article>
        ))}
      </Carousel>

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