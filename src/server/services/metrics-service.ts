import { addDays, dateRange, shopNow } from "../domain/clock";
import { BOOKING_WINDOW_DAYS, hoursFor, workingMinutes } from "../domain/schedule";
import type { Appointment, Barber } from "../domain/types";
import type { AppointmentRepository, CatalogRepository } from "../repositories/types";

export const METRIC_PERIODS = [7, 30, 90] as const;

export interface PeriodTotals {
  completed: number;
  revenue: number;
  avgTicket: number;
  occupancy: number; // 0..1
  cancelRate: number; // 0..1
  uniqueClients: number;
}

export interface BarberMetrics extends PeriodTotals {
  barberId: number;
  name: string;
  role: string;
  imageUrl: string;
  cancelled: number;
  topService: string | null;
  upcoming: number;
}

export interface DashboardMetrics {
  period: { days: number; from: string; to: string };
  barberId: number | null;
  totals: PeriodTotals;
  previous: PeriodTotals;
  upcomingCount: number;
  daily: { date: string; completed: number; revenue: number }[];
  services: { serviceId: number; name: string; count: number; revenue: number }[];
  barbers: BarberMetrics[];
  upcoming: {
    id: string;
    date: string;
    startMinute: number;
    clientName: string;
    barberName: string;
    serviceName: string;
  }[];
}

interface Deps {
  catalog: CatalogRepository;
  appointments: AppointmentRepository;
  now?: () => Date;
}

export function createMetricsService({ catalog, appointments, now = () => new Date() }: Deps) {
  return {
    async getDashboard({ days, barberId = null }: { days: number; barberId?: number | null }): Promise<DashboardMetrics> {
      const today = shopNow(now());
      const from = addDays(today.date, -(days - 1));
      const prevFrom = addDays(from, -days);
      const prevTo = addDays(from, -1);
      const upcomingTo = addDays(today.date, BOOKING_WINDOW_DAYS - 1);

      const [barbers, allBarbers, services, all] = await Promise.all([
        catalog.listBarbers(),
        catalog.listBarbers({ includeHidden: true }),
        // Incluye los ocultos para que el historial conserve sus nombres
        catalog.listServices({ includeHidden: true }),
        appointments.list({ from: prevFrom, to: upcomingTo }),
      ]);
      const serviceName = new Map(services.map((s) => [s.id, s.name]));

      // Una cita está realizada cuando ya terminó
      const isDone = (a: Appointment) =>
        a.date < today.date || (a.date === today.date && a.startMinute + a.durationMin <= today.minute);
      const inRange = (a: Appointment, start: string, end: string) => a.date >= start && a.date <= end;
      const upcomingOf = (list: Appointment[]) =>
        list.filter((a) => a.status === "CONFIRMED" && !isDone(a));

      const totalsFor = (list: Appointment[], pool: Barber[], start: string, count: number): PeriodTotals => {
        const confirmed = list.filter((a) => a.status === "CONFIRMED");
        const done = confirmed.filter(isDone);
        const cancelled = list.length - confirmed.length;
        const revenue = done.reduce((sum, a) => sum + a.price, 0);
        const bookedMinutes = confirmed.reduce((sum, a) => sum + a.durationMin, 0);
        const availableMinutes = dateRange(start, count).reduce(
          (sum, date) => sum + pool.reduce((s, b) => s + workingMinutes(hoursFor(b, date)), 0),
          0,
        );
        return {
          completed: done.length,
          revenue,
          avgTicket: done.length ? Math.round(revenue / done.length) : 0,
          occupancy: availableMinutes ? bookedMinutes / availableMinutes : 0,
          cancelRate: list.length ? cancelled / list.length : 0,
          uniqueClients: new Set(done.map((a) => a.clientEmail.toLowerCase())).size,
        };
      };

      const pool = barberId === null ? barbers : barbers.filter((b) => b.id === barberId);
      const scoped = barberId === null ? all : all.filter((a) => a.barberId === barberId);
      const current = scoped.filter((a) => inRange(a, from, today.date));
      const previous = scoped.filter((a) => inRange(a, prevFrom, prevTo));
      const upcoming = upcomingOf(scoped);

      const doneCurrent = current.filter((a) => a.status === "CONFIRMED" && isDone(a));
      const daily = dateRange(from, days).map((date) => {
        const list = doneCurrent.filter((a) => a.date === date);
        return { date, completed: list.length, revenue: list.reduce((s, a) => s + a.price, 0) };
      });

      const byService = new Map<number, { count: number; revenue: number }>();
      for (const a of doneCurrent) {
        const entry = byService.get(a.serviceId) ?? { count: 0, revenue: 0 };
        entry.count++;
        entry.revenue += a.price;
        byService.set(a.serviceId, entry);
      }

      const barberMetrics = barbers.map((b): BarberMetrics => {
        const list = all.filter((a) => a.barberId === b.id && inRange(a, from, today.date));
        const counts = new Map<number, number>();
        for (const a of list) {
          if (a.status === "CONFIRMED" && isDone(a)) counts.set(a.serviceId, (counts.get(a.serviceId) ?? 0) + 1);
        }
        const top = [...counts.entries()].sort((x, y) => y[1] - x[1])[0];
        return {
          barberId: b.id,
          name: b.name,
          role: b.role,
          imageUrl: b.imageUrl,
          ...totalsFor(list, [b], from, days),
          cancelled: list.filter((a) => a.status === "CANCELLED").length,
          topService: top ? (serviceName.get(top[0]) ?? null) : null,
          upcoming: upcomingOf(all.filter((a) => a.barberId === b.id)).length,
        };
      });

      const barberName = new Map(allBarbers.map((b) => [b.id, b.name]));

      return {
        period: { days, from, to: today.date },
        barberId,
        totals: totalsFor(current, pool, from, days),
        previous: totalsFor(previous, pool, prevFrom, days),
        upcomingCount: upcoming.length,
        daily,
        services: [...byService.entries()]
          .map(([serviceId, v]) => ({ serviceId, name: serviceName.get(serviceId) ?? "—", ...v }))
          .sort((a, b) => b.count - a.count),
        barbers: barberMetrics.sort((a, b) => b.revenue - a.revenue),
        upcoming: upcoming.slice(0, 6).map((a) => ({
          id: a.id,
          date: a.date,
          startMinute: a.startMinute,
          clientName: a.clientName,
          barberName: barberName.get(a.barberId) ?? "—",
          serviceName: serviceName.get(a.serviceId) ?? "—",
        })),
      };
    },
  };
}

export type MetricsService = ReturnType<typeof createMetricsService>;
