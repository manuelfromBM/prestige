// Fechas en horario local de la barbería, independiente de la zona del servidor.
// Las fechas se manejan como texto YYYY-MM-DD para evitar errores de zona horaria.

export const SHOP_TIMEZONE = process.env.SHOP_TIMEZONE ?? "America/Santiago";

export interface ShopNow {
  date: string;
  minute: number;
}

export function shopNow(at: Date = new Date(), timeZone = SHOP_TIMEZONE): ShopNow {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minute: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function toUtc(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(date: string, days: number) {
  const d = toUtc(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(date: string) {
  return toUtc(date).getUTCDay();
}

export function dateRange(from: string, count: number) {
  return Array.from({ length: count }, (_, i) => addDays(from, i));
}

export function isValidDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && toUtc(date).toISOString().slice(0, 10) === date;
}
