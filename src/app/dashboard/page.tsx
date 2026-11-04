import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/src/components/dashboard/Dashboard.module.css";
import { DailyBars, HBars } from "@/src/components/dashboard/Charts";
import logo from "@/public/logo-prestige-barber-emblem.jpg";
import { isUnoptimized } from "@/src/lib/images";
import { canViewDashboard, metricsService } from "@/src/server/container";
import { formatLongDate, formatTime } from "@/src/server/domain/format";
import { METRIC_PERIODS, type PeriodTotals } from "@/src/server/services/metrics-service";

export const metadata: Metadata = {
  title: "Panel de métricas · Prestige Barber",
  robots: { index: false, follow: false },
};

const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
const pct = (v: number) => `${Math.round(v * 100)}%`;
const shortDate = new Intl.DateTimeFormat("es-CL", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const formatShortDate = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return shortDate.format(new Date(Date.UTC(y, m - 1, d))).replace(/\./g, "");
};

type SearchParams = Promise<{ dias?: string; barbero?: string; key?: string }>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  // Sin la clave correcta el panel no existe (404), para no revelar la URL
  if (!canViewDashboard(params.key)) notFound();

  const days = METRIC_PERIODS.find((p) => String(p) === params.dias) ?? 30;
  const barberParam = Number(params.barbero);
  const metrics = await metricsService.getDashboard({
    days,
    barberId: Number.isInteger(barberParam) && barberParam > 0 ? barberParam : null,
  });
  const selected = metrics.barbers.find((b) => b.barberId === metrics.barberId);

  const href = (next: { dias?: number; barbero?: number | null }) => {
    const q = new URLSearchParams();
    q.set("dias", String(next.dias ?? days));
    const barber = next.barbero === undefined ? metrics.barberId : next.barbero;
    if (barber) q.set("barbero", String(barber));
    if (params.key) q.set("key", params.key);
    return `/dashboard?${q}`;
  };

  const { totals, previous } = metrics;
  const kpis: { label: string; value: string; delta: Delta }[] = [
    { label: "Ingresos", value: clp.format(totals.revenue), delta: change(totals, previous, "revenue") },
    { label: "Citas realizadas", value: String(totals.completed), delta: change(totals, previous, "completed") },
    { label: "Ticket promedio", value: clp.format(totals.avgTicket), delta: change(totals, previous, "avgTicket") },
    { label: "Ocupación", value: pct(totals.occupancy), delta: change(totals, previous, "occupancy", true) },
    { label: "Cancelaciones", value: pct(totals.cancelRate), delta: change(totals, previous, "cancelRate", true) },
    { label: "Clientes únicos", value: String(totals.uniqueClients), delta: change(totals, previous, "uniqueClients") },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <Image src={logo} alt="Prestige Barber" className={styles.logo} priority />
          <div>
            <span className={styles.eyebrow}>Prestige Barber</span>
            <h1 className={styles.title}>Panel de métricas</h1>
          </div>
        </div>
        <p className={styles.range}>
          {formatLongDate(metrics.period.from)} – {formatLongDate(metrics.period.to)}
        </p>
      </header>

      <nav className={styles.filters} aria-label="Filtros">
        <div className={styles.segmented}>
          {METRIC_PERIODS.map((p) => (
            <Link key={p} href={href({ dias: p })} className={p === days ? styles.segActive : styles.seg}>
              {p} días
            </Link>
          ))}
        </div>
        <div className={styles.chips}>
          <Link href={href({ barbero: null })} className={metrics.barberId === null ? styles.chipActive : styles.chip}>
            Todos
          </Link>
          {[...metrics.barbers]
            .sort((a, b) => a.barberId - b.barberId)
            .map((b) => (
              <Link
                key={b.barberId}
                href={href({ barbero: b.barberId })}
                className={b.barberId === metrics.barberId ? styles.chipActive : styles.chip}
              >
                {b.name.split(" ")[0]}
              </Link>
            ))}
        </div>
      </nav>

      <main className={styles.main}>
        {selected && (
          <p className={styles.scope}>
            Mostrando a <strong>{selected.name}</strong> · {selected.role}
          </p>
        )}

        <section className={styles.kpis} aria-label="Indicadores">
          {kpis.map((k) => (
            <article key={k.label} className={styles.kpi}>
              <span className={styles.kpiLabel}>{k.label}</span>
              <strong className={styles.kpiValue}>{k.value}</strong>
              <span className={styles.kpiDelta}>
                {k.delta.text} <span className={styles.kpiDeltaHint}>vs {days} días anteriores</span>
              </span>
            </article>
          ))}
        </section>

        <div className={styles.grid2}>
          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Citas realizadas por día</h2>
              <span className={styles.cardMeta}>{totals.completed} en total</span>
            </header>
            <DailyBars data={metrics.daily} />
          </section>

          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Servicios más pedidos</h2>
              <span className={styles.cardMeta}>citas realizadas</span>
            </header>
            {metrics.services.length === 0 ? (
              <p className={styles.empty}>Sin citas en este período.</p>
            ) : (
              <HBars
                rows={metrics.services.map((s) => ({
                  label: s.name,
                  value: s.count,
                  detail: `${s.count} citas · ${clp.format(s.revenue)}`,
                }))}
              />
            )}
          </section>
        </div>

        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Rendimiento por barbero</h2>
            <span className={styles.cardMeta}>últimos {days} días · ordenado por ingresos</span>
          </header>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Barbero</th>
                  <th className={styles.num}>Citas</th>
                  <th className={styles.num}>Ingresos</th>
                  <th className={styles.num}>Ticket prom.</th>
                  <th>Ocupación</th>
                  <th className={styles.num}>Cancel.</th>
                  <th className={styles.num}>Clientes</th>
                  <th>Servicio top</th>
                  <th className={styles.num}>Próximas</th>
                </tr>
              </thead>
              <tbody>
                {metrics.barbers.map((b) => (
                  <tr key={b.barberId} className={b.barberId === metrics.barberId ? styles.rowActive : undefined}>
                    <td>
                      <Link href={href({ barbero: b.barberId })} className={styles.barberCell}>
                        <span className={styles.avatar}>
                          <Image src={b.imageUrl} alt="" fill sizes="36px" className={styles.avatarImg} unoptimized={isUnoptimized(b.imageUrl)} />
                        </span>
                        <span>
                          <strong>{b.name}</strong>
                          <small>{b.role}</small>
                        </span>
                      </Link>
                    </td>
                    <td className={styles.num}>{b.completed}</td>
                    <td className={styles.num}>{clp.format(b.revenue)}</td>
                    <td className={styles.num}>{clp.format(b.avgTicket)}</td>
                    <td>
                      <span className={styles.meter}>
                        <span className={styles.meterTrack}>
                          <span className={styles.meterFill} style={{ width: pct(Math.min(1, b.occupancy)) }} />
                        </span>
                        <span className={styles.meterValue}>{pct(b.occupancy)}</span>
                      </span>
                    </td>
                    <td className={styles.num}>{pct(b.cancelRate)}</td>
                    <td className={styles.num}>{b.uniqueClients}</td>
                    <td>{b.topService ?? "—"}</td>
                    <td className={styles.num}>{b.upcoming}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className={styles.grid2}>
          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Ingresos por barbero</h2>
              <span className={styles.cardMeta}>últimos {days} días</span>
            </header>
            <HBars
              format="clp"
              rows={metrics.barbers.map((b) => ({
                label: b.name,
                value: b.revenue,
                detail: `${b.completed} citas · ticket ${clp.format(b.avgTicket)}`,
              }))}
            />
          </section>

          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Próximas citas</h2>
              <span className={styles.cardMeta}>{metrics.upcomingCount} en los próximos 14 días</span>
            </header>
            {metrics.upcoming.length === 0 ? (
              <p className={styles.empty}>No hay citas agendadas.</p>
            ) : (
              <ul className={styles.agenda}>
                {metrics.upcoming.map((a) => (
                  <li key={a.id}>
                    <span className={styles.agendaWhen}>
                      <strong>{formatTime(a.startMinute)}</strong>
                      <small>{formatShortDate(a.date)}</small>
                    </span>
                    <span className={styles.agendaWhat}>
                      <strong>{a.clientName}</strong>
                      <small>
                        {a.serviceName} · {a.barberName}
                      </small>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

interface Delta {
  text: string;
}

// Variación respecto al período anterior: % para montos, puntos para tasas
function change(current: PeriodTotals, prev: PeriodTotals, key: keyof PeriodTotals, isRate = false): Delta {
  const a = current[key];
  const b = prev[key];
  if (isRate) {
    const points = Math.round((a - b) * 100);
    return { text: points === 0 ? "= sin cambio" : `${points > 0 ? "▲" : "▼"} ${Math.abs(points)} pts` };
  }
  if (b === 0) return { text: "— sin datos previos" };
  const diff = Math.round(((a - b) / b) * 100);
  return { text: diff === 0 ? "= sin cambio" : `${diff > 0 ? "▲" : "▼"} ${Math.abs(diff)}%` };
}
