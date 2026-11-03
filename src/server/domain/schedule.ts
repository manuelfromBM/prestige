import { weekdayOf } from "./clock";
import type { Barber, WorkingHours } from "./types";

// Reglas de agenda: bloques de 30 minutos y aviso mínimo para reservar hoy.
export const SLOT_MINUTES = 30;
export const MIN_NOTICE_MINUTES = 30;
export const BOOKING_WINDOW_DAYS = 14;

export interface BusyInterval {
  startMinute: number;
  durationMin: number;
}

export function hoursFor(barber: Barber, date: string): WorkingHours | undefined {
  const weekday = weekdayOf(date);
  return barber.schedule.find((h) => h.weekday === weekday);
}

// Minutos que el barbero tiene disponibles para atender ese día (sin colación)
export function workingMinutes(hours: WorkingHours | undefined) {
  if (!hours) return 0;
  const pause =
    hours.breakStart !== null && hours.breakEnd !== null ? hours.breakEnd - hours.breakStart : 0;
  return hours.endMinute - hours.startMinute - pause;
}

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && aEnd > bStart;

// Horas de inicio posibles para un servicio de `durationMin` minutos
export function freeSlots(
  hours: WorkingHours | undefined,
  busy: BusyInterval[],
  durationMin: number,
  earliestMinute = 0,
): number[] {
  if (!hours) return [];
  const slots: number[] = [];
  for (let t = hours.startMinute; t + durationMin <= hours.endMinute; t += SLOT_MINUTES) {
    if (t < earliestMinute) continue;
    const end = t + durationMin;
    const inBreak =
      hours.breakStart !== null &&
      hours.breakEnd !== null &&
      overlaps(t, end, hours.breakStart, hours.breakEnd);
    if (inBreak) continue;
    if (busy.some((b) => overlaps(t, end, b.startMinute, b.startMinute + b.durationMin))) continue;
    slots.push(t);
  }
  return slots;
}
