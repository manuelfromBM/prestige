"use client";

import { Children, useRef, useState } from "react";
import styles from "./Carousel.module.css";

interface CarouselProps {
  /** Clase del grid de la sección: se mantiene tal cual en escritorio. */
  className?: string;
  label: string;
  children: React.ReactNode;
}

/**
 * En escritorio renderiza el grid normal de la sección.
 * En móvil (≤768px) lo convierte en un carrusel horizontal con scroll-snap y puntos.
 */
export default function Carousel({ className = "", label, children }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [active, setActive] = useState(0);
  const count = Children.count(children);

  const handleScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;
      const items = Array.from(track.children) as HTMLElement[];
      // Al final del scroll la última tarjeta no alcanza a quedar al inicio
      if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) {
        setActive(items.length - 1);
        return;
      }
      const start = track.scrollLeft + items[0].offsetLeft;
      let closest = 0;
      items.forEach((item, i) => {
        if (Math.abs(item.offsetLeft - start) < Math.abs(items[closest].offsetLeft - start)) {
          closest = i;
        }
      });
      setActive(closest);
    });
  };

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const items = track.children as HTMLCollectionOf<HTMLElement>;
    track.scrollTo({ left: items[i].offsetLeft - items[0].offsetLeft, behavior: "smooth" });
  };

  return (
    <div className={styles.wrapper} role="region" aria-roledescription="carrusel" aria-label={label}>
      <div ref={trackRef} className={`${className} ${styles.track}`} onScroll={handleScroll}>
        {children}
      </div>

      {count > 1 && (
        <div className={styles.dots}>
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Ir a la tarjeta ${i + 1} de ${count}`}
              aria-current={i === active}
            />
          ))}
        </div>
      )}
    </div>
  );
}
