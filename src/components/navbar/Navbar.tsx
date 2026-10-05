"use client";

import { useEffect, useState } from "react";
import styles from "./Navbar.module.css";

/* ─────────────────────────────────────────────
   LOGO: pega aquí la URL de tu logo.
   Si la dejas vacía (""), se muestra el logo en texto.
   ───────────────────────────────────────────── */
const LOGO_URL = "https://placehold.co/160x48/cc1616/f5f5f5?text=LOGO";

const WHATSAPP = "https://wa.me/56994872535?text=" +
  encodeURIComponent("¡Hola! Quiero reservar una hora.");

const links = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Galería", href: "#galeria" },
  { label: "Equipo", href: "#equipo" },
  { label: "Promociones", href: "#promociones" },
  { label: "Ubicación", href: "#ubicacion" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bloquea el scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <a href="#inicio" className={styles.logo} onClick={() => setMenuOpen(false)}>
          {LOGO_URL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={LOGO_URL} alt="Logo" className={styles.logoImg} />
          ) : (
            <span className={styles.logoText}>
              Barber<span className={styles.logoAccent}>Shop</span>
            </span>
          )}
        </a>

        {/* Links desktop */}
        <nav className={styles.nav}>
          {links.map((l) => (
            <a key={l.href} href={l.href} className={styles.link}>
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA desktop */}
        <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={styles.cta}>
          Reservar
        </a>

        {/* Botón hamburguesa (móvil) */}
        <button
          type="button"
          className={styles.burger}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
        >
          <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerLineTop : ""}`} />
          <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerLineMid : ""}`} />
          <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerLineBot : ""}`} />
        </button>
      </div>

      {/* Menú móvil */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}>
        <nav className={styles.mobileNav}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobileCta}
            onClick={() => setMenuOpen(false)}
          >
            Reservar por WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
