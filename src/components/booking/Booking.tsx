"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Booking.module.css";
import logo from "@/public/logo-prestige-barber-circle.jpg";
import { ApiError, api } from "@/src/lib/api-client";
import type { EmailStatus } from "@/src/server/domain/types";
import type { Availability } from "@/src/server/services/booking-service";
import type { Catalog } from "@/src/server/services/catalog-service";
import { isUnoptimized } from "@/src/lib/images";

const WHATSAPP = "https://wa.me/56994872535?text=";
const STORAGE_KEY = "prestige-mis-reservas";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEPS = ["Servicio", "Barbero", "Fecha y hora", "Tus datos"];
const ANY_BARBER = 0;

const price = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });
const weekdayShort = new Intl.DateTimeFormat("es-CL", { weekday: "short", timeZone: "UTC" });
const monthShort = new Intl.DateTimeFormat("es-CL", { month: "short", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

interface Slot {
  start: number;
  barberId: number;
}

interface DayOption {
  date: string; // YYYY-MM-DD
  slots: Slot[];
}

// Copia local de las reservas hechas desde este navegador, para poder verlas y cancelarlas
interface SavedReservation {
  id: string;
  date: string;
  startMinute: number;
  serviceName: string;
  barberName: string;
}

// Reloj compartido: null en el servidor, se actualiza cada minuto en el cliente
let nowMs: number | null = null;
function subscribeClock(onChange: () => void) {
  nowMs = Date.now();
  onChange();
  const id = setInterval(() => {
    nowMs = Date.now();
    onChange();
  }, 60_000);
  return () => clearInterval(id);
}
const getClock = () => (nowMs ??= Date.now());
const getServerClock = () => null;

function loadSaved(): SavedReservation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedReservation[]) : [];
  } catch {
    return [];
  }
}

function storeSaved(list: SavedReservation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Sin almacenamiento disponible: la reserva igual quedó guardada en el servidor
  }
}

const toDate = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const localDateKey = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function formatTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function relativeDay(date: string, today: string) {
  const diff = Math.round((toDate(date).getTime() - toDate(today).getTime()) / 86_400_000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  return capitalize(weekdayShort.format(toDate(date)).replace(".", ""));
}

const fullDate = (date: string) => capitalize(longDate.format(toDate(date)));

type AvailabilityState =
  | { status: "idle" }
  | { status: "loading"; serviceId: number }
  | { status: "error"; serviceId: number; message: string }
  | { status: "ready"; serviceId: number; data: Availability };

export default function Booking({ catalog, initialServiceId }: { catalog: Catalog; initialServiceId?: number }) {
  const { barbers, services } = catalog;
  const barberById = (id: number) => barbers.find((b) => b.id === id);
  const now = useSyncExternalStore(subscribeClock, getClock, getServerClock);
  const initialService = services.find((s) => s.id === initialServiceId);

  const [step, setStep] = useState(initialService ? 1 : 0);
  const [serviceId, setServiceId] = useState<number | null>(initialService?.id ?? null);
  const [barberId, setBarberId] = useState<number | null>(null);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedReservation[]>(loadSaved);
  const [confirmed, setConfirmed] = useState<{ reservation: SavedReservation; email: string; emailStatus: EmailStatus } | null>(null);
  const [availability, setAvailability] = useState<AvailabilityState>(
    initialService ? { status: "loading", serviceId: initialService.id } : { status: "idle" },
  );
  const latestRequest = useRef(0);

  const service = services.find((s) => s.id === serviceId);

  // Pide la disponibilidad al servidor; ignora respuestas que llegan tarde
  const fetchAvailability = (id: number) => {
    const request = ++latestRequest.current;
    return api
      .getAvailability(id)
      .then((data) => ({ status: "ready" as const, serviceId: id, data }))
      .catch((err: unknown) => ({
        status: "error" as const,
        serviceId: id,
        message: err instanceof ApiError ? err.message : "No pudimos cargar la agenda.",
      }))
      .then((state) => {
        if (request === latestRequest.current) setAvailability(state);
      });
  };

  useEffect(() => {
    if (initialService) fetchAvailability(initialService.id);
    // Solo al montar: el servicio inicial viene de la URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = availability.status === "ready" ? availability.data : null;
  const today = data?.today ?? (now !== null ? localDateKey(now) : "");

  // Días por barbero, más la combinación "cualquier barbero" (primer barbero libre a esa hora)
  const daysByBarber = useMemo(() => {
    const map = new Map<number, DayOption[]>();
    if (!data) return map;
    const any = new Map<string, Map<number, number>>();
    for (const b of data.barbers) {
      map.set(
        b.barberId,
        b.days.map((d) => ({ date: d.date, slots: d.slots.map((start) => ({ start, barberId: b.barberId })) })),
      );
      for (const d of b.days) {
        const day = any.get(d.date) ?? new Map<number, number>();
        for (const start of d.slots) if (!day.has(start)) day.set(start, b.barberId);
        any.set(d.date, day);
      }
    }
    map.set(
      ANY_BARBER,
      [...any.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, slots]) => ({
          date,
          slots: [...slots.entries()].sort(([a], [b]) => a - b).map(([start, id]) => ({ start, barberId: id })),
        })),
    );
    return map;
  }, [data]);

  const availableBarbers = barbers.filter((b) => (daysByBarber.get(b.id)?.length ?? 0) > 0);
  const hiddenBarbers = barbers.length - availableBarbers.length;

  const days = barberId !== null ? (daysByBarber.get(barberId) ?? []) : [];
  const activeDay = days.find((d) => d.date === dayKey) ?? days[0];

  const upcoming = useMemo(() => {
    if (now === null) return [];
    const todayKey = localDateKey(now);
    return saved
      .filter((r) => r.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startMinute - b.startMinute);
  }, [now, saved]);

  const goTo = (target: number) => {
    setError(null);
    setStep(target);
  };

  const chooseService = (id: number) => {
    setServiceId(id);
    setBarberId(null);
    setDayKey(null);
    setSlot(null);
    setAvailability({ status: "loading", serviceId: id });
    fetchAvailability(id);
    goTo(1);
  };

  const chooseBarber = (id: number) => {
    setBarberId(id);
    setDayKey(null);
    setSlot(null);
    goTo(2);
  };

  const chooseSlot = (day: DayOption, s: Slot) => {
    setDayKey(day.date);
    setSlot(s);
    goTo(3);
  };

  const updateSaved = (list: SavedReservation[]) => {
    setSaved(list);
    storeSaved(list);
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !slot || !activeDay || barberId === null) return;

    if (name.trim().length < 2) return setError("Ingresa tu nombre.");
    if (phone.replace(/\D/g, "").length < 8) return setError("Ingresa un teléfono válido.");
    if (!EMAIL_PATTERN.test(email.trim())) return setError("Ingresa un correo válido.");

    setSending(true);
    setError(null);
    try {
      const { appointment, emailStatus } = await api.createAppointment({
        serviceId: service.id,
        barberId: barberId === ANY_BARBER ? null : barberId,
        date: activeDay.date,
        startMinute: slot.start,
        clientName: name,
        clientPhone: phone,
        clientEmail: email,
      });
      const reservation: SavedReservation = {
        id: appointment.id,
        date: appointment.date,
        startMinute: appointment.startMinute,
        serviceName: service.name,
        barberName: barberById(appointment.barberId)?.name ?? "",
      };
      updateSaved([...saved, reservation]);
      setConfirmed({ reservation, email: appointment.clientEmail, emailStatus });
      fetchAvailability(service.id);
      goTo(4);
    } catch (err) {
      if (err instanceof ApiError && err.code === "CONFLICT") {
        // La hora se ocupó mientras completaba sus datos: volver a elegir con la agenda actualizada
        setSlot(null);
        await fetchAvailability(service.id);
        setStep(2);
      }
      setError(err instanceof ApiError ? err.message : "No pudimos confirmar la reserva. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const restart = () => {
    setServiceId(null);
    setBarberId(null);
    setDayKey(null);
    setSlot(null);
    setConfirmed(null);
    setAvailability({ status: "idle" });
    goTo(0);
  };

  const cancel = async (id: string) => {
    try {
      await api.cancelAppointment(id);
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 404)) {
        setError(err instanceof ApiError ? err.message : "No pudimos cancelar la reserva.");
        return;
      }
    }
    updateSaved(saved.filter((r) => r.id !== id));
  };

  const summaryBarber = slot ? barberById(slot.barberId) : barberId ? barberById(barberId) : undefined;

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.logo} aria-label="Volver al inicio">
          <Image src={logo} alt="Prestige Barber" className={styles.logoImg} priority />
        </Link>
        <Link href="/" className={styles.back}>
          ← Volver al inicio
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Reserva online</span>
          <h1 className={styles.title}>Agenda tu hora</h1>
          <div className={styles.divider} />
          <p className={styles.subtitle}>Solo te mostramos las horas disponibles. Elige y listo.</p>
        </div>

        {step < 4 && (
          <ol className={styles.steps}>
            {STEPS.map((label, i) => (
              <li key={label}>
                <button
                  type="button"
                  className={`${styles.stepItem} ${i === step ? styles.stepActive : ""} ${i < step ? styles.stepDone : ""}`}
                  onClick={() => i < step && goTo(i)}
                  disabled={i >= step}
                >
                  <span className={styles.stepNumber}>{i < step ? "✓" : i + 1}</span>
                  <span className={styles.stepLabel}>{label}</span>
                </button>
              </li>
            ))}
          </ol>
        )}

        <div className={step < 4 ? styles.layout : undefined}>
          <section className={styles.panel}>
            {step === 0 ? (
              <>
                <h2 className={styles.panelTitle}>¿Qué te vas a hacer?</h2>
                <div className={styles.serviceGrid}>
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`${styles.option} ${s.id === serviceId ? styles.optionSelected : ""}`}
                      onClick={() => chooseService(s.id)}
                    >
                      <span className={styles.optionName}>{s.name}</span>
                      <span className={styles.optionMeta}>
                        {s.durationMin} min · {price.format(s.price)}
                      </span>
                    </button>
                  ))}
                </div>

                {upcoming.length > 0 && (
                  <div className={styles.upcoming}>
                    <h3 className={styles.upcomingTitle}>Tus próximas reservas</h3>
                    {upcoming.map((r) => (
                      <div key={r.id} className={styles.upcomingItem}>
                        <div>
                          <strong>{r.serviceName}</strong> con {r.barberName}
                          <span className={styles.upcomingWhen}>
                            {fullDate(r.date)} · {formatTime(r.startMinute)}
                          </span>
                        </div>
                        <button type="button" className={styles.linkBtn} onClick={() => cancel(r.id)}>
                          Cancelar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {error && <p className={styles.error}>{error}</p>}
              </>
            ) : availability.status === "loading" || availability.status === "idle" ? (
              <p className={styles.loading}>Buscando horas disponibles…</p>
            ) : availability.status === "error" ? (
              <div>
                <p className={styles.error}>{availability.message}</p>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => service && chooseService(service.id)}
                >
                  Reintentar
                </button>
              </div>
            ) : step === 1 ? (
              <>
                <h2 className={styles.panelTitle}>Elige a tu barbero</h2>
                {availableBarbers.length === 0 ? (
                  <p className={styles.empty}>
                    No quedan horas para este servicio en los próximos días. Prueba con otro servicio.
                  </p>
                ) : (
                  <div className={styles.barberGrid}>
                    <BarberOption
                      name="Cualquier barbero"
                      role="Te asignamos la primera hora libre"
                      days={daysByBarber.get(ANY_BARBER) ?? []}
                      today={today}
                      selected={barberId === ANY_BARBER}
                      onSelect={() => chooseBarber(ANY_BARBER)}
                    />
                    {availableBarbers.map((b) => (
                      <BarberOption
                        key={b.id}
                        name={b.name}
                        role={b.role}
                        imageUrl={b.imageUrl}
                        days={daysByBarber.get(b.id) ?? []}
                        today={today}
                        selected={barberId === b.id}
                        onSelect={() => chooseBarber(b.id)}
                      />
                    ))}
                  </div>
                )}
                {hiddenBarbers > 0 && availableBarbers.length > 0 && (
                  <p className={styles.note}>
                    {hiddenBarbers === 1
                      ? "1 barbero no tiene horas libres para este servicio."
                      : `${hiddenBarbers} barberos no tienen horas libres para este servicio.`}
                  </p>
                )}
              </>
            ) : step === 2 ? (
              <>
                <h2 className={styles.panelTitle}>Elige día y hora</h2>
                {!activeDay ? (
                  <p className={styles.empty}>No quedan horas disponibles. Prueba con otro barbero.</p>
                ) : (
                  <>
                    <div className={styles.days}>
                      {days.map((d) => (
                        <button
                          key={d.date}
                          type="button"
                          className={`${styles.day} ${d.date === activeDay.date ? styles.daySelected : ""}`}
                          onClick={() => {
                            setDayKey(d.date);
                            setSlot(null);
                          }}
                        >
                          <span className={styles.dayWeek}>{relativeDay(d.date, today)}</span>
                          <span className={styles.dayNumber}>{toDate(d.date).getUTCDate()}</span>
                          <span className={styles.dayMonth}>{monthShort.format(toDate(d.date)).replace(".", "")}</span>
                          <span className={styles.dayCount}>{d.slots.length} horas</span>
                        </button>
                      ))}
                    </div>

                    {[
                      { label: "Mañana", from: 0, to: 13 * 60 },
                      { label: "Tarde", from: 13 * 60, to: 17 * 60 },
                      { label: "Noche", from: 17 * 60, to: 24 * 60 },
                    ].map((group) => {
                      const groupSlots = activeDay.slots.filter((s) => s.start >= group.from && s.start < group.to);
                      if (groupSlots.length === 0) return null;
                      return (
                        <div key={group.label} className={styles.timeGroup}>
                          <h3 className={styles.timeGroupTitle}>{group.label}</h3>
                          <div className={styles.times}>
                            {groupSlots.map((s) => (
                              <button
                                key={s.start}
                                type="button"
                                className={`${styles.time} ${
                                  slot?.start === s.start && dayKey === activeDay.date ? styles.timeSelected : ""
                                }`}
                                onClick={() => chooseSlot(activeDay, s)}
                              >
                                {formatTime(s.start)}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                {error && <p className={styles.error}>{error}</p>}
              </>
            ) : step === 3 ? (
              <form className={styles.form} onSubmit={confirm} noValidate>
                <h2 className={styles.panelTitle}>Tus datos</h2>
                <label className={styles.field}>
                  <span>Nombre</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Tu nombre"
                  />
                </label>
                <label className={styles.field}>
                  <span>Teléfono</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    autoComplete="tel"
                    placeholder="+56 9 1234 5678"
                  />
                </label>
                <label className={styles.field}>
                  <span>Correo</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="tucorreo@ejemplo.com"
                  />
                  <small className={styles.fieldHint}>Te enviaremos la confirmación de tu hora.</small>
                </label>
                {error && <p className={styles.error}>{error}</p>}
                <button type="submit" className={styles.primary} disabled={sending}>
                  {sending ? "Confirmando…" : "Confirmar reserva"}
                </button>
              </form>
            ) : confirmed ? (
              <Confirmation
                reservation={confirmed.reservation}
                clientName={name.trim()}
                email={confirmed.email}
                emailStatus={confirmed.emailStatus}
                onRestart={restart}
              />
            ) : null}
          </section>

          {step < 4 && (
            <aside className={styles.summary}>
              <h2 className={styles.summaryTitle}>Tu reserva</h2>
              <dl className={styles.summaryList}>
                <SummaryRow label="Servicio" value={service?.name} />
                <SummaryRow
                  label="Barbero"
                  value={summaryBarber?.name ?? (barberId === ANY_BARBER ? "Cualquiera" : undefined)}
                />
                <SummaryRow label="Fecha" value={slot && activeDay ? fullDate(activeDay.date) : undefined} />
                <SummaryRow label="Hora" value={slot ? formatTime(slot.start) : undefined} />
                <SummaryRow label="Duración" value={service ? `${service.durationMin} min` : undefined} />
              </dl>
              {service && (
                <div className={styles.total}>
                  <span>Total</span>
                  <strong>{price.format(service.price)}</strong>
                </div>
              )}
              <p className={styles.summaryNote}>Pagas en el local, al terminar tu servicio.</p>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}

function BarberOption({
  name,
  role,
  imageUrl,
  days,
  today,
  selected,
  onSelect,
}: {
  name: string;
  role: string;
  imageUrl?: string;
  days: DayOption[];
  today: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const first = days[0];
  const total = days.reduce((sum, d) => sum + d.slots.length, 0);
  return (
    <button
      type="button"
      className={`${styles.barber} ${selected ? styles.optionSelected : ""}`}
      onClick={onSelect}
    >
      <span className={styles.avatar}>
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill sizes="64px" className={styles.avatarImg} unoptimized={isUnoptimized(imageUrl)} />
        ) : (
          <span className={styles.avatarAny}>★</span>
        )}
      </span>
      <span className={styles.barberInfo}>
        <span className={styles.optionName}>{name}</span>
        <span className={styles.barberRole}>{role}</span>
        {first && (
          <span className={styles.barberNext}>
            Próxima: {relativeDay(first.date, today)} {formatTime(first.slots[0].start)} · {total} horas libres
          </span>
        )}
      </span>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className={styles.summaryRow}>
      <dt>{label}</dt>
      <dd className={value ? undefined : styles.summaryEmpty}>{value ?? "—"}</dd>
    </div>
  );
}

function Confirmation({
  reservation,
  clientName,
  email,
  emailStatus,
  onRestart,
}: {
  reservation: SavedReservation;
  clientName: string;
  email: string;
  emailStatus: EmailStatus;
  onRestart: () => void;
}) {
  const when = `${fullDate(reservation.date)} a las ${formatTime(reservation.startMinute)}`;
  const message = `¡Hola! Soy ${clientName}. Reservé ${reservation.serviceName} con ${reservation.barberName} el ${when}.`;

  return (
    <div className={styles.done}>
      <span className={styles.doneIcon}>✓</span>
      <h2 className={styles.doneTitle}>¡Reserva confirmada!</h2>
      <p className={styles.doneText}>
        {clientName}, te esperamos el <strong>{when}</strong> para tu{" "}
        <strong>{reservation.serviceName}</strong> con <strong>{reservation.barberName}</strong>.
      </p>
      {emailStatus === "sent" && (
        <p className={styles.doneEmail}>
          Te enviamos la confirmación a <strong>{email}</strong>.
        </p>
      )}
      {emailStatus === "simulated" && (
        <p className={styles.doneEmail}>
          Correo de confirmación simulado para <strong>{email}</strong> (envío real sin configurar).
        </p>
      )}
      {emailStatus === "failed" && (
        <p className={styles.doneEmail}>
          Tu hora quedó reservada, pero no pudimos enviar el correo. Guarda estos datos o avísanos por WhatsApp.
        </p>
      )}
      <div className={styles.doneActions}>
        <a
          href={WHATSAPP + encodeURIComponent(message)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.primary}
        >
          Avisar por WhatsApp
        </a>
        <button type="button" className={styles.secondary} onClick={onRestart}>
          Agendar otra hora
        </button>
      </div>
    </div>
  );
}
