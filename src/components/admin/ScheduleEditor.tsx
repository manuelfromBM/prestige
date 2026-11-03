"use client";

import styles from "./Admin.module.css";
import type { WorkingHours } from "@/src/server/domain/types";

// Fila editable: horas como "HH:MM" (lo que entrega <input type="time">)
export interface DayDraft {
  weekday: number;
  enabled: boolean;
  start: string;
  end: string;
  breakStart: string;
  breakEnd: string;
}

const DAYS = [
  { weekday: 1, name: "Lunes" },
  { weekday: 2, name: "Martes" },
  { weekday: 3, name: "Miércoles" },
  { weekday: 4, name: "Jueves" },
  { weekday: 5, name: "Viernes" },
  { weekday: 6, name: "Sábado" },
  { weekday: 0, name: "Domingo" },
];

const toTime = (minutes: number | null) =>
  minutes === null ? "" : `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

const toMinutes = (time: string) => {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export function scheduleToDraft(schedule: WorkingHours[]): DayDraft[] {
  return DAYS.map(({ weekday }) => {
    const h = schedule.find((s) => s.weekday === weekday);
    return {
      weekday,
      enabled: Boolean(h),
      start: toTime(h?.startMinute ?? 600),
      end: toTime(h?.endMinute ?? 1140),
      breakStart: toTime(h ? h.breakStart : 840),
      breakEnd: toTime(h ? h.breakEnd : 900),
    };
  });
}

export function draftToSchedule(days: DayDraft[]) {
  return days
    .filter((d) => d.enabled)
    .map((d) => ({
      weekday: d.weekday,
      startMinute: toMinutes(d.start),
      endMinute: toMinutes(d.end),
      breakStart: toMinutes(d.breakStart),
      breakEnd: toMinutes(d.breakEnd),
    }));
}

export default function ScheduleEditor({ value, onChange }: { value: DayDraft[]; onChange: (next: DayDraft[]) => void }) {
  const update = (weekday: number, patch: Partial<DayDraft>) =>
    onChange(value.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)));

  const first = value.find((d) => d.enabled);
  const copyFirst = () => {
    if (!first) return;
    const { start, end, breakStart, breakEnd } = first;
    onChange(value.map((d) => (d.enabled ? { ...d, start, end, breakStart, breakEnd } : d)));
  };

  return (
    <fieldset className={styles.schedule}>
      <legend className={styles.label}>Horario semanal</legend>
      <div className={styles.scheduleHead} aria-hidden="true">
        <span>Día</span>
        <span>Atiende</span>
        <span>Colación (opcional)</span>
      </div>
      {DAYS.map(({ weekday, name }) => {
        const d = value.find((v) => v.weekday === weekday)!;
        return (
          <div key={weekday} className={`${styles.scheduleRow} ${d.enabled ? "" : styles.scheduleOff}`}>
            <label className={styles.dayToggle}>
              <input type="checkbox" checked={d.enabled} onChange={(e) => update(weekday, { enabled: e.target.checked })} />
              <span>{name}</span>
            </label>
            {d.enabled ? (
              <>
                <span className={styles.timeRange}>
                  <span className={styles.timeLabel}>Atiende</span>
                  <input type="time" step={900} className={styles.timeInput} value={d.start} aria-label={`${name}: desde`}
                    onChange={(e) => update(weekday, { start: e.target.value })} required />
                  <span>a</span>
                  <input type="time" step={900} className={styles.timeInput} value={d.end} aria-label={`${name}: hasta`}
                    onChange={(e) => update(weekday, { end: e.target.value })} required />
                </span>
                <span className={styles.timeRange}>
                  <span className={styles.timeLabel}>Colación</span>
                  <input type="time" step={900} className={styles.timeInput} value={d.breakStart} aria-label={`${name}: colación desde`}
                    onChange={(e) => update(weekday, { breakStart: e.target.value })} />
                  <span>a</span>
                  <input type="time" step={900} className={styles.timeInput} value={d.breakEnd} aria-label={`${name}: colación hasta`}
                    onChange={(e) => update(weekday, { breakEnd: e.target.value })} />
                </span>
              </>
            ) : (
              <span className={styles.dayOff}>No trabaja</span>
            )}
          </div>
        );
      })}
      <div className={styles.scheduleFoot}>
        <button type="button" className={styles.btnLink} onClick={copyFirst} disabled={!first}>
          Copiar el horario del primer día a todos los días marcados
        </button>
        <p className={styles.hint}>Las citas ya agendadas no cambian. El nuevo horario aplica a las reservas nuevas.</p>
      </div>
    </fieldset>
  );
}
