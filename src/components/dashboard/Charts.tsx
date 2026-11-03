"use client";

import { useState } from "react";
import styles from "./Dashboard.module.css";

const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
const dayLabel = new Intl.DateTimeFormat("es-CL", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const shortDay = new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short", timeZone: "UTC" });

const toDate = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

// Máximo "redondo" para el eje: 1, 2, 5 × 10^n
function niceMax(value: number) {
  if (value <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((s) => s * pow >= value) ?? 10;
  return step * pow;
}

export function DailyBars({ data }: { data: { date: string; completed: number; revenue: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.completed)));
  const ticks = [max, max / 2, 0];
  const labelEvery = Math.ceil(data.length / 6);
  const active = hover !== null ? data[hover] : null;

  return (
    <div className={styles.chart}>
      <div className={styles.chartPlot}>
        <div className={styles.yAxis} aria-hidden>
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className={styles.plotArea} onMouseLeave={() => setHover(null)}>
          {ticks.map((t) => (
            <div key={t} className={styles.gridline} style={{ bottom: `${(t / max) * 100}%` }} />
          ))}
          <div className={styles.columns} style={{ gap: data.length > 40 ? 1 : 2 }}>
            {data.map((d, i) => (
              <button
                key={d.date}
                type="button"
                className={styles.columnHit}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${dayLabel.format(toDate(d.date))}: ${d.completed} citas, ${clp.format(d.revenue)}`}
              >
                <span
                  className={`${styles.column} ${hover === i ? styles.columnActive : ""} ${hover !== null && hover !== i ? styles.columnDim : ""}`}
                  style={{ height: `${(d.completed / max) * 100}%` }}
                />
              </button>
            ))}
          </div>
          {active && hover !== null && (
            <div
              className={styles.tooltip}
              style={{
                left: `${((hover + 0.5) / data.length) * 100}%`,
                transform: `translateX(${hover / data.length > 0.7 ? "-100%" : hover / data.length < 0.3 ? "0" : "-50%"})`,
              }}
            >
              <strong>{dayLabel.format(toDate(active.date))}</strong>
              <span>{active.completed} citas realizadas</span>
              <span>{clp.format(active.revenue)}</span>
            </div>
          )}
        </div>
      </div>
      <div className={styles.xAxis} aria-hidden>
        {data.map((d, i) => (
          <span key={d.date}>{i % labelEvery === 0 ? shortDay.format(toDate(d.date)).replace(".", "") : ""}</span>
        ))}
      </div>
    </div>
  );
}

export function HBars({
  rows,
  format = "count",
}: {
  rows: { label: string; value: number; detail: string }[];
  format?: "count" | "clp";
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...rows.map((r) => r.value));
  const show = (v: number) => (format === "clp" ? clp.format(v) : String(v));

  return (
    <ul className={styles.hbars} onMouseLeave={() => setHover(null)}>
      {rows.map((r, i) => (
        <li
          key={r.label}
          className={`${styles.hbarRow} ${hover !== null && hover !== i ? styles.hbarDim : ""}`}
          onMouseEnter={() => setHover(i)}
          tabIndex={0}
          onFocus={() => setHover(i)}
          onBlur={() => setHover(null)}
        >
          <span className={styles.hbarLabel}>{r.label}</span>
          <span className={styles.hbarTrack}>
            <span className={styles.hbarFill} style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className={styles.hbarValue}>{show(r.value)}</span>
          {hover === i && <span className={styles.hbarTip}>{r.detail}</span>}
        </li>
      ))}
    </ul>
  );
}
