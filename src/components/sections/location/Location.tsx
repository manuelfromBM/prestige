"use client";

import styles from "./Location.module.css";

const schedule = [
  { day: "Lunes",     open: "09:00", close: "20:00", active: true  },
  { day: "Martes",    open: "09:00", close: "20:00", active: true  },
  { day: "Miércoles", open: "09:00", close: "20:00", active: true  },
  { day: "Jueves",    open: "09:00", close: "20:00", active: true  },
  { day: "Viernes",   open: "09:00", close: "21:00", active: true  },
  { day: "Sábado",    open: "09:00", close: "18:00", active: true  },
  { day: "Domingo",   open: null,    close: null,    active: false },
];

// Detecta el día actual (0=Dom, 1=Lun, …, 6=Sáb)
// El array schedule empieza en Lunes=índice 0 → ajustamos
const todayIndex = (() => {
  const jsDay = new Date().getDay(); // 0=Dom
  return jsDay === 0 ? 6 : jsDay - 1; // mapea a nuestro array
})();

// Barbería — Ortúzar 547, Melipilla, Región Metropolitana
// Coordenadas exactas del local
const LAT = -33.6867275;
const LNG = -71.2151816;

// Mapa embebido (formato output=embed: sin API key)
const MAPS_EMBED =
  "https://www.google.com/maps?q=Ort%C3%BAzar+547,+Melipilla,+Regi%C3%B3n+Metropolitana&z=16&output=embed";

// Abrir en Google Maps / Waze apuntando al punto exacto
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${LAT},${LNG}`;
const WAZE_LINK = `https://waze.com/ul?ll=${LAT},${LNG}&navigate=yes`;
const WHATSAPP  = "https://wa.me/56994872535";

export default function Location() {
  return (
    <section className={styles.section} id="ubicacion">
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.eyebrow}>Encuéntranos</span>
        <h2 className={styles.title}>Ubicación & Horarios</h2>
        <div className={styles.divider} />
      </div>

      {/* Main layout */}
      <div className={styles.layout}>

        {/* ── LEFT: mapa ── */}
        <div className={styles.mapCol}>
          <div className={styles.mapWrapper}>
            <iframe
              src={MAPS_EMBED}
              className={styles.mapIframe}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de la barbería"
            />
          </div>

          {/* Botones de navegación */}
          <div className={styles.navBtns}>
            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className={styles.navBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Google Maps
            </a>
            <a href={WAZE_LINK} target="_blank" rel="noopener noreferrer" className={`${styles.navBtn} ${styles.navBtnSecondary}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z"/>
              </svg>
              Waze
            </a>
          </div>
        </div>

        {/* ── RIGHT: info + horario ── */}
        <div className={styles.infoCol}>

          {/* Dirección */}
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Dirección</span>
            <p className={styles.infoValue}>Ortúzar 547<br />Melipilla, Región Metropolitana</p>
          </div>

          {/* Contacto */}
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Contacto</span>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={styles.infoLink}>
              +56 9 9487 2535
            </a>
          </div>

          {/* Horario */}
          <div className={styles.scheduleBlock}>
            <span className={styles.infoLabel}>Horario</span>
            <ul className={styles.scheduleList}>
              {schedule.map((row, i) => (
                <li
                  key={row.day}
                  className={`${styles.scheduleRow} ${i === todayIndex ? styles.today : ""} ${!row.active ? styles.closed : ""}`}
                >
                  <span className={styles.scheduleDay}>
                    {i === todayIndex && <span className={styles.todayDot} aria-hidden="true" />}
                    {row.day}
                  </span>
                  <span className={styles.scheduleHours}>
                    {row.active
                      ? `${row.open} – ${row.close}`
                      : "Cerrado"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA reserva */}
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={styles.reserveBtn}>
            Reservar por WhatsApp
            <span className={styles.reserveArrow}>→</span>
          </a>

        </div>
      </div>
    </section>
  );
}