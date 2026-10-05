"use client";

import Image from "next/image";
import styles from "./Products.module.css";

const WHATSAPP = "https://wa.me/56994872535?text=";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  imageUrl: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Pomada mate",
    category: "Fijación fuerte",
    price: "$9.900",
    imageUrl: "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=600&q=80",
  },
  {
    id: 2,
    name: "Aceite para barba",
    category: "Cuidado & brillo",
    price: "$8.500",
    imageUrl: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&q=80",
  },
  {
    id: 3,
    name: "Shampoo sólido",
    category: "Limpieza diaria",
    price: "$7.200",
    imageUrl: "https://images.unsplash.com/photo-1585232351009-aa87416fca90?w=600&q=80",
  },
  {
    id: 4,
    name: "Bálsamo after-shave",
    category: "Post afeitado",
    price: "$8.900",
    imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80",
  },
];

export default function Products() {
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

      <div className={styles.grid}>
        {products.map((p) => (
          <article key={p.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image
                src={p.imageUrl}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className={styles.image}
              />
            </div>
            <div className={styles.content}>
              <span className={styles.category}>{p.category}</span>
              <h3 className={styles.cardName}>{p.name}</h3>
              <div className={styles.footer}>
                <span className={styles.price}>{p.price}</span>
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
      </div>
    </section>
  );
}
