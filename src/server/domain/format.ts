const longDate = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function formatTime(minutes: number) {
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

// "martes, 3 de noviembre" a partir de YYYY-MM-DD
export function formatLongDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return longDate.format(new Date(Date.UTC(y, m - 1, d)));
}
