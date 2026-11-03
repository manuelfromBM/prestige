"use client";

import Image from "next/image";
import Carousel from "@/src/components/carousel/Carousel";
import { isUnoptimized } from "@/src/lib/images";
import type { SiteContent } from "@/src/server/services/content-service";
import styles from "./Products.module.css";

const WHATSAPP = "https://wa.me/56994872535?text=";

const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

export default function Products({ products }: { products: SiteContent["products"] }) {
  if (products.length === 0) return null;

  return (
    <section className={styles.section} id="productos">
      <div className={styles.header}>
        <span className={styles.eyebrow}>Tienda</span>
        <h2 className={styles.title}>Productos premium</h2>
        <div className={styles.divider} />
        <p className={styles.subtitle}>
          Lleva a casa lo mismo que usamos en la silla. Cuida tu estilo entre visitas.
        </p>
      </div>

      <Carousel className={styles.grid} label="Productos">
        {products.map((p) => (
          <article key={p.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image
                src={p.imageUrl}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className={styles.image}
                unoptimized={isUnoptimized(p.imageUrl)}
              />
            </div>
            <div className={styles.content}>
              <span className={styles.category}>{p.category}</span>
              <h3 className={styles.cardName}>{p.name}</h3>
              <div className={styles.footer}>
                <span className={styles.price}>{clp.format(p.price)}</span>
                <a
                  href={WHATSAPP + encodeURIComponent(`¡Hola! Quiero comprar: ${p.name}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.buy}
                >
                  Comprar
                </a>
              </div>
            </div>
          </article>
        ))}
      </Carousel>
    </section>
  );
}
