import { addDays, dateRange, isValidDate, shopNow } from "../domain/clock";
import { DomainError } from "../domain/errors";
import { BOOKING_WINDOW_DAYS, MIN_NOTICE_MINUTES, freeSlots, hoursFor } from "../domain/schedule";
import type { Appointment, Barber, EmailStatus, Service } from "../domain/types";
import type { AppointmentRepository, CatalogRepository } from "../repositories/types";
import type { Mailer } from "./mailer";

export interface BarberAvailability {
  barberId: number;
  days: { date: string; slots: number[] }[];
}

export interface Availability {
  serviceId: number;
  today: string;
  barbers: BarberAvailability[]; // solo barberos y días con horas libres
}

export interface CreateAppointmentInput {
  serviceId: number;
  barberId: number | null; // null = cualquier barbero disponible
  date: string;
  startMinute: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Deps {
  catalog: CatalogRepository;
  appointments: AppointmentRepository;
  mailer: Mailer;
  now?: () => Date;
}

export function createBookingService({ catalog, appointments, mailer, now = () => new Date() }: Deps) {
  function slotsFor(barber: Barber, service: Service, date: string, booked: Appointment[], today: ReturnType<typeof shopNow>) {
    if (date < today.date) return [];
    const earliest = date === today.date ? today.minute + MIN_NOTICE_MINUTES : 0;
    const busy = booked.filter((a) => a.barberId === barber.id && a.date === date);
    return freeSlots(hoursFor(barber, date), busy, service.durationMin, earliest);
  }

  async function requireService(id: number) {
    const service = await catalog.findService(id);
    if (!service) throw new DomainError("NOT_FOUND", "El servicio no existe.");
    return service;
  }

  return {
    async getAvailability(serviceId: number): Promise<Availability> {
      const service = await requireService(serviceId);
      const today = shopNow(now());
      const days = dateRange(today.date, BOOKING_WINDOW_DAYS);
      const [barbers, booked] = await Promise.all([
        catalog.listBarbers(),
        appointments.list({ from: days[0], to: days[days.length - 1], status: "CONFIRMED" }),
      ]);

      return {
        serviceId,
        today: today.date,
        barbers: barbers
          .map((barber) => ({
            barberId: barber.id,
            days: days
              .map((date) => ({ date, slots: slotsFor(barber, service, date, booked, today) }))
              .filter((d) => d.slots.length > 0),
          }))
          .filter((b) => b.days.length > 0),
      };
    },

    async createAppointment(input: CreateAppointmentInput) {
      const clientName = input.clientName?.trim() ?? "";
      const clientPhone = input.clientPhone?.trim() ?? "";
      const clientEmail = input.clientEmail?.trim().toLowerCase() ?? "";
      if (clientName.length < 2) throw new DomainError("VALIDATION", "Ingresa tu nombre.");
      if (clientPhone.replace(/\D/g, "").length < 8) throw new DomainError("VALIDATION", "Ingresa un teléfono válido.");
      if (!EMAIL_PATTERN.test(clientEmail)) throw new DomainError("VALIDATION", "Ingresa un correo válido.");
      if (!isValidDate(input.date) || !Number.isInteger(input.startMinute)) {
        throw new DomainError("VALIDATION", "Fecha u hora inválida.");
      }

      const service = await requireService(input.serviceId);
      const today = shopNow(now());
      if (input.date > addDays(today.date, BOOKING_WINDOW_DAYS - 1)) {
        throw new DomainError("VALIDATION", "Solo se puede reservar dentro de los próximos 14 días.");
      }

      const allBarbers = await catalog.listBarbers();
      const candidates =
        input.barberId === null ? allBarbers : allBarbers.filter((b) => b.id === input.barberId);
      if (candidates.length === 0) throw new DomainError("NOT_FOUND", "El barbero no existe.");

      // Verificar y reservar dentro de la misma transacción para no duplicar horas
      const appointment = await appointments.transaction(async (repo) => {
        const booked = await repo.list({ from: input.date, to: input.date, status: "CONFIRMED" });
        const barber = candidates.find((b) =>
          slotsFor(b, service, input.date, booked, today).includes(input.startMinute),
        );
        if (!barber) throw new DomainError("CONFLICT", "Esa hora ya no está disponible. Elige otra, por favor.");

        return repo.create({
          barberId: barber.id,
          serviceId: service.id,
          date: input.date,
          startMinute: input.startMinute,
          durationMin: service.durationMin,
          price: service.price,
          clientName,
          clientPhone,
          clientEmail,
          source: "WEB",
        });
      });

      const barber = allBarbers.find((b) => b.id === appointment.barberId)!;
      const emailStatus: EmailStatus = await mailer.sendBookingConfirmation(appointment, barber, service);
      return { appointment, emailStatus };
    },

    async cancelAppointment(id: string) {
      const appointment = await appointments.findById(id);
      if (!appointment) throw new DomainError("NOT_FOUND", "La reserva no existe.");
      if (appointment.status === "CANCELLED") return appointment;
      return appointments.updateStatus(id, "CANCELLED");
    },
  };
}

export type BookingService = ReturnType<typeof createBookingService>;
