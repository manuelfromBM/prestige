"use client";

import styles from "./Process.module.css";

const steps = [
  {
    n: "01",
    title: "Agenda",
    description: "Reserva tu hora por WhatsApp en segundos, el día y horario que prefieras.",
  },
  {
    n: "02",
    title: "Llega a tu hora",
    description: "Te esperamos puntual. Sin filas ni esperas: tu tiempo vale.",
  },
  {
    n: "03",
    title: "Asesoría personalizada",
    description: "Conversamos tu estilo, analizamos tu rostro y definimos el look ideal.",
  },
  {
    n: "04",
    title: "El corte",
    description: "Ejecución precisa, sin apuro y con productos premium de principio a fin.",
  },
  {
    n: "05",
    title: "Cuidado en casa",
    description: "Te damos recomendaciones para mantener tu estilo impecable entre visitas.",
  },
];

export default function Process() {
  return (
    <section className={styles.section} id="proceso">
      <div className={styles.header}>
        <span className={styles.eyebrow}>Cómo trabajamos</span>
        <h2 className={styles.title}>Nuestro proceso</h2>
        <div className={styles.divider} />
        <p className={styles.subtitle}>
          Una experiencia pensada de principio a fin para que salgas renovado.
        </p>
      </div>

      <div className={styles.timeline}>
        {steps.map((s) => (
          <div key={s.n} className={styles.step}>
            <div className={styles.stepNumber}>{s.n}</div>
            <div className={styles.stepBody}>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDescription}>{s.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
