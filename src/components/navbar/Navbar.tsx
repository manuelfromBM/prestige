"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Navbar.module.css";
import logo from "@/public/logo-prestige-barber-circle.jpg";

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
          <span className={styles.logoImgWrap}>
            <Image src={logo} alt="" className={styles.logoImg} priority />
          </span>
          <span className={styles.logoText}>
            Prestige <span className={styles.logoAccent}>Barber</span>
          </span>
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
        <Link href="/agendar" className={styles.cta}>
          Reservar
        </Link>

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
          <Link href="/agendar" className={styles.mobileCta} onClick={() => setMenuOpen(false)}>
            Reservar hora
          </Link>
        </nav>
      </div>
    </header>
  );
}
