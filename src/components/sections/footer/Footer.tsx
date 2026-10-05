"use client";

import styles from "./Footer.module.css";

const WHATSAPP = "https://wa.me/56994872535";

const navLinks = [
  { label: "Servicios", href: "#servicios" },
  { label: "Galería", href: "#galeria" },
  { label: "Equipo", href: "#equipo" },
  { label: "Promociones", href: "#promociones" },
  { label: "Ubicación", href: "#ubicacion" },
  { label: "FAQ", href: "#faq" },
];

const hours = [
  { day: "Lun – Vie", time: "09:00 – 20:00" },
  { day: "Sábado", time: "09:00 – 18:00" },
  { day: "Domingo", time: "Cerrado" },
];

export default function Footer() {
  return (
    <footer className={styles.footer} id="contacto">
      <div className={styles.top}>
        {/* Marca */}
        <div className={styles.brandCol}>
          <span className={styles.brand}>
            Barber<span className={styles.brandAccent}>Shop</span>
          </span>
          <p className={styles.tagline}>
            Más que un corte, una experiencia. Barbería premium con asesoría de
            imagen personalizada.
          </p>
          <div className={styles.socials}>
            <a href="#" className={styles.social} aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" className={styles.social} aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 22v-8h3l.5-3H13V9c0-.9.3-1.5 1.6-1.5H17V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H8v3h2.6v8H13z" />
              </svg>
            </a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="WhatsApp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12 2a10 10 0 0 0-8.53 15.24L2 22l4.9-1.28A10 10 0 1 0 12 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Navegación */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Explora</h3>
          <ul className={styles.linkList}>
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className={styles.link}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Horario */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Horario</h3>
          <ul className={styles.hoursList}>
            {hours.map((h) => (
              <li key={h.day} className={styles.hoursRow}>
                <span>{h.day}</span>
                <span className={styles.hoursTime}>{h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Contacto</h3>
          <p className={styles.contactLine}>Av. Manuel Rodríguez 123<br />Melipilla, RM</p>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
            +56 9 9487 2535
          </a>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copy}>
          © {new Date().getFullYear()} BarberShop. Todos los derechos reservados.
        </p>
        <p className={styles.credit}>Hecho con precisión ✂</p>
      </div>
    </footer>
  );
}
