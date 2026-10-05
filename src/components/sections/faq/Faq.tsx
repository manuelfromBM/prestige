"use client";

import { useState } from "react";
import styles from "./Faq.module.css";

interface QA {
  q: string;
  a: string;
}

const faqs: QA[] = [
  {
    q: "¿Atienden sin reserva?",
    a: "Priorizamos a quienes reservan hora, ya que así garantizamos puntualidad. Si hay disponibilidad te atendemos por orden de llegada, pero lo ideal es agendar por WhatsApp.",
  },
  {
    q: "¿Cuánto dura un corte?",
    a: "Un corte estándar toma entre 30 y 40 minutos. Si incluye barba o asesoría de imagen, considera entre 45 y 60 minutos para no apurar el resultado.",
  },
  {
    q: "¿Aceptan tarjeta?",
    a: "Sí, aceptamos efectivo, débito, crédito y transferencia. También puedes pagar con billeteras digitales.",
  },
  {
    q: "¿Puedo reagendar mi hora?",
    a: "Claro. Solo escríbenos por WhatsApp con al menos un par de horas de anticipación y reprogramamos tu cita sin costo.",
  },
  {
    q: "¿Hacen cortes a niños?",
    a: "Sí, atendemos a todas las edades. Para los más pequeños tenemos paciencia de sobra y hacemos que la experiencia sea agradable.",
  },
  {
    q: "¿Tienen estacionamiento?",
    a: "Contamos con estacionamiento en las cercanías y la calle permite aparcar con facilidad. En la sección de ubicación te dejamos el mapa para llegar.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className={styles.section} id="faq">
      <div className={styles.header}>
        <span className={styles.eyebrow}>Dudas</span>
        <h2 className={styles.title}>Preguntas frecuentes</h2>
        <div className={styles.divider} />
      </div>

      <div className={styles.list}>
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}>
              <button
                type="button"
                className={styles.question}
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span>{item.q}</span>
                <span className={styles.icon} aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
              <div className={styles.answerWrap} style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                <div className={styles.answerInner}>
                  <p className={styles.answer}>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
